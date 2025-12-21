import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { CryptoCurrencyEnum } from '../enums/crypto/crypto-currency.enum';
import { CryptoNetworkEnum } from '../enums/crypto/crypto-network.enum';
import { TransferDirectionEnum } from '../enums/transfer-direction.enum';
import { PaymentStatusEnum } from '../enums/payment-status.enum';

interface BlockchainTransactionCreationAttrs {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenSymbol: CryptoCurrencyEnum;
  network: CryptoNetworkEnum;
  direction: TransferDirectionEnum;
  status: PaymentStatusEnum;
}

@Table({ tableName: 'blockchain_transactions' })
export class BlockchainTransaction extends Model<
  BlockchainTransaction,
  BlockchainTransactionCreationAttrs
> {
  @Column({
    type: DataType.STRING(2048),
    allowNull: false,
    unique: true,
    field: 'tx_hash',
  })
  txHash: string;

  @Column({
    type: DataType.STRING(2048),
    allowNull: false,
    field: 'from_address',
  })
  fromAddress: string;

  @Column({
    type: DataType.STRING(2048),
    allowNull: false,
    field: 'to_address',
  })
  toAddress: string;

  @Column({ type: DataType.DECIMAL(36, 8), allowNull: false })
  amount: number;

  @Column({
    type: DataType.ENUM(...Object.values(CryptoCurrencyEnum)),
    allowNull: false,
    field: 'token_symbol',
  })
  tokenSymbol: CryptoCurrencyEnum;

  @Column({
    type: DataType.ENUM(...Object.values(CryptoNetworkEnum)),
    allowNull: false,
  })
  network: CryptoNetworkEnum;

  @Column({
    type: DataType.ENUM(...Object.values(TransferDirectionEnum)),
    allowNull: false,
  })
  direction: TransferDirectionEnum;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatusEnum)),
    allowNull: false,
  })
  status: PaymentStatusEnum;

  @Column({ type: DataType.DATE, allowNull: false, field: 'detected_at' })
  detectedAt: number;

  @Column({ type: DataType.DATE, allowNull: false, field: 'confirmed_at' })
  confirmedAt: number;
}
