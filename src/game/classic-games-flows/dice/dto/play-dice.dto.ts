import { IsNotEmpty, IsString, Min } from 'class-validator';
import { DiceGameModeEnum } from '../../../../lib/game/enums/dice/dice-game-mode.enum';

export class PlayDiceDto {
  @Min(0)
  stakeAmount: number;

  @IsString()
  userId: string;

  @IsNotEmpty()
  mode: DiceGameModeEnum;

  @IsNotEmpty()
  userNumber: number;
}
