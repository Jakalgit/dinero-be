import { Injectable } from '@nestjs/common';
import { Transaction } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { Wallet } from '../lib/wallet/models/wallet.model';
import { Sequelize } from 'sequelize-typescript';
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
    return await this.walletRepository.update(
      { balance: Sequelize.literal(`balance ${action} ${amount}`) },
      {
        where: { userId },
        transaction,
        returning: true,
      },
    );
  }
}
