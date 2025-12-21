import { Controller, Get, Param, Query } from '@nestjs/common';
import { BonusService } from './bonus.service';

@Controller('bonus')
export class BonusController {
  constructor(private readonly bonusService: BonusService) {}

  @Get('/referrals-client/:userId')
  getReferralsClient(
    @Param('userId') userId: string,
    @Query('page') page: number = 1,
    @Query('pageCount') pageCount: number = 1,
  ) {
    return this.bonusService.getReferralsClient({ userId, page, pageCount });
  }

  @Get('/level-info')
  getLevelInfo() {
    return this.bonusService.getBonusLevels();
  }

  @Get('/referrals-count/:userId')
  getReferralsCount(@Param('userId') userId: string) {
    return this.bonusService.getNumberOfReferralsForUser(userId);
  }
}
