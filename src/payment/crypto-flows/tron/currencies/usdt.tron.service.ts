import { Injectable } from '@nestjs/common';
import { ICryptoCurrencyFlow } from '../../../../lib/payment/interfaces/crypto-currency-flow.interface';
import { CryptoNetworkEnum } from '../../../../lib/payment/enums/crypto/crypto-network.enum';
import { CryptoCurrencyEnum } from '../../../../lib/payment/enums/crypto/crypto-currency.enum';

@Injectable()
export class UsdtTronService implements ICryptoCurrencyFlow {
  private readonly NETWORK = CryptoNetworkEnum.TRON;
  private readonly TOKEN = CryptoCurrencyEnum.USDT;

  isSupportedFlow(
    network: CryptoNetworkEnum,
    token: CryptoCurrencyEnum,
  ): boolean {
    return this.NETWORK === network && token === this.TOKEN;
  }

  isSupportedCurrency(token: CryptoCurrencyEnum): boolean {
    return token === this.TOKEN;
  }

  getFlowData(): { currency: CryptoCurrencyEnum; network: CryptoNetworkEnum } {
    return { currency: this.TOKEN, network: this.NETWORK };
  }

  async handleWithdrawal(): Promise<void> {
    return;
  }
}
