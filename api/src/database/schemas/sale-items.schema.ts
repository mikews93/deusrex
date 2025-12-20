import {
  pgTable,
  uuid,
  integer,
  decimal,
  timestamp,
  text,
  jsonb,
  varchar,
} from 'drizzle-orm/pg-core';
import { sales } from './sales.schema';
import { items } from './items.schema';
import { productTypeEnum } from './enums';

export const saleItems = pgTable('sale_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id')
    .references(() => sales.id)
    .notNull(),
  itemId: uuid('item_id').references(() => items.id), // Make optional for free-text items
  // Product snapshot for compliance
  productSnapshot: jsonb('product_snapshot'), // Snapshot of product at time of sale (price, name, tax rules)

  // Enhanced product information
  description: text('description'), // Free-text description for services or custom items
  productType: productTypeEnum('product_type').notNull().default('physical'), // physical | digital | service | misc

  // Enhanced quantity and pricing with higher precision
  quantity: decimal('quantity', { precision: 18, scale: 6 })
    .notNull()
    .default('1'),
  unitPrice: decimal('unit_price', { precision: 18, scale: 6 }).notNull(),

  // Enhanced financial calculations
  totalPrice: decimal('total_price', { precision: 18, scale: 2 }).notNull(), // Keep existing field
  subtotal: decimal('subtotal', { precision: 18, scale: 2 })
    .notNull()
    .default('0'), // Amount before tax
  tax: decimal('tax', { precision: 18, scale: 2 }).notNull().default('0'), // Tax amount
  total: decimal('total', { precision: 18, scale: 2 }).notNull().default('0'), // Final total

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
