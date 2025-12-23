import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';
import { saleInsertSchema, saleItemInsertSchema } from '@/database/types';
import {
  saleCreateSchema,
  saleUpdateSchema,
} from '@/database/schemas/zod-schemas';
import {
  salesFilterBaseSchema,
  CommonFilter,
} from '@common/schemas/filter.schema';
import { parseQueryParameters } from '@common/utils/query-parser';

export const salesRouter = router({
  getAll: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales',
        tags: ['sales'],
        summary: 'Get all sales',
        description:
          'Retrieve all sales for the current organization with optional filtering and pagination',
        protect: true,
      },
    })
    .input(salesFilterBaseSchema.optional())
    .output(
      z.union([
        z.array(z.any()),
        z.object({
          data: z.array(z.any()),
          total: z.number(),
          page: z.number(),
          limit: z.number(),
        }),
      ]),
    )
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      // Parse with and columns parameters from strings to objects
      const parsedParams: Record<string, any> = parseQueryParameters(
        input?.with,
        input?.columns,
      );

      const fullFilters = {
        ...input,
        paginated: input?.paginated ?? false,
        page: input?.page ?? 1,
        limit: input?.limit ?? 20,
        sortOrder: input?.sortOrder ?? 'desc',
        includeDeleted: input?.includeDeleted ?? false,
        ...parsedParams,
      };

      return services.salesService.findAll(
        ctx.user.organizationId,
        false,
        fullFilters as CommonFilter,
      );
    }),

  getStats: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/stats',
        tags: ['sales'],
        summary: 'Get sales statistics',
        description: 'Retrieve sales statistics for the current organization',
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.object({
        totalSales: z.number(),
        pendingSales: z.number(),
        totalTransactions: z.number(),
        totalAmount: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const { services } = ctx;

      const result = await services.salesService.findAll(
        ctx.user.organizationId,
      );

      // Handle both array and paginated responses - extract array for stats calculation
      const allSales = Array.isArray(result) ? result : result.data;

      const totalSales = allSales.length;
      const pendingSales = allSales.filter(
        (sale) => sale.status === 'draft',
      ).length;
      const totalTransactions = allSales.filter(
        (sale) => sale.status === 'completed',
      ).length;
      const totalAmount = allSales.reduce(
        (sum, sale) => sum + Number(sale.totalAmount),
        0,
      );

      return {
        totalSales,
        pendingSales,
        totalTransactions,
        totalAmount,
      };
    }),

  search: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/search',
        tags: ['sales'],
        summary: 'Search sales',
        description: 'Search sales by query, status, and limit',
        protect: true,
      },
    })
    .input(
      z.object({
        query: z.string().min(1).optional(),
        status: z.enum(['pending', 'completed', 'cancelled']).optional(),
        limit: z.number().min(1).max(100).optional().default(50),
      }),
    )
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;
      const { query, status, limit } = input;

      // Note: This search functionality would need to be implemented in the SalesService
      // For now, we'll return all sales and filter on the client side
      // TODO: Implement search in SalesService
      const result = await services.salesService.findAll(
        ctx.user.organizationId,
      );

      // Handle both array and paginated responses - extract array for filtering
      const allSales = Array.isArray(result) ? result : result.data;

      let filteredSales = allSales;

      if (status) {
        filteredSales = filteredSales.filter((sale) => sale.status === status);
      }

      if (query && query.trim() !== '') {
        // Simple search by sale ID (UUID string)
        filteredSales = filteredSales.filter((sale) =>
          sale.id.toLowerCase().includes(query.toLowerCase()),
        );
      }

      return filteredSales.slice(0, limit);
    }),

  getById: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/{id}',
        tags: ['sales'],
        summary: 'Get sale by ID',
        description: 'Retrieve a specific sale by its ID',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        with: z.string().optional(),
        columns: z.string().optional(),
      }),
    )
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      const { with: withParams, columns: columnsParams }: Record<string, any> =
        parseQueryParameters(input?.with, input?.columns);

      return services.salesService.findOne(
        input.id,
        ctx.user.organizationId,
        false,
        withParams,
        columnsParams,
      );
    }),

  create: organizationProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/sales',
        tags: ['sales'],
        summary: 'Create sale',
        description: 'Create a new sale in the system',
        protect: true,
      },
    })
    .input(
      z.object({
        sale: saleInsertSchema.omit({
          id: true,
          organizationId: true,
          createdAt: true,
          updatedAt: true,
          createdBy: true,
          updatedBy: true,
          deletedAt: true,
          deletedBy: true,
        }),
        items: z.array(
          saleItemInsertSchema.omit({
            id: true,
            saleId: true,
            createdAt: true,
          }),
        ),
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;
      const { sale, items } = input;

      if (!items || items.length === 0) {
        throw new Error('Sale must have at least one item');
      }

      // Validate items
      for (const item of items) {
        if (!item.itemId) {
          throw new Error('Item must have an item ID');
        }
        if (!item.quantity || Number(item.quantity) <= 0) {
          throw new Error('Item quantity must be greater than 0');
        }
        if (Number(item.unitPrice) <= 0) {
          throw new Error('Item unit price must be greater than 0');
        }
        if (Number(item.totalPrice) <= 0) {
          throw new Error('Item total price must be greater than 0');
        }
      }

      // Convert dates to Date objects as expected by saleCreateSchema
      const saleData = {
        ...sale,
        organizationId: ctx.user.organizationId,
        saleItems: items,
        issueDate: sale.issueDate ? new Date(sale.issueDate) : new Date(),
        dueDate: sale.dueDate ? new Date(sale.dueDate) : undefined,
      } as z.infer<typeof saleCreateSchema>;

      return services.salesService.create(
        saleData,
        ctx.user.organizationId,
        ctx.user.id.toString(),
      );
    }),

  update: organizationProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/sales/{id}',
        tags: ['sales'],
        summary: 'Update sale',
        description: 'Update an existing sale in the system',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        ...saleInsertSchema.partial().omit({ id: true }).shape,
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;
      const { id, ...updateData } = input;

      const updatePayload = {
        ...updateData,
        ...(updateData.totalAmount && {
          totalAmount: updateData.totalAmount.toString(),
        }),
        ...(updateData.saleDate && {
          saleDate: new Date(updateData.saleDate).toISOString().split('T')[0],
        }),
      };

      return services.salesService.update(
        id,
        updatePayload,
        ctx.user.organizationId,
        ctx.user.id.toString(),
      );
    }),

  remove: organizationProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/sales/{id}',
        tags: ['sales'],
        summary: 'Delete sale',
        description: 'Delete a sale from the system',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.salesService.remove(
        input.id,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  getByProduct: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/product/{productId}',
        tags: ['sales'],
        summary: 'Get sales by product ID',
        description: 'Retrieve all sales for a specific product',
        protect: true,
      },
    })
    .input(z.object({ productId: z.string().uuid() }))
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.salesService.getSalesByProduct(
        input.productId,
        ctx.user.organizationId,
      );
    }),

  getByItem: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/item/{itemId}',
        tags: ['sales'],
        summary: 'Get sales by item ID',
        description: 'Retrieve all sales for a specific item',
        protect: true,
      },
    })
    .input(z.object({ itemId: z.string().uuid() }))
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.salesService.getSalesByItem(
        input.itemId,
        ctx.user.organizationId,
      );
    }),

  // Multi-country compliance endpoints
  getByJurisdiction: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/jurisdiction/{jurisdictionId}',
        tags: ['sales'],
        summary: 'Get sales by jurisdiction',
        description: 'Retrieve all sales for a specific jurisdiction',
        protect: true,
      },
    })
    .input(z.object({ jurisdictionId: z.string() }))
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.salesService.getSalesByJurisdiction(
        input.jurisdictionId,
        ctx.user.organizationId,
      );
    }),

  getByStatus: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/status/{status}',
        tags: ['sales'],
        summary: 'Get sales by status',
        description: 'Retrieve all sales with a specific status',
        protect: true,
      },
    })
    .input(
      z.object({
        status: z.enum(['draft', 'issued', 'accepted', 'cancelled']),
      }),
    )
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.salesService.getSalesByStatus(
        input.status,
        ctx.user.organizationId,
      );
    }),

  getByCurrency: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/currency/{currency}',
        tags: ['sales'],
        summary: 'Get sales by currency',
        description: 'Retrieve all sales in a specific currency',
        protect: true,
      },
    })
    .input(z.object({ currency: z.string().length(3) }))
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.salesService.getSalesByCurrency(
        input.currency,
        ctx.user.organizationId,
      );
    }),

  updateStatus: organizationProcedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/sales/{id}/status',
        tags: ['sales'],
        summary: 'Update sale status',
        description: 'Update the status of a sale',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(['draft', 'issued', 'accepted', 'cancelled']),
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.salesService.updateSaleStatus(
        input.id,
        input.status,
        ctx.user.organizationId,
        ctx.user.id.toString(),
      );
    }),

  generateSaleNumber: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/sales/generate-number',
        tags: ['sales'],
        summary: 'Generate sale number',
        description: 'Generate a unique sale number for a jurisdiction',
        protect: true,
      },
    })
    .input(z.object({ jurisdictionId: z.string() }))
    .output(z.string())
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.salesService.generateSaleNumber(
        ctx.user.organizationId,
        input.jurisdictionId,
      );
    }),
});
