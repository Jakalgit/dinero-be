import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthHeaderPrefixEnum } from '../../lib/auth/enums/auth-header-prefix.enum';
import { ConfigService } from '@nestjs/config';
import { validate } from '@telegram-apps/init-data-node';

@Injectable()
export class TelegramAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();

    try {
      const authHeader = req.headers['authorization'];
      const bearer = authHeader.split(' ')[0];
      const queryData = authHeader.split(' ')[1];
      const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

      if (bearer !== AuthHeaderPrefixEnum.TELEGRAM_BEARER || !queryData) {
        throw new UnauthorizedException();
      }

      validate(queryData, botToken);

      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
