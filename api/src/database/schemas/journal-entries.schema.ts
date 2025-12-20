import {
  pgTable,
  uuid,
  varchar,
  date,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryDate: date('entry_date').notNull(),
  description: text('description'),

  // Related record
  relatedType: varchar('related_type', { length: 20 }), // 'sale' | 'adjustment' | 'payment'
  relatedId: uuid('related_id'),

  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
});
