import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';
import { itemInsertSchema } from '@/database/types';
import {
  CommonFilter,
  itemFilterBaseSchema,
} from '@/common/schemas/filter.schema';
import { parseQueryParameters } from '@common/utils/query-parser';

export const itemsRouter = router({
  getAll: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/items',
        tags: ['items'],
        summary: 'Get all items',
        description:
          'Retrieve all items (products and services) for the current organization',
        protect: true,
      },
    })
    .input(itemFilterBaseSchema.optional())
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

      const result = await services.itemsService.findAll(
        ctx.user.organizationId,
        fullFilters.includeDeleted,
        fullFilters as CommonFilter,
      );

      // Handle both array and paginated responses - return array for backward compatibility
      return Array.isArray(result) ? result : result.data;
    }),

  getById: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/items/{id}',
        tags: ['items'],
        summary: 'Get item by ID',
        description: 'Retrieve a specific item by its ID',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.itemsService.findOne(input.id, ctx.user.organizationId);
    }),

  getByType: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/items/type/{type}',
        tags: ['items'],
        summary: 'Get items by type',
        description: 'Retrieve items filtered by type (product or service)',
        protect: true,
      },
    })
    .input(z.object({ type: z.enum(['product', 'service']) }))
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.itemsService.getByType(
        input.type,
        ctx.user.organizationId,
      );
    }),

  getProducts: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/items/products',
        tags: ['items'],
        summary: 'Get products only',
        description: 'Retrieve only product items',
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(z.any()))
    .query(async ({ ctx }) => {
      const { services } = ctx;

      return services.itemsService.getProducts(ctx.user.organizationId);
    }),

  getServices: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/items/services',
        tags: ['items'],
        summary: 'Get services only',
        description: 'Retrieve only service items',
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(z.any()))
    .query(async ({ ctx }) => {
      const { services } = ctx;

      return services.itemsService.getServices(ctx.user.organizationId);
    }),

  getLowStock: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/items/low-stock',
        tags: ['items'],
        summary: 'Get low stock products',
        description: 'Retrieve products with low stock levels',
        protect: true,
      },
    })
    .input(z.object({ threshold: z.number().min(0).optional() }))
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.itemsService.getLowStockProducts(
        input.threshold || 10,
        ctx.user.organizationId,
      );
    }),

  create: organizationProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/items',
        tags: ['items'],
        summary: 'Create item',
        description: 'Create a new item (product or service)',
        protect: true,
      },
    })
    .input(itemInsertSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.itemsService.create(
        input,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  update: organizationProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/items/{id}',
        tags: ['items'],
        summary: 'Update item',
        description: 'Update an existing item',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        ...itemInsertSchema.partial().omit({ id: true }).shape,
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;
      const { id, ...updateData } = input;

      return services.itemsService.update(
        id,
        updateData,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  updateStock: organizationProcedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/items/{id}/stock',
        tags: ['items'],
        summary: 'Update stock',
        description: 'Update stock level for a product',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        stock: z.number().min(0),
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.itemsService.updateStock(
        input.id,
        input.stock,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  delete: organizationProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/items/{id}',
        tags: ['items'],
        summary: 'Delete item',
        description: 'Delete an item from the system',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.itemsService.remove(
        input.id,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),
});
