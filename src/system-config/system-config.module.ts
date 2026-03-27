import { Module } from '@nestjs/common';
import { SystemConfigController } from './controllers/system-config.controller';
import { SystemConfigService } from './services/system-config.service';
import { ContactsController } from './controllers/contacts.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Contacts } from '../lib/system-config/models/contacts.model';
import { ContactsService } from './services/contacts.service';

@Module({
  imports: [SequelizeModule.forFeature([Contacts])],
  controllers: [SystemConfigController, ContactsController],
  providers: [SystemConfigService, ContactsService],
})
export class SystemConfigModule {}
