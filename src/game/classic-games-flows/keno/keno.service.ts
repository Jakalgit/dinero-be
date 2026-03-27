import { Injectable, OnModuleInit } from '@nestjs/common';
import { IClassicGameFlow } from '../../../lib/game/interfaces/i-classic-game.flow';
import { ClassicGameIdEnum } from '../../../lib/game/enums/classic-game-id.enum';
import { ClassicSupportService } from '../classic.support.service';
import { PlayKenoDto } from './dto/play-keno.dto';
import Decimal from 'decimal.js';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import ISOLATION_LEVELS = Transaction.ISOLATION_LEVELS;
import { NativeHashService } from '../../../native-hash/native-hash.service';
import { KenoRiskEnum } from '../../../lib/game/enums/keno/keno-risk.enum';
import { KenoValues } from '../../../lib/game/constants/keno-values';
import { AMOUNT_PRECISION_SERVER } from '../../../lib/precision/precision';
import { InjectPinoLogger, Logger } from 'nestjs-pino';

@Injectable()
export class KenoService implements IClassicGameFlow, OnModuleInit {
  constructor(
    private readonly classicSupportService: ClassicSupportService,
    private readonly nativeHashService: NativeHashService,
    private readonly sequelize: Sequelize,
    @InjectPinoLogger(KenoService.name)
    private readonly logger: Logger,
  ) {}

  private readonly GAME_ID = ClassicGameIdEnum.KENO;

  isSupport(gameId: string): boolean {
    return gameId === this.GAME_ID;
  }

  async onModuleInit(): Promise<void> {
    await this.classicSupportService.createGameSettingRecord(
      this.GAME_ID,
      'Keno',
    );
  }

  private async play(dto: PlayKenoDto) {
    const { stakeAmount, risk, userValues, userId } = dto;

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
      const kenoValues = await this.generateKenoValues({ userId, transaction });
      const decimalBalanceDiff = this.calcGameResult({
        kenoValues,
        risk,
        userValues,
        stakeAmount: decimalStakeAmount,
      });

      const result = await this.classicSupportService.saveGameResult({
        userId,
        stakeAmount: decimalStakeAmount,
        balanceDiff: decimalBalanceDiff,
        gameId: ClassicGameIdEnum.KENO,
        transaction,
      });

      await transaction.commit();

      return {
        ...result,
        result: kenoValues,
      };
    } catch (error) {
      await transaction.rollback();
      this.logger.error({ dto, error }, `Failed play game ${this.GAME_ID}`);
    }
  }

  private async generateKenoValues({
    userId,
    transaction,
  }: {
    userId: string;
    transaction: Transaction;
  }) {
    // Элементы от 0 до 39 включительно
    let initialElements = new Array(40).fill(0).map((_, i) => i);
    // Выпавшие сектора
    let resultElements: number[] = [];
    // Получаем 2 массива байтов
    const [bytes1, bytes2] = await this.nativeHashService.getBytesFromHash({
      userId,
      transaction,
      indexes: [0, 1],
    });

    // Соединяем байты последовательно для удобства
    let bytes = [...bytes1, ...bytes2];

    for (let i = 0; i < 10; i++) {
      // Генерируем индекс
      const value = this.nativeHashService.calcNumberFromBytes({
        bytes,
        multiplier: initialElements.length,
      });

      // Получаем число
      resultElements.push(initialElements[value]);
      // Удаляем элемент
      initialElements = initialElements.filter(
        (el) => el !== initialElements[value],
      );

      // Обрезаем первые 4 байта
      bytes = bytes.slice(4, bytes.length);
    }

    // Увеличиваем элементы на 1
    resultElements = resultElements.map((el) => el + 1);

    return resultElements;
  }

  private calcGameResult({
    kenoValues,
    risk,
    userValues,
    stakeAmount,
  }: {
    kenoValues: number[];
    risk: KenoRiskEnum;
    userValues: number[];
    stakeAmount: Decimal;
  }) {
    if (userValues.length === 0 || userValues.length > 10) userValues = [-1];

    // Получаем массив коэффициентов
    const gameCoefficients = KenoValues[risk][userValues.length - 1];

    const matches = new Set<number>([]);

    // Добавляем все совпадения в набор
    userValues.forEach((value) => {
      if (kenoValues.includes(value)) matches.add(value);
    });

    // Получаем коэффициент в зависимости от совпадений
    const coefficient = gameCoefficients[Number(matches.size)];

    // Умножаем коэффициент на ставку и возвращаем результат
    return stakeAmount
      .mul(new Decimal(coefficient).minus(1))
      .toDecimalPlaces(AMOUNT_PRECISION_SERVER);
  }

  async tryPlayGame(requestBody: any) {
    return await this.classicSupportService.tryPlayGameTemplate(
      requestBody,
      PlayKenoDto,
      this.play.bind(this),
    );
  }
}
