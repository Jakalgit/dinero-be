import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { CryptoCurrencyEnum } from '../enums/crypto/crypto-currency.enum';
import { CryptoNetworkEnum } from '../enums/crypto/crypto-network.enum';
import { PaymentStatusEnum } from '../enums/payment-status.enum';

interface LiquidityTransferCreationAttrs {
  fromAddress: string;
  toAddress: string;
  amount: number;
  tokenSymbol: CryptoCurrencyEnum;
  network: CryptoNetworkEnum;
  txHash: string;
  status: PaymentStatusEnum;
}

@Table({ tableName: 'liquidity_transfers' })
export class LiquidityTransfer extends Model<
  LiquidityTransfer,
  LiquidityTransferCreationAttrs
> {
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
    type: DataType.STRING(2048),
    allowNull: false,
    unique: true,
    field: 'tx_hash',
  })
  txHash: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentStatusEnum)),
    allowNull: false,
  })
  status: PaymentStatusEnum;
}
