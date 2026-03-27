import { Injectable, OnModuleInit } from '@nestjs/common';
import { IClassicGameFlow } from '../../../lib/game/interfaces/i-classic-game.flow';
import { ClassicSupportService } from '../classic.support.service';
import { NativeHashService } from '../../../native-hash/native-hash.service';
import { Sequelize } from 'sequelize-typescript';
import { ClassicGameIdEnum } from '../../../lib/game/enums/classic-game-id.enum';
import { PlayLimboDto } from './dto/play-limbo.dto';
import { PlayKenoDto } from '../keno/dto/play-keno.dto';
import Decimal from 'decimal.js';
import { Transaction } from 'sequelize';
import { InjectPinoLogger, Logger } from 'nestjs-pino';
import ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;
import { AMOUNT_PRECISION_SERVER } from '../../../lib/precision/precision';

@Injectable()
export class LimboService implements IClassicGameFlow, OnModuleInit {
  constructor(
    private readonly classicSupportService: ClassicSupportService,
    private readonly nativeHashService: NativeHashService,
    private readonly sequelize: Sequelize,
    @InjectPinoLogger(LimboService.name)
    private readonly logger: Logger,
  ) {}

  private readonly GAME_ID = ClassicGameIdEnum.LIMBO;

  isSupport(gameId: string): boolean {
    return gameId === this.GAME_ID;
  }

  async onModuleInit(): Promise<void> {
    await this.classicSupportService.createGameSettingRecord(
      this.GAME_ID,
      'Limbo',
    );
  }

  private async play(dto: PlayLimboDto) {
    const { userId, userCoefficient, stakeAmount } = dto;

    // Переводим сумму ставки в Decimal
    const decimalStakeAmount = new Decimal(stakeAmount);

    // Проверяем допустимые значения ставки
    await this.classicSupportService.walletInfoWithCheck({
      userId,
      gameId: ClassicGameIdEnum.WHEEL,
      decimalStakeAmount: decimalStakeAmount,
    });

    const transaction = await this.sequelize.transaction({
      isolationLevel: ISOLATION_LEVELS.REPEATABLE_READ,
    });

    try {
      // Генерируем результат
      const decimalLimboResult = await this.generateLimboValue({
        userId,
        transaction,
      });
      // Считаем изменения баланса после игры
      const decimalBalanceDiff = this.calcGameResult({
        userNumber: new Decimal(userCoefficient),
        resultNumber: decimalLimboResult,
        stakeAmount: decimalStakeAmount,
      });

      // Сохраняем результат игры
      const result = await this.classicSupportService.saveGameResult({
        userId,
        stakeAmount: decimalStakeAmount,
        balanceDiff: decimalBalanceDiff,
        gameId: ClassicGameIdEnum.LIMBO,
        transaction,
      });

      await transaction.commit();

      // Возвращаем данные клиенту
      return {
        ...result,
        result: decimalLimboResult.toNumber(),
      };
    } catch (error) {
      await transaction.rollback();
      this.logger.error({ dto, error }, `Failed play game ${this.GAME_ID}`);
    }
  }

  private calcGameResult({
    userNumber,
    resultNumber,
    stakeAmount,
  }: {
    userNumber: Decimal;
    resultNumber: Decimal;
    stakeAmount: Decimal;
  }) {
    if (resultNumber.greaterThanOrEqualTo(userNumber)) {
      return stakeAmount
        .mul(new Decimal(userNumber).minus(1))
        .toDecimalPlaces(AMOUNT_PRECISION_SERVER, Decimal.ROUND_DOWN);
    } else {
      return stakeAmount
        .mul(-1)
        .toDecimalPlaces(AMOUNT_PRECISION_SERVER, Decimal.ROUND_DOWN);
    }
  }

  private async generateLimboValue({
    k = 0.99,
    userId,
    transaction,
  }: {
    k?: number;
    userId: string;
    transaction: Transaction;
  }) {
    // Получаем байты
    const [bytes] = await this.nativeHashService.getBytesFromHash({
      userId,
      transaction,
    });

    // Получаем игровое число
    const result = this.nativeHashService.calcNumberFromBytes({
      bytes,
      multiplier: 16777216,
    });

    return new Decimal(16777216)
      .dividedBy(new Decimal(result).plus(1))
      .mul(k)
      .toDecimalPlaces(2);
  }

  async tryPlayGame(requestBody: any) {
    return await this.classicSupportService.tryPlayGameTemplate(
      requestBody,
      PlayKenoDto,
      this.play.bind(this),
    );
  }
}
