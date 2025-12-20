import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { fiscalDocumentStatusEnum } from './enums';

export const fiscalDocuments = pgTable('fiscal_documents', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Document relationship
  relatedType: varchar('related_type', { length: 20 }).notNull(), // 'sale' | 'adjustment' | 'payment'
  relatedId: uuid('related_id').notNull(), // ID of the related record

  // Jurisdiction and document type
  jurisdictionId: varchar('jurisdiction_id', { length: 50 }).notNull(),
  documentTypeId: varchar('document_type_id', { length: 50 }).notNull(), // e.g., 'INVOICE', 'CREDIT_NOTE'

  // Fiscal document details
  fiscalNumber: varchar('fiscal_number', { length: 100 }), // Official fiscal number
  externalId: varchar('external_id', { length: 255 }), // External system ID

  // Document payload and processing
  payload: jsonb('payload'), // Document content, XML, JSON, etc.
  generatedAt: timestamp('generated_at').defaultNow(),
  sentAt: timestamp('sent_at'),
  status: fiscalDocumentStatusEnum('status').notNull().default('pending'),
  response: jsonb('response'), // Response from fiscal authority

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
