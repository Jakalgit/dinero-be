import { CryptoNetworkEnum } from '../../lib/payment/enums/crypto/crypto-network.enum';
import { CryptoCurrencyEnum } from '../../lib/payment/enums/crypto/crypto-currency.enum';

export interface ICryptoCurrencyFlow {
  isSupported(network: CryptoNetworkEnum, token: CryptoCurrencyEnum): boolean;

  handleWithdrawal(): Promise<void>;
}
