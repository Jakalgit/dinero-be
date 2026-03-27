import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { NativeHash } from '../lib/native-hash/models/native-hash.model';
import { Transaction } from 'sequelize';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import Decimal from 'decimal.js';
import { InjectPinoLogger, Logger } from 'nestjs-pino';

@Injectable()
export class NativeHashService {
  constructor(
    @InjectModel(NativeHash)
    private readonly nativeHashRepository: typeof NativeHash,
    private readonly configService: ConfigService,
    @InjectPinoLogger(NativeHashService.name)
    private readonly logger: Logger,
  ) {}

  async generateHashPair({
    userId,
    transaction,
  }: {
    userId: string;
    transaction: Transaction;
  }) {
    const clientSeed = crypto
      .createHmac('sha256', Date.now().toString())
      .update(`${userId}:client`)
      .digest('hex');

    const serverSeed = crypto
      .createHmac('sha256', Date.now().toString())
      .update(`${userId}:server`)
      .digest('hex');

    await this.nativeHashRepository.findOrCreate({
      where: { userId },
      defaults: { userId, clientSeed, serverSeed },
      raw: true,
      transaction,
    });
  }

  async getBytesFromHash({
    userId,
    transaction,
    indexes = [0],
  }: {
    userId: string;
    transaction?: Transaction;
    indexes?: number[];
  }): Promise<number[][]> {
    // TODO: Рассмотреть хеширование
    const hashPair = await this.nativeHashRepository.findOne({
      where: { userId },
      raw: true,
      transaction,
    });

    const { serverSeed, clientSeed, count } = hashPair;
    const result: number[][] = [];

    indexes.forEach((el) => {
      const hmac = crypto
        .createHmac('sha256', serverSeed)
        .update(`${clientSeed}:${count}:${el}`)
        .digest('hex');
      const bytes = Buffer.from(hmac, 'hex');
      result.push(Array.from(bytes));
    });

    return result;
  }

  async checkUpdatePair({
    userId,
    transaction,
  }: {
    userId: string;
    transaction: Transaction;
  }) {
    const hashPair = await this.nativeHashRepository.findOne({
      where: { userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!hashPair) {
      this.logger.error({ userId }, 'Hash pair not found');
      throw new InternalServerErrorException('Hash pair not found');
    }

    hashPair.count = Number(hashPair.count) + 1;
    await hashPair.save({ transaction });
  }

  calcNumberFromBytes({
    bytes,
    multiplier,
    elements = 4,
  }: {
    bytes: number[];
    multiplier: number;
    elements?: number;
  }) {
    let result = new Decimal(0);

    for (let i = 0; i < elements; i++) {
      result = result.plus(
        new Decimal(bytes[i]).dividedBy(
          new Decimal(256).pow(i + 1).toDecimalPlaces(12),
        ),
      );
    }

    return result
      .mul(multiplier)
      .toDecimalPlaces(0, Decimal.ROUND_DOWN)
      .toNumber();
  }
}
