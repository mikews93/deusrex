import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';
import { organizationInsertSchema } from '@/database/types';

export const organizationsRouter = router({
  getAll: organizationProcedure.query(async ({ ctx }) => {
    const { services } = ctx;

    return services.organizationsService.findAll();
  }),

  getById: organizationProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.organizationsService.findOne(input.id);
    }),

  create: organizationProcedure
    .input(organizationInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.organizationsService.create(input);
    }),

  update: organizationProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        ...organizationInsertSchema.partial().omit({ id: true }).shape,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;
      const { id, ...updateData } = input;

      return services.organizationsService.update(id, updateData);
    }),

  delete: organizationProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.organizationsService.remove(input.id);
    }),
});
