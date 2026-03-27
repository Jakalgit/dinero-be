import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Contacts } from '../../lib/system-config/models/contacts.model';

@Injectable()
export class ContactsService implements OnModuleInit {
  constructor(
    @InjectModel(Contacts)
    private readonly contactsRepository: typeof Contacts,
  ) {}

  async onModuleInit(): Promise<void> {
    const candidate = await this.contactsRepository.findOne();

    if (!candidate) {
      await this.contactsRepository.create();
    }
  }

  async getContacts() {
    return await this.contactsRepository.findOne();
  }
}
