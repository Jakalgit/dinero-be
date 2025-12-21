import { CryptoNetworkEnum } from "../../lib/payment/enums/crypto/crypto-network.enum";

export interface ICryptoNetworkFlow {
  isSupported(network: CryptoNetworkEnum): boolean;

  createWallet(): Promise<{
    address: string;
    addressHex?: string;
    privateKey: string;
  }>;
}