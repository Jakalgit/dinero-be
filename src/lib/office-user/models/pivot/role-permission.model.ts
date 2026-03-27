import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Role } from '../role.model';
import { Permission } from '../permission.model';

export interface RolePermissionCreationAttrs {
  roleId: string;
  permissionId: string;
}

@Table({ tableName: 'roles_permissions' })
export class RolePermission extends Model<
  RolePermission,
  RolePermissionCreationAttrs
> {
  @ForeignKey(() => Role)
  @Column({ field: 'role_id' })
  roleId: string;

  @ForeignKey(() => Permission)
  @Column({ field: 'permission_id' })
  permissionId: string;
}
