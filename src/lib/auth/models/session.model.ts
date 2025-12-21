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

interface SessionCreationAttrs {
  refresh_token_hash: string;
  fingerprint_hash: string;
  refresh_expires_at: number;
}

@Table({ tableName: 'sessions' })
export class Session extends Model<Session, SessionCreationAttrs> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'refresh_token_hash',
  })
  refreshTokenHash: string;

  @Column({
    type: DataType.STRING,
    field: 'fingerprint_hash',
  })
  fingerprintHash: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'last_used_at',
    defaultValue: Date.now(),
  })
  lastUsedAt: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'refresh_expires_at',
  })
  refreshExpiresAt: number;

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
