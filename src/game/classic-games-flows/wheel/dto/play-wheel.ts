import { IsEnum, IsIn, IsNumber, IsString, Min } from 'class-validator';
import { WheelRiskEnum } from '../../../../lib/game/enums/wheel/wheel-risk.enum';
import Decimal from 'decimal.js';
import { AMOUNT_PRECISION_SERVER } from '../../../../lib/precision/precision';

export class PlayWheelDto {
  @IsString()
  userId: string;

  @IsIn([10, 20, 30, 40, 50], {
    message:
      'numberOfSectors must be one of the following values: 10, 20, 30, 40 or 50',
  })
  numberOfSectors: number;

  @IsEnum(WheelRiskEnum, {
    message: 'risk must be a valid WheelRiskEnum value',
  })
  risk: WheelRiskEnum;

  @IsNumber()
  @Min(new Decimal(10).pow(-AMOUNT_PRECISION_SERVER).toNumber())
  stakeAmount: number;
}
