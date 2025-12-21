import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from './user.model';

interface UserAuditLogCreationAttrs {
  userId: string;
  description: string;
}

@Table({ tableName: 'user_audit_logs' })
export class UserAuditLog extends Model<
  UserAuditLog,
  UserAuditLogCreationAttrs
> {
  @Column({ type: DataType.TEXT, allowNull: false })
  description: string;

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
