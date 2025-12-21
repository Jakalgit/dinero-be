import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthIdentity } from '../lib/auth/models/auth-identity.model';
import { Session } from '../lib/auth/models/session.model';
import { UserModule } from '../user/user.module';
import { AuthTelegramController } from './controllers/auth.telegram.controller';
import { AuthTelegramService } from './services/auth.telegram.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    SequelizeModule.forFeature([AuthIdentity, Session]),
    UserModule,
    RedisModule,
  ],
  controllers: [AuthTelegramController],
  providers: [AuthTelegramService],
})
export class AuthModule {}
