import { BadRequestException, Injectable } from '@nestjs/common';
import { GameService } from '../game.service';
import { WalletService } from '../../wallet/wallet.service';
import Decimal from 'decimal.js';
import { mcToUnits, unitsToMC } from '../../lib/conversion/units-to-ms';
import { Transaction } from 'sequelize';
import { WalletSupportService } from '../../wallet/wallet.support.service';
import { InjectModel } from '@nestjs/sequelize';
import { GameAction } from '../../lib/game/models/game-action.model';

@Injectable()
export class ClassicSupportService {
  constructor(
    private readonly gameService: GameService,
    private readonly walletService: WalletService,
    private readonly walletSupportService: WalletSupportService,
    @InjectModel(GameAction)
    private readonly gameActionRepository: typeof GameAction,
  ) {}

  async walletInfoWithCheck({
    userId,
    gameId,
    decimalStakeAmount,
  }: {
    userId: string;
    gameId: string;
    decimalStakeAmount: Decimal;
  }) {
    const [walletInfo, gameInfo] = await Promise.all([
      // Поиск кошелька
      this.walletService.getWalletInfo({ userId, internal: true }),
      // Поиск игры и проверка статуса
      this.gameService.findGameSettings(gameId),
    ]);

    if (decimalStakeAmount.greaterThan(walletInfo.balance)) {
      throw new BadRequestException('The bet amount exceeds the balance');
    } else if (gameInfo.maxStake) {
      if (decimalStakeAmount.greaterThan(gameInfo.maxStake)) {
        throw new BadRequestException(
          'The bet amount exceeds the allowed value',
        );
      }
    }
  }

  async saveGameResult({
    userId,
    stakeAmount,
    balanceDiff,
    gameId,
    transaction,
  }: {
    userId: string;
    stakeAmount: Decimal;
    balanceDiff: Decimal;
    gameId: string;
    transaction?: Transaction;
  }) {
    let updatedWallet;
    let isWinner = false;

    if (balanceDiff.greaterThan(0)) {
      const [_, w] = await this.walletSupportService.incrementBalance({
        userId,
        amountMc: balanceDiff.toNumber(),
        transaction,
      });
      isWinner = true;
      updatedWallet = w[0];
    } else {
      const [_, w] = await this.walletSupportService.decrementBalance({
        userId,
        amountMc: balanceDiff.mul(-1).toNumber(),
        transaction,
      });
      updatedWallet = w[0];
    }

    const coefficient = new Decimal(stakeAmount)
      .add(balanceDiff)
      .dividedBy(stakeAmount)
      .toDecimalPlaces(4, Decimal.ROUND_DOWN)
      .toString()
      .replace(/(\.\d*?[1-9])0+$/, '$1')
      .replace(/\.0+$/, '');

    await this.gameActionRepository.create(
      {
        classic: true,
        amountDifference: mcToUnits(balanceDiff.toNumber()),
        amountStake: mcToUnits(stakeAmount.toNumber()),
        coefficient,
        gameSettingId: gameId,
        userId,
      },
      { transaction },
    );

    return {
      balance: unitsToMC(updatedWallet.balance),
      balanceDifference: balanceDiff.toNumber(),
      isWinner,
    };
  }
}
