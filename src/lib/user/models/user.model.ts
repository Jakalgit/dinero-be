import {
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { UserStatusEnum } from '../enums/user-status.enum';
import { Session } from '../../auth/models/session.model';
import { AuthIdentity } from '../../auth/models/auth-identity.model';
import { Wallet } from '../../wallet/models/wallet.model';
import { GameAction } from '../../game/models/game-action.model';
import { NativeHash } from '../../native-hash/models/native-hash.model';

export interface UserCreationAttrs {
  telegramId?: number;
  nickname: string;
  county: string;
  status?: UserStatusEnum;
  isSubscribedToNewsletter: boolean;
  freeSpins?: number;
}

@Table({ tableName: 'users' })
export class User extends Model<User, UserCreationAttrs> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @Column({
    type: DataType.BIGINT,
    field: 'telegram_id',
    unique: true,
  })
  telegramId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  nickname: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Date.now(),
    field: 'last_login_at',
  })
  lastLoginAt: number;

  @Column({ type: DataType.STRING })
  country: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserStatusEnum)),
    allowNull: false,
    defaultValue: UserStatusEnum.PENDING,
  })
  status: UserStatusEnum;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: 'is_subscribed_to_newsletter',
  })
  isSubscribedToNewsletter: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'free_spins',
  })
  freeSpins: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'visible_nickname',
  })
  visibleNickname: boolean;

  @HasMany(() => Session)
  session: Session[];

  @HasMany(() => AuthIdentity)
  authIdentities: AuthIdentity[];

  @HasOne(() => Wallet)
  wallet: Wallet;

  @HasOne(() => NativeHash)
  nativeHash: NativeHash;

  @HasMany(() => GameAction)
  gameActions: GameAction[];
}
