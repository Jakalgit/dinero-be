import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ToggleNicknameVisibilityDto } from './dto/toggle-nickname-visiblity.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';
import { TelegramAuthGuard } from '../auth/guards/telegram.auth.guard';
import { AuthorizedProfile } from '../lib/decorators/authorized-profile.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(TelegramAuthGuard)
  @Get('/client-info')
  getUserInfoForClient(@AuthorizedProfile() userId: string) {
    return this.userService.getUserInfoForClient(userId);
  }

  @UseGuards(TelegramAuthGuard)
  @Post('/toggle-nickname-visibility')
  toggleNicknameVisibility(
    @AuthorizedProfile() userId: string,
    @Body() dto: ToggleNicknameVisibilityDto,
  ) {
    return this.userService.toggleNicknameVisibility(userId, dto.visibility);
  }

  @UseGuards(TelegramAuthGuard)
  @Post('/update-nickname/:userId')
  updateUserNickname(
    @AuthorizedProfile() userId: string,
    @Body() dto: UpdateNicknameDto,
  ) {
    return this.userService.updateUserNickname(userId, dto.nickname);
  }
}
