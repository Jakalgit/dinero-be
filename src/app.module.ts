import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { WalletModule } from './wallet/wallet.module';
import { BonusModule } from './bonus/bonus.module';
import * as path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import pg from 'pg';
import { Wallet } from './lib/wallet/models/wallet.model';
import { WalletAuditLog } from './lib/wallet/models/wallet-audit-log.model';
import { AuthIdentity } from './lib/auth/models/auth-identity.model';
import { Session } from './lib/auth/models/session.model';
import { User } from './lib/user/models/user.model';
import { UserAuditLog } from './lib/user/models/user-audit-log.model';
import { GameAction } from './lib/game/models/game-action.model';
import { GameSetting } from './lib/game/models/game-setting.model';
import { Referral } from './lib/bonus/models/referral.model';
import { ReferralLevel } from "./lib/bonus/models/referral-level.model";
import { PaymentModule } from './payment/payment.module';
import { CryptoModule } from './crypto/crypto.module';
import { BlockchainAddress } from "./lib/payment/models/blockchain-address.model";
import { BlockchainTransaction } from "./lib/payment/models/blockchain-transaction.model";
import { LiquidityTransfer } from "./lib/payment/models/liquidity-transfer.model";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [path.join(__dirname, '../.env')],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        dialectModule: pg,
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        models: [
          Wallet,
          WalletAuditLog,
          AuthIdentity,
          Session,
          User,
          UserAuditLog,
          GameAction,
          GameSetting,
          Referral,
          ReferralLevel,
          BlockchainAddress,
          BlockchainTransaction,
          LiquidityTransfer,
        ],
        autoLoadModels: true,
      }),
    }),
    AuthModule,
    UserModule,
    GameModule,
    WalletModule,
    BonusModule,
    PaymentModule,
    CryptoModule,
  ],
})
export class AppModule {}
