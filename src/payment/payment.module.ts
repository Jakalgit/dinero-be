import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { CountryTransferSetting } from '../lib/payment/models/country-transfer-setting.model';
import { PAYMENT_FLOW } from '../lib/payment/constants/payment-flow.constants';
import { UsdtTronService } from './crypto-flows/tron/currencies/usdt.tron.service';
import { TronNetworkService } from './crypto-flows/tron/tron.service';
import { NETWORK_FLOW } from '../lib/payment/constants/network-flow.constants';
import { BlockchainAddress } from '../lib/payment/models/blockchain-address.model';
import { BlockchainTransaction } from '../lib/payment/models/blockchain-transaction.model';
import { LiquidityTransfer } from '../lib/payment/models/liquidity-transfer.model';
import { PaymentGettersService } from './payment.getters.service';

@Module({
  imports: [
    SequelizeModule.forFeature([
      CountryTransferSetting,
      BlockchainAddress,
      BlockchainTransaction,
      LiquidityTransfer,
    ]),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PaymentGettersService,
    {
      provide: PAYMENT_FLOW,
      useFactory: (...flows) => flows,
      inject: [UsdtTronService],
    },
    {
      provide: NETWORK_FLOW,
      useFactory: (...flows) => flows,
      inject: [TronNetworkService],
    },
    UsdtTronService,
    TronNetworkService,
  ],
  exports: [PaymentService, PaymentGettersService],
})
export class PaymentModule {}
