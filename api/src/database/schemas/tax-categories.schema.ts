import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';

export const taxCategories = pgTable('tax_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  code: varchar('code', { length: 50 }).notNull(), // e.g., 'VAT_STANDARD', 'SALES_TAX'

  // Tax calculation settings
  defaultRate: decimal('default_rate', { precision: 5, scale: 4 }), // e.g., 0.19 for 19%
  isCompound: boolean('is_compound').default(false), // Whether tax is calculated on tax
  isInclusive: boolean('is_inclusive').default(false), // Whether tax is included in price

  // Compliance settings
  requiresExemption: boolean('requires_exemption').default(false),
  exemptionCode: varchar('exemption_code', { length: 50 }),

  // Metadata for category-specific rules
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
