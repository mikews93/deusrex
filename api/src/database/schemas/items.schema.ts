import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { itemTypeEnum, productTypeEnum } from './enums';

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  sku: varchar('sku', { length: 100 }).unique(),

  // Enhanced pricing with higher precision
  price: decimal('price', { precision: 18, scale: 6 }).notNull(),
  cost: decimal('cost', { precision: 18, scale: 6 }),

  // Multi-country compliance fields
  currency: varchar('currency', { length: 3 }).default('COP'), // ISO currency code
  productType: productTypeEnum('product_type').notNull().default('physical'), // physical | digital | service | misc

  // Enhanced type discriminator (keep existing for backward compatibility)
  type: itemTypeEnum('type').notNull(),

  // Enhanced inventory tracking
  isStockTracked: boolean('is_stock_tracked').default(true), // false for digital/services
  stock: decimal('stock', { precision: 18, scale: 6 }).default('0'), // Enhanced precision for stock

  // Service-specific fields (nullable for products)
  duration: integer('duration'), // in minutes

  // Common fields
  category: varchar('category', { length: 100 }),

  // Multi-country compliance metadata
  metadata: jsonb('metadata').default('{}'), // Tax category, delivery options, durations

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
