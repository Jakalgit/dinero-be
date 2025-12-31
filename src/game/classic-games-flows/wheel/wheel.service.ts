import { Injectable, OnModuleInit } from '@nestjs/common';
import { IClassicGameFlow } from '../../../lib/game/interfaces/i-classic-game.flow';
import { ClassicGameIdEnum } from '../../../lib/game/enums/classic-game-id.enum';
import { ClassicSupportService } from '../classic.support.service';
import { PlayWheelDto } from './dto/play-wheel';
import Decimal from 'decimal.js';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;
import { WheelRiskEnum } from '../../../lib/game/enums/wheel/wheel-risk.enum';
import { WheelValues } from '../../../lib/game/constants/wheel-values';
import { AMOUNT_PRECISION_SERVER } from '../../../lib/precision/precision';
import { NativeHashService } from '../../../native-hash/native-hash.service';

@Injectable()
export class WheelService implements IClassicGameFlow, OnModuleInit {
  constructor(
    private readonly classicSupportService: ClassicSupportService,
    private readonly nativeHashService: NativeHashService,
    private readonly sequelize: Sequelize,
  ) {}

  private GAME_ID: string = ClassicGameIdEnum.WHEEL;

  isSupport(gameId: string): boolean {
    return gameId === this.GAME_ID;
  }

  async onModuleInit(): Promise<void> {
    await this.classicSupportService.createGameSettingRecord(
      this.GAME_ID,
      'Wheel',
    );
  }

  private async play(dto: PlayWheelDto) {
    const { userId, stakeAmount, numberOfSectors, risk } = dto;

    // Переводим сумму ставки в Decimal
    const decimalStakeAmount = new Decimal(stakeAmount);

    // Проверяем допустимые значения ставки
    await this.classicSupportService.walletInfoWithCheck({
      userId,
      gameId: ClassicGameIdEnum.WHEEL,
      decimalStakeAmount: decimalStakeAmount,
    });

    const transaction = await this.sequelize.transaction({
      isolationLevel: ISOLATION_LEVELS.SERIALIZABLE,
    });

    try {
      const wheelResultSector = await this.generateWheelResult({
        numberOfSectors,
        userId,
        transaction,
      });
      const decimalBalanceDiff = this.calcGameResult({
        wheelResultSector,
        numberOfSectors,
        risk,
        stakeAmount: decimalStakeAmount,
      });

      const result = await this.classicSupportService.saveGameResult({
        userId,
        stakeAmount: decimalStakeAmount,
        balanceDiff: decimalBalanceDiff,
        gameId: ClassicGameIdEnum.WHEEL,
        transaction,
      });

      await transaction.commit();

      return {
        ...result,
        result: wheelResultSector,
      };
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      throw error;
    }
  }

  // Генерация случайного числа (номер сектора)
  private async generateWheelResult({
    numberOfSectors,
    userId,
    transaction,
  }: {
    numberOfSectors: number;
    userId: string;
    transaction: Transaction;
  }): Promise<number> {
    const [bytes] = await this.nativeHashService.getBytesFromHash({
      userId,
      transaction,
    });

    return this.nativeHashService.calcNumberFromBytes({
      bytes,
      multiplier: numberOfSectors,
    });
  }

  // Расчёт изменения баланса
  private calcGameResult({
    wheelResultSector,
    numberOfSectors,
    risk,
    stakeAmount,
  }: {
    wheelResultSector: number;
    numberOfSectors: number;
    risk: WheelRiskEnum;
    stakeAmount: Decimal;
  }) {
    // Получаем массив коэффициентов в колесе
    const values: number[] = WheelValues[risk][numberOfSectors.toString()].map(
      (el: number) => WheelValues.codes[el],
    );

    const coefficient = values[wheelResultSector];

    // Умножаем коэффициент на ставку и возвращаем результат
    return stakeAmount
      .mul(new Decimal(coefficient).minus(1))
      .toDecimalPlaces(AMOUNT_PRECISION_SERVER);
  }

  async tryPlayGame(requestBody: any): Promise<any> {
    return await this.classicSupportService.tryPlayGameTemplate(
      requestBody,
      PlayWheelDto,
      this.play.bind(this),
    );
  }
}
