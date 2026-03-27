import { IsUUID, Max, Min } from 'class-validator';

export class PlayLimboDto {
  @IsUUID()
  userId: string;

  @Min(1.01, { message: 'userCoefficient must be greater than or equal 1.01' })
  @Max(1000000, {
    message: 'userCoefficient must be less than or equal 1000000',
  })
  userCoefficient: number;

  @Min(0.1)
  stakeAmount: number;
}
