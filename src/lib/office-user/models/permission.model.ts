import {
  BelongsToMany,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import {
  PermissionActionEnum,
  PermissionResourceEnum,
} from '../enums/permission-access.enum';
import { RolePermission } from './pivot/role-permission.model';
import { Role } from './role.model';

export interface PermissionCreationAttrs {
  resource: PermissionResourceEnum;
  action: PermissionActionEnum;
}

@Table({ tableName: 'permissions' })
export class Permission extends Model<Permission, PermissionCreationAttrs> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  resource: PermissionResourceEnum;

  @Column({ type: DataType.STRING, allowNull: false })
  action: PermissionActionEnum;

  @BelongsToMany(() => Role, () => RolePermission)
  roles: Role[];
}
