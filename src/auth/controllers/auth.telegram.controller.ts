import { Body, Controller, Post } from '@nestjs/common';
import { TelegramAuthDto } from '../dto/telegram-auth.dto';
import { AuthTelegramService } from '../services/auth.telegram.service';

@Controller('tg-auth')
export class AuthTelegramController {
  constructor(private readonly authTelegramService: AuthTelegramService) {}

  @Post('/master-authentication')
  mainAuthentication(@Body() dto: TelegramAuthDto) {
    return this.authTelegramService.handleMainAuthRequest(dto);
  }
}
