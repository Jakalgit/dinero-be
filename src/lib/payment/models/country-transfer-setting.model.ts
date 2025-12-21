import {
  BeforeValidate,
  Column,
  DataType,
  Model,
  Table,
} from 'sequelize-typescript';
import {
  CryptoPaymentMethod,
  FiatPaymentMethod,
} from '../types/payment-method.type';
import { TransferDirectionEnum } from '../enums/transfer-direction.enum';

export interface CountryTransferSettingCreationAttrs {
  country: string;
  transferDirection?: TransferDirectionEnum;
  minAmount?: number;
  maxAmount?: number;
  paymentMethods?: (FiatPaymentMethod | CryptoPaymentMethod)[];
}

@Table({ tableName: 'transfer_settings' })
export class CountryTransferSetting extends Model<
  CountryTransferSetting,
  CountryTransferSettingCreationAttrs
> {
  // Код страны по стандарту ISO 3166-1 A-3 || default
  @Column({ type: DataType.STRING, allowNull: false })
  country: string;

  // Определяет для какого действия настройка (депозит или вывод)
  // Если null, то для обоих действий
  @Column({
    type: DataType.ENUM(...Object.values(TransferDirectionEnum)),
    field: 'transfer_direction',
  })
  transferDirection: TransferDirectionEnum;

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
  paymentMethods: (FiatPaymentMethod | CryptoPaymentMethod)[];

  @BeforeValidate
  static async validateUniqueCombination(instance: CountryTransferSetting) {
    const where: any = { country: instance.country };

    if (instance.transferDirection === null) {
      // запретить любые записи с этой страной
      const exists = await CountryTransferSetting.findOne({ where });
      if (exists) {
        throw new Error(`Setting for ${instance.country} already exists.`);
      }
    } else {
      // если есть универсальная запись (null) — запрещаем
      const existsNull = await CountryTransferSetting.findOne({
        where: { country: instance.country, transferDirection: null },
      });
      if (existsNull) {
        throw new Error(`Setting for ${instance.country} already exists.`);
      }

      // также проверим дубликат конкретного сочетания
      const existsExact = await CountryTransferSetting.findOne({
        where: {
          country: instance.country,
          transferDirection: instance.transferDirection,
        },
      });
      if (existsExact) {
        throw new Error(`Setting for ${instance.country} already exists.`);
      }
    }
  }
}
