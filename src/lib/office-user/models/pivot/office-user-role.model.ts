import { Column, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Role } from '../role.model';
import { OfficeUser } from '../office-user.model';

export interface OfficeUserRoleCreationAttrs {
  officeUserId: string;
  roleId: string;
}

@Table({ tableName: 'office_users_roles' })
export class OfficeUserRole extends Model<
  OfficeUserRole,
  OfficeUserRoleCreationAttrs
> {
  @ForeignKey(() => Role)
  @Column({ field: 'role_id' })
  roleId: string;

  @ForeignKey(() => OfficeUser)
  @Column({ field: 'office_user_id' })
  officeUserId: string;
}
