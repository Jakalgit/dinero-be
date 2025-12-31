import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { GameAction } from '../lib/game/models/game-action.model';
import { GameSetting } from '../lib/game/models/game-setting.model';
import { CLASSIC_GAME_FLOW } from '../lib/game/constants/classic-game-flow.constant';
import { DiceService } from './classic-games-flows/dice/dice.service';
import { CryptoGeneratorService } from './crypto-generator/crypto.generator.service';
import { ClassicSupportService } from './classic-games-flows/classic.support.service';
import { GameClassicService } from './game.classic.service';
import { WalletModule } from '../wallet/wallet.module';
import { WheelService } from './classic-games-flows/wheel/wheel.service';
import { NativeHashModule } from '../native-hash/native-hash.module';
import { KenoService } from './classic-games-flows/keno/keno.service';

@Module({
  imports: [
    SequelizeModule.forFeature([GameAction, GameSetting]),
    WalletModule,
    NativeHashModule,
  ],
  controllers: [GameController],
  providers: [
    GameService,
    CryptoGeneratorService,
    ClassicSupportService,
    GameClassicService,
    {
      provide: CLASSIC_GAME_FLOW,
      useFactory: (...flows) => flows,
      inject: [DiceService, WheelService, KenoService],
    },
    DiceService,
    WheelService,
    KenoService,
  ],
})
export class GameModule {}
