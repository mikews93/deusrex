import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';
import {
  medicalRecordInsertSchema,
  medicalRecordSelectSchema,
} from '@/database/types';

export const medicalRecordsRouter = router({
  getAll: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/medical-records',
        tags: ['medical-records'],
        summary: 'Get all medical records',
        description:
          'Retrieve all medical records for the current organization',
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(z.any()))
    .query(async ({ ctx }) => {
      const { services } = ctx;

      const result = await services.medicalRecordsService.findAll(
        ctx.user.organizationId,
      );

      // Handle both array and paginated responses - return array for backward compatibility
      return Array.isArray(result) ? result : result.data;
    }),

  getById: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/medical-records/{id}',
        tags: ['medical-records'],
        summary: 'Get medical record by ID',
        description: 'Retrieve a specific medical record by its ID',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.medicalRecordsService.findOne(
        input.id,
        ctx.user.organizationId,
      );
    }),

  getByPatientId: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/medical-records/patient/{patientId}',
        tags: ['medical-records'],
        summary: 'Get medical records by patient ID',
        description: 'Retrieve all medical records for a specific patient',
        protect: true,
      },
    })
    .input(z.object({ patientId: z.string().uuid() }))
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.medicalRecordsService.findByPatient(
        input.patientId,
        ctx.user.organizationId,
      );
    }),

  create: organizationProcedure
    .meta({
      openapi: {
        method: 'POST',
        path: '/medical-records',
        tags: ['medical-records'],
        summary: 'Create medical record',
        description: 'Create a new medical record in the system',
        protect: true,
      },
    })
    .input(medicalRecordInsertSchema.omit({ organizationId: true }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;
      const { followUpDate, ...inputData } = input;

      return services.medicalRecordsService.create(
        {
          ...inputData,
          ...(followUpDate && { followUpDate: new Date(followUpDate) }),
        },
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  update: organizationProcedure
    .meta({
      openapi: {
        method: 'PUT',
        path: '/medical-records/{id}',
        tags: ['medical-records'],
        summary: 'Update medical record',
        description: 'Update an existing medical record in the system',
        protect: true,
      },
    })
    .input(medicalRecordSelectSchema)
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;
      const { id, followUpDate, ...updateData } = input;

      const updatePayload = {
        ...updateData,
        ...(followUpDate && { followUpDate: new Date(followUpDate) }),
      };

      return services.medicalRecordsService.update(
        id,
        updatePayload,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),

  delete: organizationProcedure
    .meta({
      openapi: {
        method: 'DELETE',
        path: '/medical-records/{id}',
        tags: ['medical-records'],
        summary: 'Delete medical record',
        description: 'Delete a medical record from the system',
        protect: true,
      },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.any())
    .mutation(async ({ ctx, input }) => {
      const { services } = ctx;

      return services.medicalRecordsService.remove(
        input.id,
        ctx.user.organizationId,
        ctx.user.id,
      );
    }),
});
