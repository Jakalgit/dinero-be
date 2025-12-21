import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Referral } from '../lib/bonus/models/referral.model';
import { WalletService } from '../wallet/wallet.service';
import { WalletLogEnum } from '../lib/wallet/enums/wallet-log.enum';
import { BonusEnum } from '../lib/bonus/enums/bonus.enum';
import { UserService } from '../user/user.service';
import { col, fn, Op } from 'sequelize';
import { ReferralStatusEnum } from '../lib/bonus/enums/referral-status.enum';
import Decimal from 'decimal.js';
import { unitsToMC } from '../lib/conversion/units-to-ms';
import { ReferralLevel } from '../lib/bonus/models/referral-level.model';

@Injectable()
export class BonusService implements OnModuleInit {
  constructor(
    @InjectModel(Referral)
    private readonly referralRepository: typeof Referral,
    @InjectModel(ReferralLevel)
    private readonly referralLevelRepository: typeof ReferralLevel,
    private readonly walletService: WalletService,
    private readonly userService: UserService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initLevels();
  }

  private async initLevels() {
    const levels = await this.referralLevelRepository.findAll({ raw: true });

    if (levels.length > 0) return;

    await this.referralLevelRepository.bulkCreate([
      {
        bonusPercent: 2,
        referralsCount: 0,
      },
      {
        bonusPercent: 3,
        referralsCount: 15,
      },
      {
        bonusPercent: 5,
        referralsCount: 30,
      },
      {
        bonusPercent: 8,
        referralsCount: 50,
      },
      {
        bonusPercent: 10,
        referralsCount: 100,
      },
    ]);
  }

  async getReferralsClient({
    userId,
    page,
    pageCount,
  }: {
    userId: string;
    page: number;
    pageCount: number;
  }) {
    // Ищем все рефералы для данного владельца
    const referrals = await this.referralRepository.findAndCountAll({
      where: { referrerId: userId, status: ReferralStatusEnum.ACTIVE },
      raw: true,
      limit: pageCount,
      offset: (page - 1) * pageCount,
    });

    // Получаем массив id рефералов
    const referredIds = referrals.rows.map((el) => el.referredId);

    if (referredIds.length === 0) {
      return {
        records: [],
        totalPages: 1,
      };
    }

    const [bonusLogs, users] = await Promise.all([
      // Получаем записи начисления бонусов
      await this.walletService.getWalletLogsInternal(referredIds, {
        logType: WalletLogEnum.BONUS,
        bonusType: BonusEnum.REFERRAL,
      }),
      // Получаем данные о пользователях
      await this.userService.getUsersInternal({
        where: {
          id: { [Op.or]: referredIds },
        },
      }),
    ]);

    // Общее количество записей
    const totalRecords = referrals.count;

    // Общее количество страниц
    const totalPages = Math.ceil(totalRecords / pageCount);

    const records = users.map((user) => {
      const logs = bonusLogs.filter((el) => el.userId === user.id);
      const totalAmount = logs.reduce(
        (acc: Decimal, el) => acc.add(el.originalAmount),
        new Decimal(0),
      );

      return {
        nickname: user.nickname,
        regDate: user.createdAt,
        totalIncome: unitsToMC(totalAmount.toNumber()),
      };
    });

    return {
      records,
      totalPages,
    };
  }

  async getNumberOfReferralsForUser(userId: string) {
    const result = (await this.referralRepository.findAll({
      where: { referrerId: userId },
      attributes: [[fn('COUNT', col('referrer_id')), 'count']],
      group: ['referrer_id'],
      raw: true,
    })) as unknown as { count: number }[];

    if (result.length === 0) {
      return 0;
    } else {
      return result[0].count;
    }
  }

  async getBonusLevels() {
    return await this.referralLevelRepository.findAll({
      order: [['referrals_count', 'ASC']],
    });
  }
}
