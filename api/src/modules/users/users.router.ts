import { z } from 'zod';
import { router, organizationProcedure } from '@/modules/trpc/trpc';

export const usersRouter = router({
  // Get all users in the current organization
  getAll: organizationProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/users',
        tags: ['users'],
        summary: 'Get all users in organization',
        description: 'Retrieve all users for the current organization',
        protect: true,
      },
    })
    .input(z.void())
    .output(z.array(z.any()))
    .query(async ({ ctx }) => {
      const { services } = ctx;

      return services.usersService.getUsersInOrganization(
        ctx.user.organizationId,
      );
    }),
});
