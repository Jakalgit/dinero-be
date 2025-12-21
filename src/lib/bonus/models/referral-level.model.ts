import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface ReferralLevelCreationAttrs {
  bonusPercent: number;
  referralsCount: number;
}

@Table({ tableName: 'referral_levels' })
export class ReferralLevel extends Model<
  ReferralLevel,
  ReferralLevelCreationAttrs
> {
  @Column({ type: DataType.DOUBLE, allowNull: false, field: 'bonus_percent' })
  bonusPercent: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'referrals_count',
  })
  referralsCount: number;
}