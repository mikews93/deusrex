import {
  pgTable,
  uuid,
  varchar,
  decimal,
  date,
  boolean,
  timestamp,
  text,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { clients } from './clients.schema';
import { users } from './users.schema';
import { saleStatusEnum } from './enums';

export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Business document numbering
  saleNumber: varchar('sale_number', { length: 100 }), // Business/human readable number

  // Multi-country compliance fields
  jurisdictionId: varchar('jurisdiction_id', { length: 50 })
    .notNull()
    .default('CO'), // Reference to jurisdictions table
  currency: varchar('currency', { length: 3 }).notNull().default('COP'), // ISO currency code

  // Enhanced date fields
  saleDate: date('sale_date').notNull(), // Keep existing field
  issueDate: date('issue_date').notNull().default('now()'), // When document was issued
  dueDate: date('due_date'), // Payment due date

  // Enhanced financial fields
  totalAmount: decimal('total_amount', { precision: 18, scale: 2 }).notNull(), // Keep existing, increase precision
  subtotal: decimal('subtotal', { precision: 18, scale: 2 })
    .notNull()
    .default('0'), // Amount before tax
  tax: decimal('tax', { precision: 18, scale: 2 }).notNull().default('0'), // Tax amount
  total: decimal('total', { precision: 18, scale: 2 }).notNull().default('0'), // Final total

  // Enhanced status
  status: saleStatusEnum('status').notNull().default('draft'), // draft | issued | accepted | cancelled

  // Relationships
  clientId: uuid('client_id').references(() => clients.id),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),

  // Metadata for compliance
  metadata: jsonb('metadata').default('{}'), // Additional compliance data

  // Audit fields
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
});
