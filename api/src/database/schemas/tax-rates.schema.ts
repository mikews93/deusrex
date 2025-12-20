import {
  pgTable,
  uuid,
  varchar,
  decimal,
  date,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { jurisdictions } from './jurisdictions.schema';
import { taxCategories } from './tax-categories.schema';

export const taxRates = pgTable('tax_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  jurisdictionId: varchar('jurisdiction_id', { length: 50 })
    .references(() => jurisdictions.id)
    .notNull(),
  taxCategoryId: uuid('tax_category_id')
    .references(() => taxCategories.id)
    .notNull(),

  // Rate information
  rate: decimal('rate', { precision: 5, scale: 4 }).notNull(), // e.g., 0.19 for 19%
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'), // null for current rate

  // Special conditions
  minimumAmount: decimal('minimum_amount', { precision: 18, scale: 2 }),
  maximumAmount: decimal('maximum_amount', { precision: 18, scale: 2 }),

  // Metadata for rate-specific rules
  metadata: jsonb('metadata').default('{}'),

  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
});
