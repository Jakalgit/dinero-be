import {
  BadRequestException,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CountryTransferSetting } from '../lib/payment/models/country-transfer-setting.model';
import { PaymentMethodEnum } from '../lib/payment/enums/payment-method.enum';
import { Op, Transaction } from 'sequelize';
import { PAYMENT_FLOW } from '../lib/payment/constants/payment-flow.constants';
import { ICryptoCurrencyFlow } from '../lib/payment/interfaces/crypto-currency-flow.interface';
import {
  BlockchainAddress,
  BlockchainAddressCreationAttrs,
} from '../lib/payment/models/blockchain-address.model';
import { BlockchainWalletEnum } from '../lib/payment/enums/blockchain-wallet.enum';
import { CryptoNetworkEnum } from '../lib/payment/enums/crypto/crypto-network.enum';
import { NETWORK_FLOW } from '../lib/payment/constants/network-flow.constants';
import { ICryptoNetworkFlow } from '../lib/payment/interfaces/crypto-network-flow.interface';
import { ConfigService } from '@nestjs/config';
import { CryptoEncryption } from '../lib/crypto-encryption.util';
import { CryptoCurrencyEnum } from '../lib/payment/enums/crypto/crypto-currency.enum';

@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(
    @InjectModel(CountryTransferSetting)
    private readonly countryTransferSettingRepository: typeof CountryTransferSetting,
    @InjectModel(BlockchainAddress)
    private readonly blockchainAddressRepository: typeof BlockchainAddress,
    @Inject(PAYMENT_FLOW)
    private readonly paymentFlows: ICryptoCurrencyFlow[],
    @Inject(NETWORK_FLOW)
    private readonly networkFlows: ICryptoNetworkFlow[],
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initValues();
  }

  private async initValues() {
    const methods = await this.countryTransferSettingRepository.findAll({
      raw: true,
    });

    if (methods.length !== 0) return;

    await this.countryTransferSettingRepository.create({
      country: 'default',
      transferDirection: null,
      paymentMethods: [
        {
          cryptoCurrencies: [CryptoCurrencyEnum.USDT],
          type: PaymentMethodEnum.CRYPTO,
          commission: -5,
        },
      ],
    });
  }

  async linkCryptoWalletsToUser({
    walletId,
    transaction,
  }: {
    walletId: string;
    transaction?: Transaction;
  }) {
    const [availableAddresses, linkedAddresses] = await Promise.all([
      this.blockchainAddressRepository.findAll({
        where: {
          type: BlockchainWalletEnum.USER,
          walletId: null,
          active: true,
        },
        raw: true,
      }),
      this.blockchainAddressRepository.findAll({
        where: {
          type: BlockchainWalletEnum.USER,
          walletId,
          active: true,
        },
        raw: true,
      }),
    ]);

    const networks = Object.values(CryptoNetworkEnum).filter(
      (el) => !linkedAddresses.find((l) => l.network === el),
    );

    if (networks.length === 0) return;

    const addressesIdsForUpdate: number[] = [];
    const addressesBulkCreateAttrs: BlockchainAddressCreationAttrs[] = [];

    for (const network of networks) {
      const existAddress = availableAddresses.find(
        (address) => address.network === network,
      );

      if (existAddress) {
        addressesIdsForUpdate.push(existAddress.id);
      } else {
        const networkFlow = this.networkFlows.find((fl) =>
          fl.isSupported(network),
        );
        if (!networkFlow) {
          throw new BadRequestException(
            `Network flow for ${network} not found`,
          );
        }

        const blockchainWallet = await networkFlow.createWallet();
        const key = this.configService.get<string>(
          'PRIVATE_KEY_ENCRYPTION_SECRET',
        );

        const { encryptedData, iv, tag } = CryptoEncryption.encrypt(
          blockchainWallet.privateKey,
          key,
        );

        addressesBulkCreateAttrs.push({
          address: blockchainWallet.address,
          addressHex: blockchainWallet.addressHex,
          encryptedPrivateKey: `${iv}:${tag}:${encryptedData}`,
          network,
          active: true,
          type: BlockchainWalletEnum.USER,
        });
      }
    }

    const promises: Promise<any>[] = [];

    if (addressesIdsForUpdate.length !== 0) {
      promises.push(
        this.blockchainAddressRepository.update(
          {
            walletId,
          },
          { where: { id: { [Op.or]: addressesIdsForUpdate } }, transaction },
        ),
      );
    }

    if (addressesBulkCreateAttrs.length !== 0) {
      promises.push(
        this.blockchainAddressRepository.bulkCreate(addressesBulkCreateAttrs, {
          transaction,
        }),
      );
    }

    await Promise.all(promises);
  }
}
