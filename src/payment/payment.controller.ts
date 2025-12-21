import { Controller, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TransferDirectionEnum } from '../lib/payment/enums/transfer-direction.enum';
import { PaymentGettersService } from './payment.getters.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paymentGettersService: PaymentGettersService,
  ) {}

  @Get('/methods')
  getPaymentMethods(
    @Query('country') country: string,
    @Query('direction') transferDirection: TransferDirectionEnum,
  ) {
    return this.paymentGettersService.getPaymentMethods(
      country,
      transferDirection,
    );
  }
}
