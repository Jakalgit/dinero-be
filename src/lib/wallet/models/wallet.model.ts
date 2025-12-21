import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { WalletAuditLog } from './wallet-audit-log.model';
import { BlockchainAddress } from '../../payment/models/blockchain-address.model';

export interface WalletCreationAttrs {
  balance?: number;
  freezeBalance?: number;
  withdrawalLimit?: number;
  lastDepositAt?: number;
  lastWithdrawalAt?: number;
  wager: number;
  userId: string;
}

@Table({ tableName: 'wallets' })
export class Wallet extends Model<Wallet, WalletCreationAttrs> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  balance: number;

  @Column({
    type: DataType.BIGINT,
    field: 'freeze_balance',
    defaultValue: null,
  })
  freezeBalance: number;

  @Column({
    type: DataType.BIGINT,
    field: 'withdrawal_limit',
    defaultValue: null,
  })
  withdrawalLimit: number;

  @Column({ type: DataType.DATE, field: 'last_deposit_at', defaultValue: null })
  lastDepositAt: number;

  @Column({
    type: DataType.DATE,
    field: 'last_withdrawal_at',
    defaultValue: null,
  })
  lastWithdrawalAt: number;

  @Column({ type: DataType.BIGINT, allowNull: false })
  wager: number;

  @HasMany(() => WalletAuditLog)
  walletAuditLogs: WalletAuditLog[];

  @HasMany(() => BlockchainAddress)
  blockchainAddresses: BlockchainAddress[];

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'user_id',
  })
  userId: string;
}
