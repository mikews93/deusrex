import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';
import { patientInsertSchema } from '@database/schemas/zod-schemas';
import {
  CommonFilter,
  patientFilterBaseSchema,
} from '@common/schemas/filter.schema';
import { parseQueryParameters } from '@common/utils/query-parser';

// Use the auto-generated schema from drizzle-zod
const patientInputSchema = patientInsertSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  deletedAt: true,
  deletedBy: true,
});

export const patientsRouter = router({
  // Get all patients for current organization
  getAll: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/patients',
        tags: ['patients'],
        summary: 'Get all patients',
        description:
          'Retrieve all patients for the current organization with optional filtering and pagination',
        protect: true,
      },
    })
    .input(patientFilterBaseSchema.optional())
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
        ...parsedParams,
        paginated: input?.paginated ?? false,
        page: input?.page ?? 1,
        limit: input?.limit ?? 20,
        sortOrder: input?.sortOrder ?? 'desc',
        includeDeleted: input?.includeDeleted ?? false,
      };

      return services.patientsService.findAll(
        ctx.user.organizationId,
        false,
        fullFilters as CommonFilter,
      );
    }),

  // Get patient statistics
  getStatistics: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/patients/statistics',
        tags: ['patients'],
        summary: 'Get patient statistics',
        description: 'Retrieve statistics about patients in the organization',
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.object({
        total: z.number(),
        active: z.number(),
        inactive: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const { services } = ctx;

      return services.patientsService.getStatistics(ctx.user.organizationId);
    }),

  // Get patient by ID
  getById: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/patients/{id}',
        tags: ['patients'],
        summary: 'Get patient by ID',
        description: 'Retrieve a specific patient by their ID',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.patientsService.findOne(
        input.id,
        ctx.user.organizationId,
      );
    }),

  // Create new patient
  create: organizationProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/patients',
        tags: ['patients'],
        summary: 'Create new patient',
        description: 'Create a new patient in the system',
        protect: true,
      },
    })
    .input(patientInputSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.patientsService.create(
        input,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  // Update patient
  update: organizationProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/patients/{id}',
        tags: ['patients'],
        summary: 'Update patient',
        description: 'Update an existing patient in the system',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: patientInputSchema.partial(),
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.patientsService.update(
        input.id,
        input.data,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  // Delete patient
  delete: organizationProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/patients/{id}',
        tags: ['patients'],
        summary: 'Delete patient',
        description: 'Delete a patient from the system',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.patientsService.remove(
        input.id,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  // Search patients
  search: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/patients/search',
        tags: ['patients'],
        summary: 'Search patients',
        description: 'Search patients by name or email',
        protect: true,
      },
    })
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      // Use the new findAll method with search filter
      const result = await services.patientsService.findAll(
        ctx.user.organizationId,
        false,
        {
          search: input.query,
          paginated: false,
          page: 1,
          limit: 20,
          sortOrder: 'desc',
          includeDeleted: false,
        },
      );

      // Handle both array and paginated responses
      return Array.isArray(result) ? result : result.data;
    }),
});
