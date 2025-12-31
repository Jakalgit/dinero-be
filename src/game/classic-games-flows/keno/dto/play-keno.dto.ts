import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  Min,
  Validate,
} from 'class-validator';
import Decimal from 'decimal.js';
import { AMOUNT_PRECISION_SERVER } from '../../../../lib/precision/precision';
import { KenoRiskEnum } from '../../../../lib/game/enums/keno/keno-risk.enum';

function IsValueInRange() {
  return Validate(
    (value: number) => {
      return Number.isInteger(value) && value >= 1 && value <= 40;
    },
    {
      message: 'Each value must be an integer between 1 and 40.',
    },
  );
}

export class PlayKenoDto {
  @IsString()
  userId: string;

  @Min(new Decimal(10).pow(-AMOUNT_PRECISION_SERVER).toNumber())
  stakeAmount: number;

  @IsEnum(KenoRiskEnum, { message: 'risk must be a valid KenoRiskEnum value' })
  risk: KenoRiskEnum;

  @IsArray()
  @ArrayNotEmpty({ message: "array of user's values can't be empty" })
  @ArrayMaxSize(10, { message: 'max size of array less than or equal 10' })
  @IsValueInRange()
  userValues: number[];
}
