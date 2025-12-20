import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@database/schemas/users.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function setActiveOrganizations() {
  console.log('🔧 Setting active organizations for users...');

  // Initialize Clerk client
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  try {
    // Get all users with their organization memberships
    const userOrgs = await db
      .select({
        userId: users.id,
        clerkUserId: users.clerkUserId,
        email: users.email,
        name: users.name,
        organizationId: userOrganizations.organizationId,
        organizationName: organizations.name,
        clerkOrgId: organizations.clerkOrgId,
        role: userOrganizations.role,
      })
      .from(users)
      .innerJoin(
        userOrganizations,
        and(
          eq(users.id, userOrganizations.userId),
          eq(userOrganizations.isActive, true),
        ),
      )
      .innerJoin(
        organizations,
        eq(userOrganizations.organizationId, organizations.id),
      );

    console.log(`📊 Found ${userOrgs.length} user-organization relationships`);

    // Group users by their primary organization (first one they're assigned to)
    const userPrimaryOrgs = new Map();
    for (const userOrg of userOrgs) {
      if (!userPrimaryOrgs.has(userOrg.userId)) {
        userPrimaryOrgs.set(userOrg.userId, userOrg);
      }
    }

    console.log(
      `📊 Setting active organization for ${userPrimaryOrgs.size} users`,
    );

    // Set active organization for each user
    for (const [userId, userOrg] of userPrimaryOrgs) {
      try {
        // Get the current Clerk user to preserve existing metadata
        const clerkUser = await clerk.users.getUser(userOrg.clerkUserId);

        // Update the user's public metadata to set the active organization
        await clerk.users.updateUser(userOrg.clerkUserId, {
          publicMetadata: {
            ...clerkUser.publicMetadata,
            activeOrganizationId: userOrg.clerkOrgId,
          },
        });

        console.log(
          `✅ Set ${userOrg.organizationName} as active organization for ${userOrg.email}`,
        );
      } catch (error: any) {
        console.error(
          `❌ Error setting active organization for ${userOrg.email}:`,
          error.message,
        );
      }
    }

    console.log('✅ Active organization setting completed!');
    console.log(
      '📝 Note: Users will now have their assigned organization as the default active one.',
    );
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  setActiveOrganizations();
}
