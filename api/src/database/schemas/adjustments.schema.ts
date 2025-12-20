import {
  pgTable,
  uuid,
  varchar,
  decimal,
  date,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { sales } from './sales.schema';
import { adjustmentTypeEnum, adjustmentStatusEnum } from './enums';

export const adjustments = pgTable('adjustments', {
  id: uuid('id').primaryKey().defaultRandom(),
  adjustmentNumber: varchar('adjustment_number', { length: 100 }), // Business number

  // Related sale
  saleId: uuid('sale_id')
    .references(() => sales.id)
    .notNull(),
  jurisdictionId: varchar('jurisdiction_id', { length: 50 }).notNull(),

  // Adjustment details
  adjustmentType: adjustmentTypeEnum('adjustment_type').notNull(), // credit | debit | void
  reason: varchar('reason', { length: 255 }),
  issueDate: date('issue_date').notNull(),

  // Financial details
  currency: varchar('currency', { length: 3 }).notNull().default('COP'),
  subtotal: decimal('subtotal', { precision: 18, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 18, scale: 2 }).notNull(),
  total: decimal('total', { precision: 18, scale: 2 }).notNull(),

  // Status
  status: adjustmentStatusEnum('status').notNull().default('draft'),

  // Metadata
  metadata: jsonb('metadata').default('{}'),

  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
});
