import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Wallet } from '../lib/wallet/models/wallet.model';
import { WalletAuditLog } from '../lib/wallet/models/wallet-audit-log.model';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { WalletLogEnum } from '../lib/wallet/enums/wallet-log.enum';
import { unitsToMC } from '../lib/conversion/units-to-ms';
import { TransferEnum } from '../lib/wallet/enums/transfer.enum';
import { PaymentService } from '../payment/payment.service';
import { PaymentGettersService } from '../payment/payment.getters.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet)
    private readonly walletRepository: typeof Wallet,
    @InjectModel(WalletAuditLog)
    private readonly walletAuditLogRepository: typeof WalletAuditLog,
    private readonly paymentService: PaymentService,
    private readonly paymentGettersService: PaymentGettersService,
  ) {}

  async findOrCreateWalletForUser({
    userId,
    transaction,
  }: {
    userId: string;
    transaction: Transaction;
  }) {
    let wallet = await this.walletRepository.findOne({ where: { userId } });

    const promises: Promise<any>[] = [];

    if (!wallet) {
      wallet = await this.walletRepository.create(
        {
          wager: 0,
          userId,
        },
        { transaction },
      );

      promises.push(
        this.walletAuditLogRepository.create(
          {
            logType: WalletLogEnum.CREATED,
            walletId: wallet.dataValues.id,
            description: `Created wallet for user ${userId}`,
            transferType: TransferEnum.NONE,
          },
          { transaction },
        ),
      );
    }

    promises.push(
      this.paymentService.linkCryptoWalletsToUser({
        walletId: wallet.dataValues.id,
        transaction,
      }),
    );

    await Promise.all(promises);

    return {
      ...wallet.dataValues,
      balance: unitsToMC(wallet.dataValues.balance),
      freezeBalance: unitsToMC(wallet.dataValues.freezeBalance),
      withdrawalLimit: unitsToMC(wallet.dataValues.withdrawalLimit),
      wager: unitsToMC(wallet.dataValues.wager),
    };
  }

  async getWalletInfo({
    userId,
    internal,
  }: {
    userId: string;
    internal?: boolean;
  }) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
      raw: true,
      ...(!internal && { attributes: ['id', 'balance', 'wager'] }),
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return {
      ...wallet,
      balance: unitsToMC(wallet.balance),
      wager: unitsToMC(wallet.wager),
    };
  }

  async getWalletLogsInternal(
    userIds: string[],
    whereOptions?: WhereOptions<WalletAuditLog>,
  ) {
    const wallets = await this.walletRepository.findAll({
      where: {
        userId: { [Op.or]: userIds },
      },
      raw: true,
    });

    if (wallets.length === 0) {
      return;
    }

    const logs = await this.walletAuditLogRepository.findAll({
      where: {
        ...whereOptions,
        walletId: { [Op.or]: wallets.map((el) => el.id) },
      },
      raw: true,
    });

    return logs.map((el) => {
      const wallet = wallets.find((w) => w.id === el.walletId);
      return {
        ...el,
        userId: wallet.userId,
      };
    });
  }

  async getWalletLogsForClient(
    walletId: string,
    logType:
      | WalletLogEnum.DEPOSIT
      | WalletLogEnum.BONUS
      | WalletLogEnum.WITHDRAWAL,
    page: number,
    pageCount: number,
  ) {
    if (
      ![
        WalletLogEnum.DEPOSIT,
        WalletLogEnum.BONUS,
        WalletLogEnum.WITHDRAWAL,
      ].includes(logType)
    ) {
      throw new BadRequestException('Invalid log type');
    }

    const walletLogs = await this.walletAuditLogRepository.findAndCountAll({
      where: { walletId, logType },
      raw: true,
      limit: pageCount,
      offset: (page - 1) * pageCount,
      attributes: [
        'original_amount',
        'description',
        'bonus_type',
        'transfer_type',
        'createdAt',
      ],
    });

    // Общее количество записей
    const totalRecords = walletLogs.count;

    // Общее количество страниц
    const totalPages = Math.ceil(totalRecords / pageCount);

    return {
      records: walletLogs.rows.map((el) => ({
        ...el,
        originalAmount: unitsToMC(el.originalAmount),
      })),
      totalPages,
    };
  }

  async getCryptoAddresses(userId: string) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
      raw: true,
    });
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return await this.paymentGettersService.getCryptoAddresses(wallet.id);
  }
}
