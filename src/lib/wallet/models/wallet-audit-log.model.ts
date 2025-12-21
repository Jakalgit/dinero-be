import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { WalletLogEnum } from '../../lib/wallet/enums/wallet-log.enum';
import { Wallet } from './wallet.model';
import { BonusEnum } from '../../lib/bonus/enums/bonus.enum';

interface WalletAuditLogCreationAttrs {
  nativeAmount?: number;
  description?: string;
  logType: WalletLogEnum;
  bonusType?: BonusEnum;
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
    field: 'native_amount',
    defaultValue: 0,
  })
  nativeAmount: number;

  @Column({ type: DataType.TEXT })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(WalletLogEnum)),
    allowNull: false,
    field: 'log_type',
  })
  logType: WalletLogEnum;

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
