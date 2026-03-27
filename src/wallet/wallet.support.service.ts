import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Wallet } from '../lib/wallet/models/wallet.model';
import { mcToUnits } from '../lib/conversion/units-to-ms';

@Injectable()
export class WalletSupportService {
  constructor(
    @InjectModel(Wallet)
    private readonly walletRepository: typeof Wallet,
  ) {}

  async incrementBalance({
    userId,
    amountMc,
    transaction,
  }: {
    userId: string;
    amountMc: number;
    transaction?: Transaction;
  }) {
    return await this.updateBalance({
      userId,
      amount: mcToUnits(amountMc),
      action: '+',
      transaction,
    });
  }

  async decrementBalance({
    userId,
    amountMc,
    transaction,
  }: {
    userId: string;
    amountMc: number;
    transaction?: Transaction;
  }) {
    return await this.updateBalance({
      userId,
      amount: mcToUnits(amountMc),
      action: '-',
      transaction,
    });
  }

  private async updateBalance({
    userId,
    amount,
    action,
    transaction,
  }: {
    userId: string;
    amount: number;
    action: '+' | '-';
    transaction?: Transaction;
  }) {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!wallet) throw new Error('Wallet not found');

    wallet.balance =
      action === '+'
        ? Number(wallet.balance) + amount
        : Number(wallet.balance) - amount;

    return await wallet.save({ transaction });
  }
}
