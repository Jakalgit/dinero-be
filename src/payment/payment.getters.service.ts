import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { TransferDirectionEnum } from '../lib/payment/enums/transfer-direction.enum';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { CountryTransferSetting } from '../lib/payment/models/country-transfer-setting.model';
import { PaymentService } from './payment.service';
import { Sequelize } from 'sequelize-typescript';
import { BlockchainAddress } from '../lib/payment/models/blockchain-address.model';
import { BlockchainWalletEnum } from '../lib/payment/enums/blockchain-wallet.enum';
import { PAYMENT_FLOW } from '../lib/payment/constants/payment-flow.constants';
import { ICryptoCurrencyFlow } from '../lib/payment/interfaces/crypto-currency-flow.interface';
import { CryptoCurrencyEnum } from '../lib/payment/enums/crypto/crypto-currency.enum';

@Injectable()
export class PaymentGettersService {
  constructor(
    @InjectModel(CountryTransferSetting)
    private readonly countryTransferSettingRepository: typeof CountryTransferSetting,
    @InjectModel(BlockchainAddress)
    private readonly blockchainAddressRepository: typeof BlockchainAddress,
    @Inject(PAYMENT_FLOW)
    private readonly paymentFlows: ICryptoCurrencyFlow[],
    private readonly paymentService: PaymentService,
    private readonly sequelize: Sequelize,
  ) {}

  async getPaymentMethods(
    country: string,
    transferDirection: TransferDirectionEnum,
  ) {
    let method = await this.countryTransferSettingRepository.findOne({
      where: {
        country,
        transferDirection: {
          [Op.or]: [transferDirection, null],
        },
      },
    });

    if (!method) {
      method = await this.countryTransferSettingRepository.findOne({
        where: {
          country: 'default',
          transferDirection: {
            [Op.or]: [transferDirection, null],
          },
        },
      });
    }

    if (!method) {
      throw new NotFoundException(`Method with such parameters not found.`);
    }

    return method;
  }

  async getCryptoAddresses(walletId: string) {
    // TODO: Настроить уровень изоляции
    const transaction = await this.sequelize.transaction();

    try {
      // Проверяем, что прилинкованы все кошельки (по токену и сети) для которых описаны флоу
      await this.paymentService.linkCryptoWalletsToUser({
        walletId,
        transaction,
      });

      // Получаем все используемые токены
      const currencies = Object.values(CryptoCurrencyEnum);

      // Находим крипто-кошельки для данного пользователя
      const addresses = await this.blockchainAddressRepository.findAll({
        where: {
          walletId,
          type: BlockchainWalletEnum.USER,
          active: true,
        },
        attributes: ['address', 'network'],
        raw: true,
        transaction,
      });

      // Для каждого поддерживаемого токена
      const result = currencies.map((currency) => {
        // Ищем все флоу в разных сетях, затем получаем массив сетей в которых мы обрабатываем токен
        const supportedNetworks = this.paymentFlows
          .filter((el) => el.isSupportedCurrency(currency))
          .map((el) => el.getFlowData().network);

        return {
          currency,
          // Получаем кошельки, которые поддерживают наш токен (в разных сетях)
          addresses: addresses.filter((el) =>
            supportedNetworks.includes(el.network),
          ),
        };
      });

      await transaction.commit();

      return result;
    } catch (e) {
      await transaction.rollback();
      console.error(e);
      throw e;
    }
  }
}
