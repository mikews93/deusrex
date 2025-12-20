import { router, protectedProcedure } from '@/modules/trpc/trpc';

export const authRouter = router({
  // Get current user information
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      user: ctx.user,
    };
  }),

  // Get user's organizations
  myOrganizations: protectedProcedure.query(async ({ ctx }) => {
    const { services } = ctx;

    // Get user's organization memberships
    const userOrgs = await services.usersService.getUserOrganizations(
      ctx.user.id,
    );

    // Get organization details for each membership
    const organizationsWithDetails = await Promise.all(
      userOrgs.map(async (userOrg) => {
        const organization = await services.organizationsService.findOne(
          userOrg.organizationId,
        );
        return {
          organizationId: userOrg.organizationId,
          organizationName: organization?.name || 'Unknown Organization',
          organizationSlug: organization?.slug || '',
          organizationDescription: organization?.description || '',
          organizationLogoUrl: organization?.logoUrl || '',
          role: userOrg.role,
        };
      }),
    );

    return organizationsWithDetails;
  }),

  // Get current organization context
  currentOrganization: protectedProcedure.query(async ({ ctx }) => {
    const { services } = ctx;

    return services.organizationsService.findOne(ctx.user.organizationId);
  }),
});
