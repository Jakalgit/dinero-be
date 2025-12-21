import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { WalletLogEnum } from '../enums/wallet-log.enum';
import { Wallet } from './wallet.model';
import { BonusEnum } from '../../bonus/enums/bonus.enum';
import { TransferEnum } from '../enums/transfer.enum';

export interface WalletAuditLogCreationAttrs {
  originalAmount?: number;
  description?: string;
  logType: WalletLogEnum;
  bonusType?: BonusEnum;
  transferType?: TransferEnum;
  transactionId?: string;
  walletId: string;
}

@Table({ tableName: 'wallet_audit_logs' })
export class WalletAuditLog extends Model<
  WalletAuditLog,
  WalletAuditLogCreationAttrs
> {
  @Column({
    type: DataType.BIGINT,
    allowNull: false,
    field: 'original_amount',
    defaultValue: 0,
  })
  originalAmount: number;

  @Column({ type: DataType.TEXT })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(WalletLogEnum)),
    allowNull: false,
    field: 'log_type',
  })
  logType: WalletLogEnum;

  @Column({
    type: DataType.ENUM(...Object.values(TransferEnum)),
    allowNull: false,
    field: 'transfer_type',
  })
  transferType: TransferEnum;

  @Column({ type: DataType.TEXT, field: 'transaction_id' })
  transactionId: string;

  @Column({
    type: DataType.ENUM(...Object.values(BonusEnum)),
    field: 'bonus_type',
  })
  bonusType: BonusEnum;

  @BelongsTo(() => Wallet)
  wallet: Wallet;

  @ForeignKey(() => Wallet)
  @Column({
    type: DataType.UUID,
  })
  walletId: string;
}
