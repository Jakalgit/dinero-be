import { Column, DataType, Model, Table } from 'sequelize-typescript';
import { PaymentMethodType } from "../types/payment-method.type";

export interface TransferSettingCreationAttrs {
  country: string;
  currency: string;
  minAmount?: number;
  maxAmount?: number;
}

@Table({ tableName: 'transfer_settings' })
export class TransferSetting extends Model<
  TransferSetting,
  TransferSettingCreationAttrs
> {
  // Код страны по стандарту ISO 3166-1 A-3 || default
  @Column({ type: DataType.STRING, allowNull: false })
  country: string;

  // Минимальная сумма депозита
  @Column({ type: DataType.BIGINT, field: 'min_amount' })
  minAmount?: number;

  // Максимальная сумма депозита
  @Column({ type: DataType.BIGINT, field: 'max_amount' })
  maxAmount?: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    field: 'payment_methods',
  })
  paymentMethods: PaymentMethodType[];
}
