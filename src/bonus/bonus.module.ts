import { Module } from '@nestjs/common';
import { BonusService } from './bonus.service';
import { BonusController } from './bonus.controller';
import { WalletModule } from '../wallet/wallet.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Referral } from '../lib/bonus/models/referral.model';
import { ReferralLevel } from '../lib/bonus/models/referral-level.model';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Referral, ReferralLevel]),
    WalletModule,
    UserModule,
  ],
  providers: [BonusService],
  controllers: [BonusController],
})
export class BonusModule {}
