import {
  BelongsToMany,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { Role } from './role.model';
import { OfficeUserRole } from './pivot/office-user-role.model';

export interface OfficeUserCreationAttrs {
  username: string;
  passwordHash: string;
}

@Table({ tableName: 'office_users' })
export class OfficeUser extends Model<OfficeUser, OfficeUserCreationAttrs> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  username: string;

  @Column({ type: DataType.STRING, allowNull: false, field: 'password_hash' })
  passwordHash: string;

  @BelongsToMany(() => Role, () => OfficeUserRole)
  roles: Role[];
}
