import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { CryptoNetworkEnum } from '../enums/crypto/crypto-network.enum';
import { BlockchainWalletEnum } from '../enums/blockchain-wallet.enum';
import { Wallet } from '../../wallet/models/wallet.model';

export interface BlockchainAddressCreationAttrs {
  address: string;
  addressHex?: string;
  network: CryptoNetworkEnum;
  derivationIndex?: number;
  encryptedPrivateKey: string;
  active?: boolean;
  type: BlockchainWalletEnum;
}

@Table({ tableName: 'blockchain_addresses' })
export class BlockchainAddress extends Model<
  BlockchainAddress,
  BlockchainAddressCreationAttrs
> {
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  address: string;

  @Column({ type: DataType.STRING, field: 'address_hex' })
  addressHex: string;

  @Column({
    type: DataType.ENUM(...Object.values(CryptoNetworkEnum)),
    allowNull: false,
  })
  network: CryptoNetworkEnum;

  @Column({
    type: DataType.BIGINT,
    field: 'derivation_index',
  })
  derivationIndex: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    field: 'encrypted_private_key',
  })
  encryptedPrivateKey: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
  active: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(BlockchainWalletEnum)),
    allowNull: false,
  })
  type: BlockchainWalletEnum;

  @BelongsTo(() => Wallet)
  wallet: Wallet;

  @ForeignKey(() => Wallet)
  @Column({
    type: DataType.UUID,
  })
  walletId: string;
}
