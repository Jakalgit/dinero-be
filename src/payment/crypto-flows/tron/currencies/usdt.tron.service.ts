import { Injectable } from '@nestjs/common';
import { ICryptoPaymentFlow } from './crypto-payment-flow.interface';
import { CryptoNetworkEnum } from '../../lib/payment/enums/crypto/crypto-network.enum';
import { CryptoCurrencyEnum } from '../../lib/payment/enums/crypto/crypto-currency.enum';

@Injectable()
export class UsdtTronService implements ICryptoPaymentFlow {
  private readonly NETWORK = CryptoNetworkEnum.TRON;
  private readonly TOKEN = CryptoCurrencyEnum.USDT;

  isSupported(network: CryptoNetworkEnum, token: CryptoCurrencyEnum): boolean {
    return this.NETWORK === network && token === this.TOKEN;
  }

  async handleWithdrawal(): Promise<void> {
    return;
  }
}
