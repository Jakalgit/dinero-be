import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Wallet } from '../lib/wallet/models/wallet.model';
import { WalletAuditLog } from '../lib/wallet/models/wallet-audit-log.model';
import { PaymentModule } from '../payment/payment.module';
import { WalletSupportService } from "./wallet.support.service";

@Module({
  imports: [
    SequelizeModule.forFeature([Wallet, WalletAuditLog]),
    PaymentModule,
  ],
  controllers: [WalletController],
  providers: [
    WalletService,
    WalletSupportService,
  ],
  exports: [WalletService, WalletSupportService],
})
export class WalletModule {}
