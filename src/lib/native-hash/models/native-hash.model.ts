import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';

interface NativeHashCreationAttrs {
  userId: string;
  serverSeed: string;
  clientSeed: string;
}

@Table({ tableName: 'native_hash' })
export class NativeHash extends Model<NativeHash, NativeHashCreationAttrs> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'server_seed',
  })
  serverSeed: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'client_seed',
  })
  clientSeed: string;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  count: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;
}
