import { Column, DataType, Model, Table } from "sequelize-typescript";

interface ReferralCreationAttrs {

}

@Table({ tableName: 'referrals'})
export class Referral extends Model<Referral, ReferralCreationAttrs> {

  @Column({ type: DataType.TEXT })
  description: string;


}