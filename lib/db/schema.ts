import Dexie, { Table } from 'dexie';
import type { UserNote, UserSettings } from '@/types';

export class MettaSuttaDB extends Dexie {
  notes!: Table<UserNote>;
  settings!: Table<UserSettings>;

  constructor() {
    super('MettaSuttaDB');
    this.version(1).stores({
      notes: '++id, targetType, targetId, createdAt',
      settings: 'id'
    });
  }
}

export const db = new MettaSuttaDB();
