import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
} from 'drizzle-orm/pg-core';
import { journalEntries } from './journal-entries.schema';

export const journalLines = pgTable('journal_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  journalEntryId: uuid('journal_entry_id')
    .references(() => journalEntries.id)
    .notNull(),

  // Account information
  accountCode: varchar('account_code', { length: 50 }).notNull(),

  // Debit/Credit amounts
  debit: decimal('debit', { precision: 18, scale: 2 }).default(0),
  credit: decimal('credit', { precision: 18, scale: 2 }).default(0),

  // Reference information
  referenceType: varchar('reference_type', { length: 20 }),
  referenceId: uuid('reference_id'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
