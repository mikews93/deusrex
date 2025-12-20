import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { items } from '@database/schemas/items.schema';
import { BaseService } from '@common/services/base.service';
import { Item, NewItem } from '@/database/types';
import { eq, and, isNull, ilike, lte, gte } from 'drizzle-orm';
import { ItemFilter } from '@/common/schemas/filter.schema';
import { SQL } from 'drizzle-orm';

@Injectable()
export class ItemsService extends BaseService<Item> {
  constructor(databaseService: DatabaseService) {
    super(databaseService, items);
  }

  // Override buildWhereConditions to handle item-specific filters
  protected buildWhereConditions(
    organizationId?: string,
    includeDeleted: boolean = false,
    filters?: ItemFilter,
  ): SQL | undefined {
    const conditions: SQL[] = [];

    if (organizationId) {
      conditions.push(eq(items.organizationId, organizationId));
    }

    if (!includeDeleted) {
      conditions.push(isNull(items.deletedAt));
    }

    if (filters) {
      // Search filter
      if (filters.search) {
        conditions.push(ilike(items.name, `%${filters.search}%`));
      }

      // Type filter
      if (filters.type) {
        conditions.push(eq(items.type, filters.type));
      }

      // Category filter
      if (filters.category) {
        conditions.push(ilike(items.category, `%${filters.category}%`));
      }

      // Active status filter
      if (filters.isActive !== undefined) {
        conditions.push(eq(items.isActive, filters.isActive));
      }

      // Stock range filters
      if (filters.stockMin !== undefined) {
        conditions.push(gte(items.stock, filters.stockMin));
      }
      if (filters.stockMax !== undefined) {
        conditions.push(lte(items.stock, filters.stockMax));
      }

      // Price range filters
      if (filters.priceMin !== undefined) {
        conditions.push(gte(items.price, filters.priceMin.toString()));
      }
      if (filters.priceMax !== undefined) {
        conditions.push(lte(items.price, filters.priceMax.toString()));
      }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  // Override create to handle type-specific validation
  async create(
    itemData: Omit<
      NewItem,
      | 'id'
      | 'organizationId'
      | 'createdBy'
      | 'updatedBy'
      | 'deletedBy'
      | 'deletedAt'
    >,
    organizationId: string,
    userId?: string,
  ) {
    // Validate type-specific fields
    if (itemData.type === 'product' && itemData.stock === undefined) {
      itemData.stock = 0;
    }
    if (itemData.type === 'service' && itemData.duration === undefined) {
      throw new Error('Duration is required for services');
    }

    return super.create(itemData, organizationId, userId);
  }

  // Override update to handle type-specific validation
  async update(
    id: string,
    updateData: Partial<
      Omit<
        NewItem,
        | 'id'
        | 'organizationId'
        | 'createdBy'
        | 'updatedBy'
        | 'deletedBy'
        | 'deletedAt'
      >
    >,
    organizationId?: string,
    userId?: string,
  ) {
    // If changing type, validate new type requirements
    if (updateData.type) {
      if (updateData.type === 'service' && !updateData.duration) {
        throw new Error('Duration is required when changing to service type');
      }
    }

    return super.update(id, updateData, organizationId, userId);
  }

  // Get items by type
  async getByType(
    type: 'product' | 'service',
    organizationId: string,
    includeDeleted: boolean = false,
  ) {
    const conditions = [
      eq(items.organizationId, organizationId),
      eq(items.type, type),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(items.deletedAt));
    }

    return await this.db.query.items.findMany({
      where: and(...conditions),
    });
  }

  // Get products only (for inventory management)
  async getProducts(organizationId: string, includeDeleted: boolean = false) {
    return this.getByType('product', organizationId, includeDeleted);
  }

  // Get services only
  async getServices(organizationId: string, includeDeleted: boolean = false) {
    return this.getByType('service', organizationId, includeDeleted);
  }

  // Update stock for products
  async updateStock(
    id: string,
    newStock: number,
    organizationId?: string,
    userId?: string,
  ) {
    // Verify it's a product
    const item = await this.findOne(id, organizationId);
    if (!item) {
      throw new Error('Item not found');
    }
    if (item.type !== 'product') {
      throw new Error('Stock can only be updated for products');
    }

    return this.update(id, { stock: newStock }, organizationId, userId);
  }

  // Get low stock products
  async getLowStockProducts(threshold: number = 10, organizationId: string) {
    const conditions = [
      eq(items.organizationId, organizationId),
      eq(items.type, 'product'),
      lte(items.stock, threshold),
      isNull(items.deletedAt),
    ];

    return await this.db.query.items.findMany({
      where: and(...conditions),
    });
  }
}
