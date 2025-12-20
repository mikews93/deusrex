import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { items } from './items.schema';
import { sales } from './sales.schema';
import { movementTypeEnum } from './enums';

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .references(() => items.id)
    .notNull(),
  productSku: varchar('product_sku', { length: 100 }), // Denormalized for performance

  // Movement details
  quantity: decimal('quantity', { precision: 18, scale: 6 }).notNull(),
  movementType: movementTypeEnum('movement_type').notNull(), // sale_out | return_in | adjustment | manual

  // Related records
  relatedSaleId: uuid('related_sale_id').references(() => sales.id),
  relatedAdjustmentId: uuid('related_adjustment_id'), // Will reference adjustments table

  // Metadata
  metadata: jsonb('metadata').default('{}'),

  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by').references(() => users.id),
});
