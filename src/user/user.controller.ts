import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ToggleNicknameVisibilityDto } from './dto/toggle-nickname-visiblity.dto';
import { UpdateNicknameDto } from './dto/update-nickname.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/client-info/:userId')
  getUserInfoForClient(@Param('userId') userId: string) {
    return this.userService.getUserInfoForClient(userId);
  }

  @Post('/toggle-nickname-visibility')
  toggleNicknameVisibility(@Body() dto: ToggleNicknameVisibilityDto) {
    return this.userService.toggleNicknameVisibility(
      dto.userId,
      dto.visibility,
    );
  }

  @Post('/update-nickname/:userId')
  updateUserNickname(
    @Param('userId') userId: string,
    @Body() dto: UpdateNicknameDto,
  ) {
    return this.userService.updateUserNickname(userId, dto.nickname);
  }
}
