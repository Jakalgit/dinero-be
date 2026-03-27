import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface ContactsCreationAttrs {
  telegram?: string;
  email?: string;
  phone?: string;
}

@Table({ tableName: 'contacts' })
export class Contacts extends Model<Contacts, ContactsCreationAttrs> {
  @Column({ type: DataType.STRING })
  telegram: string;

  @Column({ type: DataType.STRING })
  email: string;

  @Column({ type: DataType.STRING })
  phone: string;
}
