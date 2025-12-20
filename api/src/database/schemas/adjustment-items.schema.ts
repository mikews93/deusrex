import {
  pgTable,
  uuid,
  varchar,
  decimal,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { adjustments } from './adjustments.schema';
import { saleItems } from './sale-items.schema';
import { productTypeEnum } from './enums';

export const adjustmentItems = pgTable('adjustment_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  adjustmentId: uuid('adjustment_id')
    .references(() => adjustments.id)
    .notNull(),
  salesItemId: uuid('sales_item_id').references(() => saleItems.id), // Reference to original sale item

  // Item details
  description: text('description'),
  productType: productTypeEnum('product_type'), // physical | digital | service | misc

  // Quantities and pricing
  quantity: decimal('quantity', { precision: 18, scale: 6 }),
  unitPrice: decimal('unit_price', { precision: 18, scale: 6 }),
  subtotal: decimal('subtotal', { precision: 18, scale: 2 }),
  tax: decimal('tax', { precision: 18, scale: 2 }),
  total: decimal('total', { precision: 18, scale: 2 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
