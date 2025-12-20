import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { eq } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';

/**
 * Environment Variables:
 * - SUPERADMIN_PASSWORD: Optional password for the superadmin user. If not set, a secure password will be generated.
 * - CLERK_SECRET_KEY: Required Clerk secret key for user management
 * - DATABASE_URL: Database connection string
 */

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

// Generate a secure password that meets Clerk's requirements
function generateSecurePassword(): string {
  const length = 16;
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';

  // Ensure at least one of each required character type
  password += 'A'; // uppercase
  password += 'a'; // lowercase
  password += '1'; // number
  password += '!'; // special character

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

// Generate a random avatar URL
function generateAvatarUrl(): string {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  return `https://avatar.iran.liara.run/public/${randomNumber}`;
}

export async function seedUsers() {
  console.log('🌱 Seeding users with Clerk...');

  // Initialize Clerk client
  const clerk = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
  });

  // Create one superadmin user
  // Use environment variable for superadmin password, or generate one if not set
  const superadminPassword =
    process.env.SUPERADMIN_PASSWORD || generateSecurePassword();
  const superadminUser = {
    email: 'superadmin@deusrex.com',
    name: 'System Super Administrator',
    password: superadminPassword,
    type: 'superadmin',
    isActive: true,
  };

  try {
    // Check if superadmin already exists
    const [existingSuperadmin] = await db
      .select()
      .from(users)
      .where(eq(users.email, superadminUser.email));

    if (existingSuperadmin) {
      console.log(`⚠️  Superadmin already exists: ${existingSuperadmin.email}`);
    } else {
      // Create user in Clerk
      const clerkUser = await clerk.users.createUser({
        emailAddress: [superadminUser.email],
        password: superadminUser.password,
        firstName: 'System',
        lastName: 'Super Administrator',
        publicMetadata: {
          type: superadminUser.type,
          isActive: superadminUser.isActive,
        },
      });

      // Create user in local database
      const [superadmin] = await db
        .insert(users)
        .values({
          clerkUserId: clerkUser.id,
          email: superadminUser.email,
          name: superadminUser.name,
          type: superadminUser.type as 'superadmin' | 'regular',
          isActive: superadminUser.isActive,
          imageUrl: generateAvatarUrl(),
        })
        .returning();

      console.log(`✅ Created superadmin: ${superadmin.email}`);
      console.log(`📧 Clerk User ID: ${clerkUser.id}`);
      console.log(`🔑 Password: ${superadminPassword}`);
      console.log(
        `📝 Password source: ${process.env.SUPERADMIN_PASSWORD ? 'Environment variable' : 'Generated'}`,
      );
    }
  } catch (error) {
    console.log(`⚠️  Superadmin might already exist:`, error.message);
  }

  // Create regular users for each organization with healthcare roles
  const regularUsers = [
    // Organization 1 - General Healthcare Center
    {
      email: 'admin@healthcare.com',
      name: 'Healthcare Admin',
      type: 'regular',
    },
    {
      email: 'dr.smith@healthcare.com',
      name: 'Dr. Sarah Smith',
      type: 'regular',
    },
    {
      email: 'reception@healthcare.com',
      name: 'Mary Johnson',
      type: 'regular',
    },
    {
      email: 'john.smith@patient.com',
      name: 'John Smith',
      type: 'regular',
    },

    // Organization 2 - Cardiology Center
    {
      email: 'admin@cardiology.com',
      name: 'Cardiology Admin',
      type: 'regular',
    },
    {
      email: 'dr.wilson@cardiology.com',
      name: 'Dr. Emily Wilson',
      type: 'regular',
    },
    {
      email: 'reception@cardiology.com',
      name: 'Lisa Brown',
      type: 'regular',
    },
    {
      email: 'emily.wilson@patient.com',
      name: 'Emily Wilson',
      type: 'regular',
    },

    // Organization 3 - Pediatric Center
    {
      email: 'admin@pediatric.com',
      name: 'Pediatric Admin',
      type: 'regular',
    },
    {
      email: 'dr.taylor@pediatric.com',
      name: 'Dr. James Taylor',
      type: 'regular',
    },
    {
      email: 'reception@pediatric.com',
      name: 'Jennifer Davis',
      type: 'regular',
    },
    {
      email: 'emma.taylor@patient.com',
      name: 'Emma Taylor',
      type: 'regular',
    },

    // Organization 4 - Mental Health Center
    {
      email: 'admin@mentalhealth.com',
      name: 'Mental Health Admin',
      type: 'regular',
    },
    {
      email: 'dr.martinez@mentalhealth.com',
      name: 'Dr. Jessica Martinez',
      type: 'regular',
    },
    {
      email: 'reception@mentalhealth.com',
      name: 'Carlos Rodriguez',
      type: 'regular',
    },
    {
      email: 'jessica.martinez@patient.com',
      name: 'Jessica Martinez',
      type: 'regular',
    },

    // Organization 5 - Orthopedic Center
    {
      email: 'admin@orthopedic.com',
      name: 'Orthopedic Admin',
      type: 'regular',
    },
    {
      email: 'dr.rodriguez@orthopedic.com',
      name: 'Dr. Amanda Rodriguez',
      type: 'regular',
    },
    {
      email: 'reception@orthopedic.com',
      name: 'Miguel Garcia',
      type: 'regular',
    },
    {
      email: 'amanda.rodriguez@patient.com',
      name: 'Amanda Rodriguez',
      type: 'regular',
    },

    // Additional Patient Users (from patients seed)
    {
      email: 'john.smith@email.com',
      name: 'John Smith',
      type: 'regular',
    },
    {
      email: 'sarah.johnson@email.com',
      name: 'Sarah Johnson',
      type: 'regular',
    },
    {
      email: 'michael.davis@email.com',
      name: 'Michael Davis',
      type: 'regular',
    },
    {
      email: 'emily.wilson@email.com',
      name: 'Emily Wilson',
      type: 'regular',
    },
    {
      email: 'robert.brown@email.com',
      name: 'Robert Brown',
      type: 'regular',
    },
    {
      email: 'emma.taylor@parent.com',
      name: 'Emma Taylor',
      type: 'regular',
    },
    {
      email: 'lucas.anderson@parent.com',
      name: 'Lucas Anderson',
      type: 'regular',
    },
    {
      email: 'jessica.martinez@email.com',
      name: 'Jessica Martinez',
      type: 'regular',
    },
    {
      email: 'thomas.garcia@email.com',
      name: 'Thomas Garcia',
      type: 'regular',
    },
    {
      email: 'amanda.rodriguez@email.com',
      name: 'Amanda Rodriguez',
      type: 'regular',
    },
    {
      email: 'william.lee@email.com',
      name: 'William Lee',
      type: 'regular',
    },

    // Additional Health Professional Users (from health-professionals seed) - Using organization-specific emails
    {
      email: 'sarah.johnson@healthcare.com',
      name: 'Dr. Sarah Johnson',
      type: 'regular',
    },
    {
      email: 'michael.chen@cardiology.com',
      name: 'Dr. Michael Chen',
      type: 'regular',
    },
    {
      email: 'emily.rodriguez@pediatric.com',
      name: 'Dr. Emily Rodriguez',
      type: 'regular',
    },
    {
      email: 'david.kim@orthopedic.com',
      name: 'Dr. David Kim',
      type: 'regular',
    },
    {
      email: 'lisa.thompson@healthcare.com',
      name: 'Dr. Lisa Thompson',
      type: 'regular',
    },
    {
      email: 'jennifer.williams@healthcare.com',
      name: 'Jennifer Williams',
      type: 'regular',
    },
    {
      email: 'robert.garcia@cardiology.com',
      name: 'Robert Garcia',
      type: 'regular',
    },
    {
      email: 'amanda.davis@pediatric.com',
      name: 'Amanda Davis',
      type: 'regular',
    },
    {
      email: 'james.wilson@mentalhealth.com',
      name: 'Dr. James Wilson',
      type: 'regular',
    },
    {
      email: 'maria.lopez@orthopedic.com',
      name: 'Dr. Maria Lopez',
      type: 'regular',
    },
    {
      email: 'sarah.brown@healthcare.com',
      name: 'Sarah Brown',
      type: 'regular',
    },
    {
      email: 'mark.taylor@cardiology.com',
      name: 'Mark Taylor',
      type: 'regular',
    },
    {
      email: 'kevin.anderson@pediatric.com',
      name: 'Kevin Anderson',
      type: 'regular',
    },
    {
      email: 'rachel.martinez@mentalhealth.com',
      name: 'Rachel Martinez',
      type: 'regular',
    },
    {
      email: 'patricia.white@orthopedic.com',
      name: 'Patricia White',
      type: 'regular',
    },
  ];

  // Get all organizations to assign users to
  const allOrganizations = await db.select().from(organizations);

  for (const userData of regularUsers) {
    try {
      const password = generateSecurePassword();

      // Check if user already exists in local database
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));

      if (existingUser) {
        console.log(`⚠️  User already exists: ${existingUser.email}`);
      } else {
        // Determine organization and role based on email domain or name
        let organizationId = allOrganizations[0]?.id; // Default to first organization
        let role:
          | 'admin'
          | 'member'
          | 'health_professional'
          | 'receptionist'
          | 'patient' = 'admin'; // Default role

        // Assign organization and role based on email patterns
        if (
          userData.email.includes('@clinic.com') ||
          userData.email.includes('@healthcare.com') ||
          userData.email.includes('@orthopedic.com') ||
          userData.email.includes('@cardiology.com') ||
          userData.email.includes('@pediatric.com') ||
          userData.email.includes('@mentalhealth.com')
        ) {
          // Health professionals
          role = 'health_professional';
          const orgIndex = Math.floor(Math.random() * allOrganizations.length);
          organizationId = allOrganizations[orgIndex]?.id;
        } else if (
          userData.email.includes('@patient.com') ||
          userData.email.includes('@email.com') ||
          userData.email.includes('@parent.com')
        ) {
          // Patients
          role = 'patient';
          const orgIndex = Math.floor(Math.random() * allOrganizations.length);
          organizationId = allOrganizations[orgIndex]?.id;
        } else if (userData.name.toLowerCase().includes('admin')) {
          // Admins
          role = 'admin';
          const orgIndex = Math.floor(Math.random() * allOrganizations.length);
          organizationId = allOrganizations[orgIndex]?.id;
        } else if (userData.email.includes('reception@')) {
          // Receptionists
          role = 'receptionist';
          const orgIndex = Math.floor(Math.random() * allOrganizations.length);
          organizationId = allOrganizations[orgIndex]?.id;
        } else if (userData.email.includes('dr.')) {
          // Doctors
          role = 'health_professional';
          const orgIndex = Math.floor(Math.random() * allOrganizations.length);
          organizationId = allOrganizations[orgIndex]?.id;
        }

        // Create new user in Clerk
        const clerkUser = await clerk.users.createUser({
          emailAddress: [userData.email],
          password: password,
          firstName: userData.name.split(' ')[0],
          lastName: userData.name.split(' ').slice(1).join(' '),
          publicMetadata: {
            type: userData.type,
            role: role,
            organizationId: organizationId,
            isActive: true,
          },
        });

        // Create the user in local database
        const [user] = await db
          .insert(users)
          .values({
            clerkUserId: clerkUser.id,
            email: userData.email,
            name: userData.name,
            type: userData.type as 'superadmin' | 'regular',
            isActive: true,
            imageUrl: generateAvatarUrl(),
          })
          .returning();

        // Create user-organization relationship
        if (organizationId) {
          await db.insert(userOrganizations).values({
            userId: user.id,
            organizationId: organizationId,
            role: role,
            isActive: true,
            createdBy: user.id, // Self-created
            updatedBy: user.id,
          });
        }

        console.log(`✅ Created user: ${user.email} with role: ${role}`);
        console.log(`📧 Clerk User ID: ${clerkUser.id}`);
        console.log(`🔑 Password: ${password}`);
      }
    } catch (error) {
      console.log(
        `⚠️  User ${userData.email} might already exist:`,
        error.message,
      );
    }
  }

  console.log('✅ Users seeding completed!');
  console.log(
    '📝 Note: All passwords are generated securely and meet Clerk requirements.',
  );
  console.log(
    "🔐 Users can reset their passwords through Clerk's password reset functionality.",
  );
  console.log(
    '🏢 Organization memberships should be created using the create-user-orgs script.',
  );
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedUsers().finally(() => client.end());
}
