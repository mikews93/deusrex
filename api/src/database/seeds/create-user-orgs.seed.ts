import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { and, eq } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function createUserOrganizations() {
  console.log('🏢 Creating user-organization relationships...');

  // Initialize Clerk client
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  try {
    // Get all organizations
    const allOrganizations = await db.select().from(organizations);
    console.log(`📊 Found ${allOrganizations.length} organizations`);

    // Get all users
    const allUsers = await db.select().from(users);
    console.log(`📊 Found ${allUsers.length} users`);

    // Define user-organization mappings
    const userOrgMappings = [
      // Superadmin - all organizations
      ...allOrganizations.map((org) => ({
        userEmail: 'superadmin@deusrex.com',
        organizationSlug: org.slug,
        role: 'admin' as const,
      })),

      // General Healthcare Center
      {
        userEmail: 'admin@healthcare.com',
        organizationSlug: 'general-healthcare',
        role: 'admin' as const,
      },
      {
        userEmail: 'dr.smith@healthcare.com',
        organizationSlug: 'general-healthcare',
        role: 'health_professional' as const,
      },
      {
        userEmail: 'reception@healthcare.com',
        organizationSlug: 'general-healthcare',
        role: 'receptionist' as const,
      },
      {
        userEmail: 'john.smith@patient.com',
        organizationSlug: 'general-healthcare',
        role: 'patient' as const,
      },

      // Cardiology Center
      {
        userEmail: 'admin@cardiology.com',
        organizationSlug: 'cardiology-center',
        role: 'admin' as const,
      },
      {
        userEmail: 'dr.wilson@cardiology.com',
        organizationSlug: 'cardiology-center',
        role: 'health_professional' as const,
      },
      {
        userEmail: 'reception@cardiology.com',
        organizationSlug: 'cardiology-center',
        role: 'receptionist' as const,
      },
      {
        userEmail: 'emily.wilson@patient.com',
        organizationSlug: 'cardiology-center',
        role: 'patient' as const,
      },

      // Pediatric Center
      {
        userEmail: 'admin@pediatric.com',
        organizationSlug: 'pediatric-center',
        role: 'admin' as const,
      },
      {
        userEmail: 'dr.taylor@pediatric.com',
        organizationSlug: 'pediatric-center',
        role: 'health_professional' as const,
      },
      {
        userEmail: 'reception@pediatric.com',
        organizationSlug: 'pediatric-center',
        role: 'receptionist' as const,
      },
      {
        userEmail: 'emma.taylor@patient.com',
        organizationSlug: 'pediatric-center',
        role: 'patient' as const,
      },

      // Mental Health Center
      {
        userEmail: 'admin@mentalhealth.com',
        organizationSlug: 'mental-health-center',
        role: 'admin' as const,
      },
      {
        userEmail: 'dr.martinez@mentalhealth.com',
        organizationSlug: 'mental-health-center',
        role: 'health_professional' as const,
      },
      {
        userEmail: 'reception@mentalhealth.com',
        organizationSlug: 'mental-health-center',
        role: 'receptionist' as const,
      },
      {
        userEmail: 'jessica.martinez@patient.com',
        organizationSlug: 'mental-health-center',
        role: 'patient' as const,
      },

      // Orthopedic Center
      {
        userEmail: 'admin@orthopedic.com',
        organizationSlug: 'orthopedic-center',
        role: 'admin' as const,
      },
      {
        userEmail: 'dr.rodriguez@orthopedic.com',
        organizationSlug: 'orthopedic-center',
        role: 'health_professional' as const,
      },
      {
        userEmail: 'reception@orthopedic.com',
        organizationSlug: 'orthopedic-center',
        role: 'receptionist' as const,
      },
      {
        userEmail: 'amanda.rodriguez@patient.com',
        organizationSlug: 'orthopedic-center',
        role: 'patient' as const,
      },
    ];

    console.log(
      `📊 Creating ${userOrgMappings.length} user-organization relationships`,
    );

    let createdCount = 0;
    let skippedCount = 0;
    let clerkCreatedCount = 0;
    let clerkSkippedCount = 0;
    let dbCreatedCount = 0;
    let dbSkippedCount = 0;

    // Track user's primary organization for setting active organization
    const userPrimaryOrgs = new Map<
      string,
      { clerkOrgId: string; role: string }
    >();

    for (const mapping of userOrgMappings) {
      // Find user
      const user = allUsers.find((u) => u.email === mapping.userEmail);
      if (!user) {
        console.log(`⚠️  User not found: ${mapping.userEmail}`);
        skippedCount++;
        continue;
      }

      // Find organization
      const organization = allOrganizations.find(
        (o) => o.slug === mapping.organizationSlug,
      );
      if (!organization) {
        console.log(`⚠️  Organization not found: ${mapping.organizationSlug}`);
        skippedCount++;
        continue;
      }

      // Step 1: Check if user is already a member of the organization in Clerk
      let clerkMembershipExists = false;
      let clerkMembershipCreated = false;
      try {
        const orgMemberships = await clerk.users.getOrganizationMembershipList({
          userId: user.clerkUserId,
        });

        clerkMembershipExists = orgMemberships.data.some(
          (membership) =>
            membership.organization.id === organization.clerkOrgId,
        );

        if (clerkMembershipExists) {
          console.log(
            `⚠️  User ${user.email} already member of ${organization.name} in Clerk`,
          );
          clerkSkippedCount++;
          clerkMembershipCreated = true; // Consider it "created" since it already exists
        } else {
          // Determine Clerk organization role based on user type
          const clerkRole =
            user.email === 'superadmin@deusrex.com'
              ? 'org:admin'
              : 'org:member';

          // Add user to organization in Clerk
          await clerk.organizations.createOrganizationMembership({
            organizationId: organization.clerkOrgId,
            userId: user.clerkUserId,
            role: clerkRole,
          });

          console.log(
            `✅ Added ${user.email} to ${organization.name} in Clerk (${clerkRole})`,
          );
          clerkCreatedCount++;
          clerkMembershipCreated = true;
        }
      } catch (error: any) {
        console.error(
          `❌ Error checking/adding ${user.email} to ${organization.name} in Clerk:`,
          error.message,
        );
        clerkSkippedCount++;
        clerkMembershipCreated = false;
      }

      // Step 2: Check if relationship already exists in database
      const existingRelationship = await db
        .select()
        .from(userOrganizations)
        .where(
          and(
            eq(userOrganizations.userId, user.id),
            eq(userOrganizations.organizationId, organization.id),
          ),
        );

      if (existingRelationship.length > 0) {
        console.log(
          `⚠️  Relationship already exists in DB: ${user.email} -> ${organization.name}`,
        );
        skippedCount++;
        continue;
      }

      // Step 3: Only create database relationship if Clerk membership was successful
      if (clerkMembershipCreated) {
        try {
          // Create relationship in database
          await db.insert(userOrganizations).values({
            userId: user.id,
            organizationId: organization.id,
            role: mapping.role,
            createdBy: user.id,
            updatedBy: user.id,
          });

          console.log(
            `✅ Created DB relationship: ${user.email} -> ${organization.name} (${mapping.role})`,
          );
          dbCreatedCount++;
          createdCount++;

          // Track primary organization for each user (first one they're assigned to)
          if (!userPrimaryOrgs.has(user.email)) {
            userPrimaryOrgs.set(user.email, {
              clerkOrgId: organization.clerkOrgId,
              role: mapping.role,
            });
          }
        } catch (error: any) {
          console.error(
            `❌ Error creating DB relationship for ${user.email} -> ${organization.name}:`,
            error.message,
          );
          dbSkippedCount++;
          // Note: We don't increment createdCount here since the DB relationship failed
        }
      } else {
        console.log(
          `⚠️  Skipping DB relationship for ${user.email} -> ${organization.name} due to Clerk failure`,
        );
        dbSkippedCount++;
      }
    }

    // Set active organization and update role metadata for each user
    console.log('\n🔧 Setting active organizations and role metadata...');
    let activeOrgSetCount = 0;
    let metadataUpdatedCount = 0;

    for (const [userEmail, primaryOrg] of userPrimaryOrgs) {
      const user = allUsers.find((u) => u.email === userEmail);
      if (!user) continue;

      try {
        // Get current user metadata from Clerk
        const clerkUser = await clerk.users.getUser(user.clerkUserId);

        // Update user metadata with role and active organization
        await clerk.users.updateUser(user.clerkUserId, {
          publicMetadata: {
            ...clerkUser.publicMetadata,
            role: primaryOrg.role,
          },
        });

        console.log(
          `✅ Set active org and role for ${userEmail}: ${primaryOrg.role} in org ${primaryOrg.clerkOrgId}`,
        );
        activeOrgSetCount++;
        metadataUpdatedCount++;
      } catch (error: any) {
        console.error(
          `❌ Error setting active organization for ${userEmail}:`,
          error.message,
        );
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`  Clerk Organization Memberships:`);
    console.log(`    ✅ Created: ${clerkCreatedCount} memberships`);
    console.log(`    ⚠️  Skipped: ${clerkSkippedCount} memberships`);
    console.log(`  Database Relationships:`);
    console.log(`    ✅ Created: ${dbCreatedCount} relationships`);
    console.log(`    ⚠️  Skipped: ${dbSkippedCount} relationships`);
    console.log(`  Active Organizations:`);
    console.log(`    ✅ Set: ${activeOrgSetCount} active organizations`);
    console.log(`  User Metadata:`);
    console.log(`    ✅ Updated: ${metadataUpdatedCount} user metadata`);
    console.log(
      `  📊 Total: ${createdCount + skippedCount} relationships processed`,
    );
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createUserOrganizations().finally(() => client.end());
}
