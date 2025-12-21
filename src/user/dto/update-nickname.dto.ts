import { IsString, MaxLength, MinLength } from 'class-validator';
import { MAX_NICKNAME_LENGTH, MIN_NICKNAME_LENGTH } from '../config';

export class UpdateNicknameDto {
  @IsString()
  @MinLength(MIN_NICKNAME_LENGTH, {
    message: `Length of nickname must be at least ${MIN_NICKNAME_LENGTH} symbols`,
  })
  @MaxLength(MAX_NICKNAME_LENGTH, {
    message: `Length of nickname must be less than or equal ${MAX_NICKNAME_LENGTH} symbols`,
  })
  nickname: string;
}
