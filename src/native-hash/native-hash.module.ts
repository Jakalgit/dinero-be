import { Module } from '@nestjs/common';
import { NativeHashService } from './native-hash.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { NativeHash } from '../lib/native-hash/models/native-hash.model';

@Module({
  imports: [SequelizeModule.forFeature([NativeHash])],
  providers: [NativeHashService],
  exports: [NativeHashService],
})
export class NativeHashModule {}
