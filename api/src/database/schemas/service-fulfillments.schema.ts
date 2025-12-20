import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { clients } from './clients.schema';
import { saleItems } from './sale-items.schema';
import { fulfillmentStatusEnum } from './enums';

export const serviceFulfillments = pgTable('service_fulfillments', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Related records
  salesItemId: uuid('sales_item_id')
    .references(() => saleItems.id)
    .notNull(),
  clientId: uuid('client_id')
    .references(() => clients.id)
    .notNull(),

  // Scheduling
  scheduledStart: timestamp('scheduled_start'),
  scheduledEnd: timestamp('scheduled_end'),

  // Service provider
  providerId: uuid('provider_id').references(() => users.id), // Employee or external provider

  // Status and notes
  status: fulfillmentStatusEnum('status').default('scheduled'), // scheduled | in_progress | completed | cancelled
  notes: text('notes'),

  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
