import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { AuthProviderEnum } from '../enums/auth-provider.enum';
import { User } from '../../user/models/user.model';

interface AuthIdentityCreationAttrs {
  providerUserId: string;
  provider: AuthProviderEnum;
  passwordHash?: string;
  userId: string;
}

@Table({ tableName: 'auth_identities' })
export class AuthIdentity extends Model<
  AuthIdentity,
  AuthIdentityCreationAttrs
> {
  @Column({ type: DataType.STRING, allowNull: false })
  providerUserId: string;

  @Column({
    type: DataType.ENUM(...Object.values(AuthProviderEnum)),
    allowNull: false,
  })
  provider: AuthProviderEnum;

  @Column({ type: DataType.STRING })
  passwordHash: string;

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
