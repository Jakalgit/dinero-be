import { CryptoNetworkEnum } from '../enums/crypto/crypto-network.enum';
import { CryptoCurrencyEnum } from '../enums/crypto/crypto-currency.enum';

export interface ICryptoCurrencyFlow {
  isSupportedFlow(
    network: CryptoNetworkEnum,
    token: CryptoCurrencyEnum,
  ): boolean;

  isSupportedCurrency(token: CryptoCurrencyEnum): boolean;

  getFlowData(): { currency: CryptoCurrencyEnum; network: CryptoNetworkEnum };

  handleWithdrawal(): Promise<void>;
}
