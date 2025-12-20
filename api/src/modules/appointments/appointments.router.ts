import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';
import { appointmentInsertSchema } from '@/database/types';
import {
  appointmentFilterBaseSchema,
  CommonFilter,
} from '@common/schemas/filter.schema';
import { parseQueryParameters } from '@common/utils/query-parser';

export const appointmentsRouter = router({
  getAll: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/appointments',
        tags: ['appointments'],
        summary: 'Get all appointments',
        description:
          'Retrieve all appointments for the current organization with optional filtering and pagination',
        protect: true,
      },
    })
    .input(appointmentFilterBaseSchema.optional())
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

      return services.appointmentsService.findAll(
        ctx.user.organizationId,
        false,
        fullFilters as CommonFilter,
      );
    }),

  // Get appointment statistics
  getStatistics: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/appointments/statistics',
        tags: ['appointments'],
        summary: 'Get appointment statistics',
        description:
          'Retrieve statistics about appointments in the organization',
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.object({
        total: z.number(),
        today: z.number(),
        scheduled: z.number(),
        completed: z.number(),
        cancelled: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const { services } = ctx;

      return services.appointmentsService.getStatistics(
        ctx.user.organizationId,
      );
    }),

  getById: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/appointments/{id}',
        tags: ['appointments'],
        summary: 'Get appointment by ID',
        description: 'Retrieve a specific appointment by its ID',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.appointmentsService.findOne(
        input.id,
        ctx.user.organizationId,
      );
    }),

  create: organizationProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/appointments',
        tags: ['appointments'],
        summary: 'Create appointment',
        description: 'Create a new appointment in the system',
        protect: true,
      },
    })
    .input(appointmentInsertSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.appointmentsService.create(
        input,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  update: organizationProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/appointments/{id}',
        tags: ['appointments'],
        summary: 'Update appointment',
        description: 'Update an existing appointment in the system',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        ...appointmentInsertSchema.partial().omit({ id: true }).shape,
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;
      const { id, ...updateData } = input;

      const updatePayload = {
        ...updateData,
        ...(updateData.appointmentDate && {
          appointmentDate: new Date(updateData.appointmentDate),
        }),
        ...(updateData.startTime && {
          startTime: new Date(updateData.startTime),
        }),
        ...(updateData.endTime && { endTime: new Date(updateData.endTime) }),
      };

      return services.appointmentsService.update(
        id,
        updatePayload as any,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  delete: organizationProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/appointments/{id}',
        tags: ['appointments'],
        summary: 'Delete appointment',
        description: 'Delete an appointment from the system',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.appointmentsService.remove(
        input.id,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),
});
