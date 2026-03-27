import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../lib/user/models/user.model';
import { UserAuditLog } from '../lib/user/models/user-audit-log.model';
import { FindOptions, Transaction } from 'sequelize';
import { WalletService } from '../wallet/wallet.service';
import { NativeHashService } from '../native-hash/native-hash.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userRepository: typeof User,
    @InjectModel(UserAuditLog)
    private readonly userAuditLogRepository: typeof UserAuditLog,
    private readonly walletService: WalletService,
    private readonly nativeHashService: NativeHashService,
  ) {}

  async findOrCreateTelegramUser({
    telegramId,
    nickname,
    transaction,
  }: {
    telegramId: number;
    nickname: string;
    transaction: Transaction;
  }): Promise<{ userId: string; balance: number; created: boolean }> {
    const [user, created] = await this.userRepository.findOrCreate({
      where: { telegramId },
      defaults: { telegramId, nickname, isSubscribedToNewsletter: false },
      transaction,
    });

    const promises: Promise<any>[] = [];

    if (created) {
      promises.push(
        this.userAuditLogRepository.create(
          {
            userId: user.dataValues.id,
            description: 'Created new user through Telegram Web Application',
          },
          { transaction },
        ),
      );
    }

    promises.push(
      this.nativeHashService.generateHashPair({
        userId: user.dataValues.id,
        transaction,
      }),
    );

    await Promise.all(promises);

    const wallet = await this.walletService.findOrCreateWalletForUser({
      userId: user.dataValues.id,
      transaction,
    });

    return {
      userId: user.dataValues.id,
      balance: Number(wallet.balance),
      created,
    };
  }

  async getUserInfoForClient(userId: string) {
    const user = await this.userRepository.findByPk(userId, { raw: true });

    if (!user) {
      throw new NotFoundException('User with such ID does not exist');
    }

    return user;
  }

  async getUsersInternal(options?: FindOptions<User>) {
    return await this.userRepository.findAll(options);
  }

  async toggleNicknameVisibility(userId: string, visibility: boolean) {
    const user = await this.userRepository.findByPk(userId, { raw: true });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    await this.userRepository.update(
      { visibleNickname: visibility },
      { where: { id: userId } },
    );

    return { ...user, visibleNickname: visibility };
  }

  async updateUserNickname(userId: string, nickname: string) {
    const user = await this.getUserInfoForClient(userId);

    await this.userRepository.update({ nickname }, { where: { id: userId } });

    return { ...user, nickname };
  }
}
