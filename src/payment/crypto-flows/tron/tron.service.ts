import { Injectable } from '@nestjs/common';
import { ICryptoNetworkFlow } from '../../../lib/payment/interfaces/crypto-network-flow.interface';
import { CryptoNetworkEnum } from '../../../lib/payment/enums/crypto/crypto-network.enum';
import { TronWeb } from 'tronweb';

@Injectable()
export class TronNetworkService implements ICryptoNetworkFlow {
  private tronWeb: TronWeb;
  private readonly NETWORK = CryptoNetworkEnum.TRON;

  constructor() {
    this.tronWeb = new TronWeb({
      fullHost: 'https://nile.tronscan.org',
    });
  }

  isSupported(network: CryptoNetworkEnum): boolean {
    return network === this.NETWORK;
  }

  async createWallet(): Promise<{
    address: string;
    addressHex?: string;
    privateKey: string;
  }> {
    const account = this.tronWeb.utils.accounts.generateAccount();

    return {
      address: account.address.base58,
      privateKey: account.privateKey,
      addressHex: account.address.hex,
    };
  }
}
