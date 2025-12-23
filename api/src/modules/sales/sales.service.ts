import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { sales } from '@database/schemas/sales.schema';
import { saleItems } from '@database/schemas/sale-items.schema';
import { BaseService } from '@common/services/base.service';
import { eq, asc, and, desc } from 'drizzle-orm';
import { SaleWithRelations, NewSale } from '@/database/types';
import { saleCreateSchema } from '@database/schemas/zod-schemas';
import { z } from 'zod';

@Injectable()
export class SalesService extends BaseService<SaleWithRelations> {
  constructor(databaseService: DatabaseService) {
    super(databaseService, sales);
  }

  // Enhanced create method for multi-country compliance
  async create(
    saleData: z.infer<typeof saleCreateSchema> | Partial<SaleWithRelations>,
    organizationId: string,
    userId?: string,
  ) {
    // Type guard to check if it's the enhanced schema
    if ('saleItems' in saleData && Array.isArray(saleData.saleItems)) {
      return this.createWithItems(
        saleData as z.infer<typeof saleCreateSchema>,
        organizationId,
        userId,
      );
    }

    // Fall back to base class create for partial data
    return super.create(
      saleData as Partial<SaleWithRelations>,
      organizationId,
      userId,
    );
  }

  private async createWithItems(
    saleData: z.infer<typeof saleCreateSchema>,
    organizationId: string,
    userId?: string,
  ) {
    const { saleItems: itemsToCreate, ...saleDataWithoutItems } = saleData;
    const processedSaleData = {
      ...saleDataWithoutItems,
      organizationId: organizationId,
      saleDate: new Date(saleData.saleDate).toISOString().split('T')[0],
      issueDate: new Date(saleData.issueDate).toISOString().split('T')[0],
      dueDate: saleData.dueDate
        ? new Date(saleData.dueDate).toISOString().split('T')[0]
        : null,
      totalAmount: saleData.totalAmount.toString(),
      subtotal: (saleData.subtotal ?? '0').toString(),
      tax: (saleData.tax ?? '0').toString(),
      total: (saleData.total ?? saleData.totalAmount).toString(),
    };

    // Create the sale first
    const sale = await super.create(processedSaleData, organizationId, userId);

    // Create sale items if provided
    if (itemsToCreate && itemsToCreate.length > 0) {
      const saleItemsData = itemsToCreate.map((item) => ({
        ...item,
        saleId: sale.id,
        quantity: (item.quantity ?? '1').toString(),
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
        subtotal: (item.subtotal ?? '0').toString(),
        tax: (item.tax ?? '0').toString(),
        total: (item.total ?? item.totalPrice).toString(),
      }));

      await this.db.insert(saleItems).values(saleItemsData);
    }

    return sale;
  }

  // Override update to handle date and amount conversion
  async update(
    id: string,
    updateData: Partial<
      Omit<
        NewSale,
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
    const processedUpdateData: any = { ...updateData };
    if (updateData.saleDate) {
      processedUpdateData.saleDate = new Date(updateData.saleDate)
        .toISOString()
        .split('T')[0];
    }
    if (updateData.totalAmount !== undefined) {
      processedUpdateData.totalAmount = updateData.totalAmount.toString();
    }
    return super.update(id, processedUpdateData, organizationId, userId);
  }

  // Sales-specific method
  async getSaleItems(saleId: string, organizationId?: string) {
    const conditions = organizationId
      ? and(
          eq(saleItems.saleId, saleId),
          eq(sales.organizationId, organizationId),
        )
      : eq(saleItems.saleId, saleId);

    return await this.db
      .select()
      .from(saleItems)
      .where(conditions)
      .orderBy(asc(saleItems.createdAt));
  }

  // Method to get sales with sale items filtered by item ID
  async getSalesByItem(itemId: string, organizationId: string) {
    if (!itemId || !organizationId) {
      throw new Error('Item ID and organization ID are required');
    }
    return await this.db.query.sales.findMany({
      with: {
        saleItems: {
          where: eq(saleItems.itemId, itemId),
        },
      },
      where: eq(sales.organizationId, organizationId),
    });
  }

  // Legacy method for backward compatibility
  async getSalesByProduct(productId: string, organizationId: string) {
    return this.getSalesByItem(productId, organizationId);
  }

  // Multi-country compliance methods
  async getSalesByJurisdiction(jurisdictionId: string, organizationId: string) {
    return await this.db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.jurisdictionId, jurisdictionId),
          eq(sales.organizationId, organizationId),
          eq(sales.isActive, true),
        ),
      )
      .orderBy(desc(sales.createdAt));
  }

  async getSalesByStatus(status: string, organizationId: string) {
    return await this.db
      .select()
      .from(sales)
      .where(
        and(
          eq(
            sales.status,
            status as
              | 'completed'
              | 'cancelled'
              | 'draft'
              | 'issued'
              | 'accepted',
          ),
          eq(sales.organizationId, organizationId),
          eq(sales.isActive, true),
        ),
      )
      .orderBy(desc(sales.createdAt));
  }

  async getSalesByCurrency(currency: string, organizationId: string) {
    return await this.db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.currency, currency),
          eq(sales.organizationId, organizationId),
          eq(sales.isActive, true),
        ),
      )
      .orderBy(desc(sales.createdAt));
  }

  async updateSaleStatus(
    id: string,
    status: string,
    organizationId: string,
    userId?: string,
  ) {
    return await this.update(
      id,
      {
        status: status as
          | 'completed'
          | 'cancelled'
          | 'draft'
          | 'issued'
          | 'accepted',
      },
      organizationId,
      userId,
    );
  }

  async generateSaleNumber(organizationId: string, jurisdictionId: string) {
    // Generate a unique sale number based on jurisdiction and organization
    const prefix = jurisdictionId.toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  }
}
