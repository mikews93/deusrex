import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';
import { healthProfessionalInsertSchema } from '@/database/schemas/zod-schemas';
import {
  CommonFilter,
  healthProfessionalFilterBaseSchema,
} from '@common/schemas/filter.schema';
import { parseQueryParameters } from '@common/utils/query-parser';
import { eq } from 'lodash';
import { users } from '@/database/schemas';

// Use the auto-generated schema from drizzle-zod
const healthProfessionalInputSchema = healthProfessionalInsertSchema.omit({
  id: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
  deletedAt: true,
  deletedBy: true,
});

export const healthProfessionalsRouter = router({
  // Get all health professionals for current organization
  getAll: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health-professionals',
        tags: ['health-professionals'],
        summary: 'Get all health professionals',
        description:
          'Retrieve all health professionals for the current organization with optional filtering and pagination',
        protect: true,
      },
    })
    .input(healthProfessionalFilterBaseSchema.optional())
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

      const parsedParams: Record<string, any> = parseQueryParameters(
        input?.with,
        input?.columns,
      );

      parsedParams.with = {
        ...parsedParams.with,
        user: {
          where: eq(users.organizationId, ctx.user.organizationId),
        },
      };
      const fullFilters = {
        ...input,
        paginated: input?.paginated ?? false,
        page: input?.page ?? 1,
        limit: input?.limit ?? 20,
        sortOrder: input?.sortOrder ?? 'desc',
        includeDeleted: input?.includeDeleted ?? false,
        ...parsedParams,
      };

      return services.healthProfessionalsService.findAll(
        ctx.user.organizationId,
        false,
        fullFilters as CommonFilter,
      );
    }),

  // Get health professional by ID
  getById: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health-professionals/{id}',
        tags: ['health-professionals'],
        summary: 'Get health professional by ID',
        description: 'Retrieve a specific health professional by their ID',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.findOne(
        input.id,
        ctx.user.organizationId,
      );
    }),

  // Create new health professional
  create: organizationProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/health-professionals',
        tags: ['health-professionals'],
        summary: 'Create new health professional',
        description:
          'Create a new health professional for the current organization',
        protect: true,
      },
    })
    .input(healthProfessionalInputSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.create(
        input,
        ctx.user.organizationId,
        ctx.user.id.toString(),
      );
    }),

  // Update health professional
  update: organizationProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/health-professionals/{id}',
        tags: ['health-professionals'],
        summary: 'Update health professional',
        description: 'Update an existing health professional',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        data: healthProfessionalInputSchema.partial(),
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.update(
        input.id,
        input.data,
        ctx.user.organizationId,
        ctx.user.id.toString(),
      );
    }),

  // Delete health professional (soft delete)
  delete: organizationProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/health-professionals/{id}',
        tags: ['health-professionals'],
        summary: 'Delete health professional',
        description: 'Soft delete a health professional',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.remove(
        input.id,
        ctx.user.organizationId,
        ctx.user.id.toString(),
      );
    }),

  // Get health professionals by type
  getByType: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health-professionals/type/{type}',
        tags: ['health-professionals'],
        summary: 'Get health professionals by type',
        description: 'Retrieve health professionals filtered by their type',
        protect: true,
      },
    })
    .input(
      z.object({
        type: z.enum([
          'doctor',
          'nurse',
          'specialist',
          'therapist',
          'technician',
          'administrator',
        ]),
      }),
    )
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.getByType(
        input.type,
        ctx.user.organizationId,
      );
    }),

  // Get health professionals by specialty
  getBySpecialty: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health-professionals/specialty/{specialty}',
        tags: ['health-professionals'],
        summary: 'Get health professionals by specialty',
        description:
          'Retrieve health professionals filtered by their specialty',
        protect: true,
      },
    })
    .input(
      z.object({
        specialty: z.enum([
          'general_practice',
          'cardiology',
          'dermatology',
          'neurology',
          'orthopedics',
          'pediatrics',
          'psychiatry',
          'radiology',
          'surgery',
          'emergency_medicine',
          'internal_medicine',
          'family_medicine',
          'oncology',
          'gynecology',
          'urology',
          'ophthalmology',
          'otolaryngology',
          'anesthesiology',
          'pathology',
          'other',
        ]),
      }),
    )
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.getBySpecialty(
        input.specialty,
        ctx.user.organizationId,
      );
    }),

  // Get available health professionals
  getAvailable: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health-professionals/available',
        tags: ['health-professionals'],
        summary: 'Get available health professionals',
        description: 'Retrieve all available health professionals',
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(z.any()))
    .query(async ({ ctx }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.getAvailable(
        ctx.user.organizationId,
      );
    }),

  // Update availability status
  updateAvailability: organizationProcedure
    .meta({
      openapi: {
        method: 'PATCH',
        path: '/health-professionals/{id}/availability',
        tags: ['health-professionals'],
        summary: 'Update health professional availability',
        description: 'Update the availability status of a health professional',
        protect: true,
      },
    })
    .input(
      z.object({
        id: z.string().uuid(),
        isAvailable: z.boolean(),
      }),
    )
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.updateAvailability(
        input.id,
        input.isAvailable,
        ctx.user.id.toString(),
      );
    }),

  // Get health professional statistics
  getStatistics: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/health-professionals/statistics',
        tags: ['health-professionals'],
        summary: 'Get health professional statistics',
        description:
          'Retrieve statistics about health professionals in the organization',
        protect: true,
      },
    })
    .input(z.void())
    .output(
      z.object({
        total: z.number(),
        active: z.number(),
        available: z.number(),
        inactive: z.number(),
        unavailable: z.number(),
      }),
    )
    .query(async ({ ctx }) => {
      const { services } = ctx;

      return services.healthProfessionalsService.getStatistics(
        ctx.user.organizationId,
      );
    }),
});
