import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthHeaderPrefixEnum } from '../../lib/auth/enums/auth-header-prefix.enum';
import { ConfigService } from '@nestjs/config';
import { parse, validate } from '@telegram-apps/init-data-node';
import { UserService } from '../../user/user.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        return false;
      }

      const bearer = authHeader.split(' ')[0];
      const queryData = authHeader.split(' ')[1];
      const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

      if (bearer !== AuthHeaderPrefixEnum.TELEGRAM_BEARER || !queryData) {
        throw new UnauthorizedException();
      }

      if (process.env.NODE_ENV === 'production') {
        validate(queryData, botToken);
      }
      const data = parse(queryData);

      let userId: string;

      if (await this.redisService.exists(`userId:${data.user.id}`)) {
        userId = await this.redisService.get(`userId:${data.user.id}`);
      } else {
        const userInfo = await this.userService.getUsersInternal({
          where: {
            telegramId: data.user.id,
          },
          raw: true,
        });

        userId = userInfo[0].id;
        await this.redisService.set(`userId:${data.user.id}`, userId, 3600);
      }

      req.account = { uuid: userId };

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
