import { Module } from '@nestjs/common';
import { OfficeUserService } from './office-user.service';

@Module({
  providers: [OfficeUserService],
})
export class OfficeUserModule {}
