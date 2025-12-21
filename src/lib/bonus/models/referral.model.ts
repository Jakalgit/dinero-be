import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { ReferralStatusEnum } from '../enums/referral-status.enum';
import { User } from '../../user/models/user.model';

interface ReferralCreationAttrs {
  description?: string;
  status?: ReferralStatusEnum;
  referrerId: string;
  referredId: string;
}

@Table({ tableName: 'referrals' })
export class Referral extends Model<Referral, ReferralCreationAttrs> {
  @Column({ type: DataType.TEXT })
  description: string;

  @Column({
    type: DataType.ENUM(...Object.values(ReferralStatusEnum)),
    allowNull: false,
    defaultValue: ReferralStatusEnum.PENDING,
  })
  status: ReferralStatusEnum;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: 'referrer_id',
  })
  referrerId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
    field: 'referred_id',
  })
  referredId: string;
}
