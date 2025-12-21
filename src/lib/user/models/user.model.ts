import {
  Column,
  DataType,
  Default,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
} from 'sequelize-typescript';
import { UserStatusEnum } from '../../lib/user/enums/user-status.enum';
import { Session } from '../../auth/models/session.model';
import { AuthIdentities } from '../../auth/models/auth-identities.model';
import { Wallet } from '../../wallet/models/wallet.model';

interface UserCreationAttrs {
  telegramId?: number;
  nickname: string;
  county: string;
  status?: UserStatusEnum;
  isSubscribedToNewsletter: boolean;
  freeSpins?: number;
}

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

  @HasMany(() => Session)
  session: Session[];

  @HasMany(() => AuthIdentities)
  authIdentities: AuthIdentities[];

  @HasOne(() => Wallet)
  wallet: Wallet;
}
