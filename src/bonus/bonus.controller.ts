import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { AuthorizedProfile } from '../lib/decorators/authorized-profile.decorator';
import { TelegramAuthGuard } from '../auth/guards/telegram.auth.guard';

@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @UseGuards(TelegramAuthGuard)
  @Get('/referrals-client/:userId')
  getReferralsClient(
    @AuthorizedProfile() userId: string,
    @Query('page') page: number = 1,
    @Query('pageCount') pageCount: number = 1,
  ) {
    return this.bonusService.getReferralsClient({ userId, page, pageCount });
  }

  @Get('/level-info')
  getLevelInfo() {
    return this.bonusService.getBonusLevels();
  }

  @UseGuards(TelegramAuthGuard)
  @Get('/referrals-count')
  getReferralsCount(@AuthorizedProfile() userId: string) {
    return this.bonusService.getNumberOfReferralsForUser(userId);
  }
}
