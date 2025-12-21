import { Controller, Get, Param, Query } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletLogEnum } from '../lib/wallet/enums/wallet-log.enum';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('/client-info/:userId')
  getWalletInfoForClient(@Param('userId') userId: string) {
    return this.walletService.getWalletInfo({ userId });
  }

  @Get('/logs/client-info/:walletId')
  getWalletActionsClientInfo(
    @Param('walletId') walletId: string,
    @Query('log_type')
    logType:
      | WalletLogEnum.DEPOSIT
      | WalletLogEnum.BONUS
      | WalletLogEnum.WITHDRAWAL = WalletLogEnum.DEPOSIT,
    @Query('page') page: number = 1,
    @Query('pageCount') pageCount: number = 6,
  ) {
    return this.walletService.getWalletLogsForClient(
      walletId,
      logType,
      page,
      pageCount,
    );
  }

  @Get('/crypto-addresses/:userId')
  getCryptoAddresses(@Param('userId') userId: string) {
    return this.walletService.getCryptoAddresses(userId);
  }
}
