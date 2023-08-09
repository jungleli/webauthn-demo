import Dexie, { Table } from 'dexie';

export interface User {
  id?: number;
  username: string;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  users!: Table<User>;

  constructor() {
    super('demoDatabase');
    this.version(1).stores({
      users: '++id, username' // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
