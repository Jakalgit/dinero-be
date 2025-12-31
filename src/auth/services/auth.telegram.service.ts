import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuthIdentity } from '../../lib/auth/models/auth-identity.model';
import { TelegramAuthDto } from '../dto/telegram-auth.dto';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { Sequelize } from 'sequelize-typescript';
import { AuthProviderEnum } from '../../lib/auth/enums/auth-provider.enum';
import { parse, validate } from '@telegram-apps/init-data-node';
import { TelegramInitData } from '../../lib/auth/utils/telegram.utils';
import { Transaction } from 'sequelize';
import ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;

@Injectable()
export class AuthTelegramService {
  constructor(
    @InjectModel(AuthIdentity)
    private readonly authIdentityRepository: typeof AuthIdentity,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly sequelize: Sequelize,
    // private readonly redisService: RedisService,
  ) {}

  async handleMainAuthRequest(dto: TelegramAuthDto) {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    let initData: TelegramInitData | undefined = undefined;

    try {
      if (process.env.NODE_ENV === 'production') {
        validate(dto.tgInitDataRaw, botToken);
      }
      initData = parse(dto.tgInitDataRaw);
    } catch {}

    if (!initData) {
      throw new UnauthorizedException('Fake Telegram Data');
    }

    const transaction = await this.sequelize.transaction({
      isolationLevel: ISOLATION_LEVELS.SERIALIZABLE,
    });

    try {
      const userResponse = await this.userService.findOrCreateTelegramUser({
        telegramId: initData.user.id,
        nickname: `${initData.user.first_name} ${initData.user.last_name}`,
        transaction,
      });

      const authIdentity = await this.authIdentityRepository.findOne({
        where: { userId: userResponse.userId },
      });

      if (!authIdentity) {
        await this.authIdentityRepository.create(
          {
            providerUserId: initData.user.id.toString(),
            provider: AuthProviderEnum.TELEGRAM,
            userId: userResponse.userId,
          },
          { transaction },
        );
      }

      await transaction.commit();

      return { ...userResponse, initData };
    } catch (e) {
      console.error(e);
      await transaction.rollback();
    }
  }
}
