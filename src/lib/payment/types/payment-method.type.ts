import { PaymentSystemsEnum } from '../enums/payment-systems.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';
import { CryptoCurrencyEnum } from '../enums/crypto/crypto-currency.enum';

/**
 * Тип описывает конкретный метод оплаты, доступный для некоторой страны
 * currency - код фиатной валюты согласно стандарту ISO 4217 alphabetic
 * cryptoCurrency - тикер криптовалюты
 * minAmount - минимальный возможный депозит
 * maxAmount - максимально возможный депозит
 * commission - комиссия по способу оплату, если не указано, то используем
 *  комиссию из таблицы настроек переводов для страны
 * allowedSystems - доступные банковские системы, для оплаты фиатом
 */

type BasePaymentMethod = {
  minAmount?: number;
  maxAmount?: number;
  commission?: number;
  type: PaymentMethodEnum;
};

export type FiatPaymentMethod = BasePaymentMethod & {
  allowedSystems?: PaymentSystemsEnum[];
  type: PaymentMethodEnum.BANK | PaymentMethodEnum.SBP | PaymentMethodEnum.CARD;
};

export type CryptoPaymentMethod = BasePaymentMethod & {
  cryptoCurrencies: CryptoCurrencyEnum[];
  type: PaymentMethodEnum.CRYPTO;
};
