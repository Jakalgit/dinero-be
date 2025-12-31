import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { DiceGameModeEnum } from '../../../../lib/game/enums/dice/dice-game-mode.enum';
import { AMOUNT_PRECISION_SERVER } from '../../../../lib/precision/precision';
import Decimal from 'decimal.js';

export class PlayDiceDto {
  @IsNumber()
  @Min(new Decimal(10).pow(-AMOUNT_PRECISION_SERVER).toNumber())
  stakeAmount: number;

  @IsString()
  userId: string;

  @IsNotEmpty()
  mode: DiceGameModeEnum;

  @IsNotEmpty()
  userNumber: number;
}
