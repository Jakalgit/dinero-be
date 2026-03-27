import {
  BelongsToMany,
  Column,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { RoleStatusEnum } from '../enums/role-status.enum';
import { OfficeUser } from './office-user.model';
import { OfficeUserRole } from './pivot/office-user-role.model';
import { Permission } from './permission.model';
import { RolePermission } from './pivot/role-permission.model';

export interface RoleCreationAttrs {
  name: RoleStatusEnum;
}

@Table({ tableName: 'roles' })
export class Role extends Model<Role, RoleCreationAttrs> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
  })
  id: string;

  @Column({
    type: DataType.ENUM(...Object.values(RoleStatusEnum)),
    allowNull: false,
  })
  name: RoleStatusEnum;

  @BelongsToMany(() => OfficeUser, () => OfficeUserRole)
  officeUsers: OfficeUserRole[];

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions: Permission[];
}
