import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { items } from './items.schema';
import { clients } from './clients.schema';
import { saleItems } from './sale-items.schema';
import { deliveryTypeEnum } from './enums';

export const digitalDeliveries = pgTable('digital_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Related records
  salesItemId: uuid('sales_item_id')
    .references(() => saleItems.id)
    .notNull(),
  productId: uuid('product_id').references(() => items.id),
  clientId: uuid('client_id')
    .references(() => clients.id)
    .notNull(),

  // Delivery details
  deliveryType: deliveryTypeEnum('delivery_type'), // license_key | download | email_link
  payload: jsonb('payload'), // e.g., { "key": "...", "url": "...", "expires_at": "..." }

  // Delivery tracking
  deliveredAt: timestamp('delivered_at'),
  deliveredBy: uuid('delivered_by').references(() => users.id),
  status: varchar('status', { length: 20 }).default('pending'), // pending | delivered | failed

  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
