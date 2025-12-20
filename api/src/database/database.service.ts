import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async onModuleInit() {
    console.log('Database service initialized');
  }

  // Get the database instance for use in other services
  getDatabase() {
    return this.db;
  }
}
