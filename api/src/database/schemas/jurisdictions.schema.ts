import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';

export const jurisdictions = pgTable('jurisdictions', {
  id: varchar('id', { length: 50 }).primaryKey(), // e.g., 'CO', 'US-CA', 'EU-DE'
  name: varchar('name', { length: 255 }).notNull(),
  country: varchar('country', { length: 3 }).notNull(), // ISO country code
  region: varchar('region', { length: 100 }), // State, province, etc.
  currency: varchar('currency', { length: 3 }).notNull(), // Default currency for jurisdiction
  taxSystem: varchar('tax_system', { length: 50 }), // 'VAT', 'Sales Tax', 'GST', etc.

  // Compliance settings
  requiresTaxId: boolean('requires_tax_id').default(false),
  requiresFiscalDocument: boolean('requires_fiscal_document').default(false),
  fiscalDocumentPrefix: varchar('fiscal_document_prefix', { length: 10 }),

  // Metadata for jurisdiction-specific rules
  metadata: jsonb('metadata').default('{}'), // Tax rates, compliance rules, etc.

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
