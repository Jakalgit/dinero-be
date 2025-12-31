import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { PlayDiceDto } from './dto/play-dice.dto';
import Decimal from 'decimal.js';
import { DiceGameModeEnum } from '../../../lib/game/enums/dice/dice-game-mode.enum';
import { ClassicGameIdEnum } from '../../../lib/game/enums/classic-game-id.enum';
import { ClassicSupportService } from '../classic.support.service';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { AMOUNT_PRECISION_SERVER } from '../../../lib/precision/precision';
import { IClassicGameFlow } from '../../../lib/game/interfaces/i-classic-game.flow';
import ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;
import { NativeHashService } from '../../../native-hash/native-hash.service';

@Injectable()
export class DiceService implements IClassicGameFlow, OnModuleInit {
  constructor(
    private readonly classicSupportService: ClassicSupportService,
    private readonly sequelize: Sequelize,
    private readonly nativeHashService: NativeHashService,
  ) {}

  private GAME_ID: string = ClassicGameIdEnum.DICE;

  async onModuleInit(): Promise<void> {
    await this.classicSupportService.createGameSettingRecord(
      this.GAME_ID,
      'Dice',
    );
  }

  private async play(dto: PlayDiceDto) {
    const { stakeAmount, userId, mode, userNumber } = dto;

    // Переводим пользовательский порог в Decimal
    const decimalUserNumber = new Decimal(userNumber);
    // Переводим сумму ставки в Decimal
    const decimalStakeAmount = new Decimal(stakeAmount);

    // Проверяем допустимые значения
    if (
      (mode === DiceGameModeEnum.LESS &&
        (decimalUserNumber.lessThan(0.01) ||
          decimalUserNumber.greaterThan(98))) ||
      (mode === DiceGameModeEnum.GREATER &&
        (decimalUserNumber.lessThan(2) || decimalUserNumber.greaterThan(99.99)))
    ) {
      throw new BadRequestException('Bad user number value');
    }

    // Проверяем допустимые значения ставки
    await this.classicSupportService.walletInfoWithCheck({
      userId,
      gameId: ClassicGameIdEnum.DICE,
      decimalStakeAmount: decimalStakeAmount,
    });

    const transaction = await this.sequelize.transaction({
      isolationLevel: ISOLATION_LEVELS.SERIALIZABLE,
    });

    try {
      const decimalDiceResult = await this.generateDiceResult({
        userId,
        transaction,
      });
      const decimalBalanceDiff = this.calcGameResult({
        userNumber: decimalUserNumber,
        resultNumber: decimalDiceResult,
        mode,
        stakeAmount: decimalStakeAmount,
      });

      const result = await this.classicSupportService.saveGameResult({
        userId,
        stakeAmount: decimalStakeAmount,
        balanceDiff: decimalBalanceDiff,
        gameId: ClassicGameIdEnum.DICE,
        transaction,
      });

      await transaction.commit();

      return {
        ...result,
        result: decimalDiceResult.toNumber(),
      };
    } catch (error) {
      await transaction.rollback();
      console.log(error);
      throw error;
    }
  }

  private async generateDiceResult({
    userId,
    transaction,
  }: {
    userId: string;
    transaction: Transaction;
  }) {
    const [bytes] = await this.nativeHashService.getBytesFromHash({
      userId,
      transaction,
    });

    const result = this.nativeHashService.calcNumberFromBytes({
      bytes,
      multiplier: 10001,
    });

    return new Decimal(result).dividedBy(100).toDecimalPlaces(2);
  }

  private calcGameResult({
    userNumber,
    resultNumber,
    mode,
    stakeAmount,
  }: {
    userNumber: Decimal;
    resultNumber: Decimal;
    mode: DiceGameModeEnum;
    stakeAmount: Decimal;
  }) {
    switch (mode) {
      case DiceGameModeEnum.LESS:
        userNumber = userNumber.toDecimalPlaces(2, Decimal.ROUND_DOWN);
        break;
      case DiceGameModeEnum.GREATER:
        userNumber = userNumber.toDecimalPlaces(2, Decimal.ROUND_UP);
        break;
      default:
        break;
    }

    let balanceDiff: Decimal;
    const decimalCoefficient = this.calculateDiceCoefficient({
      rtp: 0.99,
      userNumber:
        mode === DiceGameModeEnum.LESS
          ? userNumber
          : userNumber.mul(-1).plus(100),
    });

    if (
      (mode === DiceGameModeEnum.GREATER &&
        userNumber.lessThan(resultNumber)) ||
      (mode === DiceGameModeEnum.LESS && userNumber.greaterThan(resultNumber))
    ) {
      // ( stakeAmount * (coefficient - 1) ).toFixed(2)
      balanceDiff = stakeAmount
        .mul(decimalCoefficient.minus(1))
        .toDecimalPlaces(AMOUNT_PRECISION_SERVER, Decimal.ROUND_DOWN);
    } else {
      // -1 * stakeAmount
      balanceDiff = stakeAmount
        .mul(-1)
        .toDecimalPlaces(AMOUNT_PRECISION_SERVER, Decimal.ROUND_DOWN);
    }

    return balanceDiff;
  }

  private calculateDiceCoefficient({
    rtp,
    userNumber,
  }: {
    rtp: number;
    userNumber: Decimal;
  }) {
    // ( (k * 100) / userNumber ).toFixed(4)
    return new Decimal(rtp)
      .mul(100)
      .dividedBy(userNumber)
      .toDecimalPlaces(4, Decimal.ROUND_DOWN);
  }

  isSupport(gameId: string): boolean {
    return gameId === this.GAME_ID;
  }

  async tryPlayGame(requestBody: any): Promise<any> {
    return await this.classicSupportService.tryPlayGameTemplate(
      requestBody,
      PlayDiceDto,
      this.play.bind(this),
    );
  }
}
