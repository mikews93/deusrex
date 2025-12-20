import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';
import { clientInsertSchema } from '@/database/types';

export const clientsRouter = router({
  getAll: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/clients',
        tags: ['clients'],
        summary: 'Get all clients',
        description: 'Retrieve all clients for the current organization',
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(z.any()))
    .query(async ({ ctx }) => {
      const { services } = ctx;

      const result = await services.clientsService.findAll(
        ctx.user.organizationId,
      );

      // Handle both array and paginated responses - return array for backward compatibility
      return Array.isArray(result) ? result : result.data;
    }),

  getById: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/clients/{id}',
        tags: ['clients'],
        summary: 'Get client by ID',
        description: 'Retrieve a specific client by its ID',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.clientsService.findOne(input.id, ctx.user.organizationId);
    }),

  create: organizationProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/clients',
        tags: ['clients'],
        summary: 'Create client',
        description: 'Create a new client in the system',
        protect: true,
      },
    })
    .input(clientInsertSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.clientsService.create(
        input,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  update: organizationProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/clients/{id}',
        tags: ['clients'],
        summary: 'Update client',
        description: 'Update an existing client in the system',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        ...clientInsertSchema.partial().omit({ id: true }).shape,
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;
      const { id, ...updateData } = input;

      return services.clientsService.update(
        id,
        updateData,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  delete: organizationProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/clients/{id}',
        tags: ['clients'],
        summary: 'Delete client',
        description: 'Delete a client from the system',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.clientsService.remove(
        input.id,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),
});
