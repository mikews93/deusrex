import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { organizations } from '@database/schemas/organizations.schema';
import { eq } from 'drizzle-orm';
import { createClerkClient, Organization } from '@clerk/backend';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

const organizationsData = [
  {
    name: 'General Healthcare Center',
    slug: 'general-healthcare',
    description:
      'Comprehensive healthcare facility providing primary care, preventive medicine, and general medical services',
    logoUrl: 'https://example.com/healthcare-logo1.png',
    isActive: true,
  },
  {
    name: 'Cardiology Center',
    slug: 'cardiology-center',
    description:
      'Specialized cardiac care facility offering heart disease treatment, cardiac procedures, and cardiovascular health services',
    logoUrl: 'https://example.com/cardiology-logo2.png',
    isActive: true,
  },
  {
    name: 'Pediatric Center',
    slug: 'pediatric-center',
    description:
      'Child-focused healthcare facility providing pediatric care, vaccinations, and child development services',
    logoUrl: 'https://example.com/pediatric-logo3.png',
    isActive: true,
  },
  {
    name: 'Mental Health Center',
    slug: 'mental-health-center',
    description:
      'Comprehensive mental health facility offering therapy, counseling, and psychiatric services',
    logoUrl: 'https://example.com/mental-health-logo4.png',
    isActive: true,
  },
  {
    name: 'Orthopedic Center',
    slug: 'orthopedic-center',
    description:
      'Specialized orthopedic facility providing bone and joint care, physical therapy, and rehabilitation services',
    logoUrl: 'https://example.com/orthopedic-logo5.png',
    isActive: true,
  },
];

export async function seedOrganizations() {
  console.log('🌱 Seeding organizations with Clerk...');

  // Initialize Clerk client
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  for (const orgData of organizationsData) {
    try {
      // Check if organization already exists in local database
      const [existingOrg] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, orgData.slug));

      const orgList = await clerk.organizations.getOrganizationList({
        query: orgData.slug,
      });

      const existingClerkOrg = orgList.data.find(
        (org) => org.slug === orgData.slug,
      );

      if (existingOrg && existingClerkOrg) {
        console.log(
          `⚠️  Organization: ${existingOrg.name} already exists in DB and Clerk`,
        );
        continue;
      }

      let clerkOrg: Organization;
      if (!existingClerkOrg) {
        clerkOrg = await clerk.organizations.createOrganization({
          name: orgData.name,
          slug: orgData.slug,
          publicMetadata: {
            description: orgData.description,
            logoUrl: orgData.logoUrl,
            isActive: orgData.isActive,
          },
        });

        console.log('🔗 Created Clerk Organization: -> ', clerkOrg.name);
      } else {
        clerkOrg = existingClerkOrg;
      }

      console.log('🔗 Clerk Organization: ->', clerkOrg.name);

      // Create organization in Clerk

      if (!existingOrg && clerkOrg) {
        // Create organization in local database
        const [organization] = await db
          .insert(organizations)
          .values({
            clerkOrgId: clerkOrg.id,
            name: orgData.name,
            slug: orgData.slug,
            description: orgData.description,
            logoUrl: orgData.logoUrl,
            isActive: orgData.isActive,
          })
          .returning();

        console.log(`✅ Created organization: ${organization.name}`);
        console.log(`📧 Clerk Organization ID: ${clerkOrg.id}`);
        console.log(`🔗 Organization Slug: ${orgData.slug}`);
      }
    } catch (error) {
      console.log(
        `❌ Error creating organization ${orgData.name}:`,
        error.message,
      );
    }
  }

  console.log('✅ Organizations seeding completed!');
  console.log('📝 Note: All organizations are now managed through Clerk.');
  console.log('🔐 Organization memberships and roles are handled by Clerk.');
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedOrganizations().finally(() => client.end());
}
