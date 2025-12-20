import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { healthProfessionals } from '@database/schemas/health-professionals.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq } from 'drizzle-orm';
import { createClerkClient } from '@clerk/backend';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Helper function to find user by email in Clerk
async function findUserByEmail(email: string) {
  try {
    const users = await clerk.users.getUserList({
      emailAddress: [email],
    });
    return users.data.length > 0 ? users.data[0] : null;
  } catch (error) {
    console.log(`⚠️  Error finding user ${email} in Clerk:`, error.message);
    return null;
  }
}

export async function seedHealthProfessionals() {
  console.log('🌱 Seeding health professionals...');

  let successCount = 0;
  let skippedCount = 0;

  // Get all organizations
  const allOrganizations = await db.select().from(organizations);
  if (allOrganizations.length === 0) {
    console.log('❌ No organizations found. Please seed organizations first.');
    return;
  }

  // Get admin users for each organization to use as createdBy
  const adminUsers = await db
    .select({
      id: users.id,
      organizationId: userOrganizations.organizationId,
    })
    .from(users)
    .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
    .where(eq(userOrganizations.role, 'admin'));

  const healthProfessionalsData = [
    // Doctors - Using existing emails from users seed
    {
      firstName: 'Dr. Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@healthcare.com',
      phone: '+1-555-0101',
      type: 'doctor' as const,
      specialty: 'general_practice' as const,
      licenseNumber: 'MD123456',
      npi: '1234567890',
      bio: 'Dr. Sarah Johnson is a board-certified family medicine physician with over 10 years of experience.',
      education:
        'MD from Harvard Medical School, Residency at Massachusetts General Hospital',
      certifications: 'Board Certified in Family Medicine, ACLS, BLS',
      languages: '["English", "Spanish"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Dr. Michael',
      lastName: 'Chen',
      email: 'michael.chen@cardiology.com',
      phone: '+1-555-0102',
      type: 'doctor' as const,
      specialty: 'cardiology' as const,
      licenseNumber: 'MD123457',
      npi: '1234567891',
      bio: 'Dr. Michael Chen specializes in interventional cardiology and has performed over 1000 procedures.',
      education:
        'MD from Stanford Medical School, Fellowship in Interventional Cardiology',
      certifications:
        'Board Certified in Cardiology, Interventional Cardiology Fellowship',
      languages: '["English", "Mandarin"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Dr. Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@pediatric.com',
      phone: '+1-555-0103',
      type: 'doctor' as const,
      specialty: 'pediatrics' as const,
      licenseNumber: 'MD123458',
      npi: '1234567892',
      bio: 'Dr. Emily Rodriguez is a pediatrician with a special interest in adolescent medicine.',
      education:
        "MD from Johns Hopkins Medical School, Pediatric Residency at Children's Hospital",
      certifications:
        'Board Certified in Pediatrics, Adolescent Medicine Fellowship',
      languages: '["English", "Spanish", "French"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Dr. David',
      lastName: 'Kim',
      email: 'david.kim@orthopedic.com',
      phone: '+1-555-0104',
      type: 'doctor' as const,
      specialty: 'orthopedics' as const,
      licenseNumber: 'MD123459',
      npi: '1234567893',
      bio: 'Dr. David Kim is an orthopedic surgeon specializing in sports medicine and joint replacement.',
      education:
        'MD from UCLA Medical School, Orthopedic Surgery Residency, Sports Medicine Fellowship',
      certifications:
        'Board Certified in Orthopedic Surgery, Sports Medicine Fellowship',
      languages: '["English", "Korean"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Dr. Lisa',
      lastName: 'Thompson',
      email: 'lisa.thompson@healthcare.com',
      phone: '+1-555-0105',
      type: 'doctor' as const,
      specialty: 'dermatology' as const,
      licenseNumber: 'MD123460',
      npi: '1234567894',
      bio: 'Dr. Lisa Thompson is a dermatologist with expertise in cosmetic and medical dermatology.',
      education: 'MD from Northwestern Medical School, Dermatology Residency',
      certifications:
        'Board Certified in Dermatology, Cosmetic Dermatology Fellowship',
      languages: '["English"]',
      isActive: true,
      isAvailable: true,
    },

    // Nurses
    {
      firstName: 'Jennifer',
      lastName: 'Williams',
      email: 'jennifer.williams@healthcare.com',
      phone: '+1-555-0201',
      type: 'nurse' as const,
      specialty: 'general_practice' as const,
      licenseNumber: 'RN123456',
      npi: '2234567890',
      bio: 'Jennifer Williams is a registered nurse with 8 years of experience in primary care.',
      education: 'BSN from University of California, San Francisco',
      certifications: 'RN License, BLS, ACLS',
      languages: '["English", "Spanish"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Robert',
      lastName: 'Garcia',
      email: 'robert.garcia@cardiology.com',
      phone: '+1-555-0202',
      type: 'nurse' as const,
      specialty: 'emergency_medicine' as const,
      licenseNumber: 'RN123457',
      npi: '2234567891',
      bio: 'Robert Garcia is an emergency room nurse with extensive trauma experience.',
      education: 'BSN from University of Texas, Austin',
      certifications: 'RN License, BLS, ACLS, PALS, TNCC',
      languages: '["English", "Spanish"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Amanda',
      lastName: 'Davis',
      email: 'amanda.davis@pediatric.com',
      phone: '+1-555-0203',
      type: 'nurse' as const,
      specialty: 'pediatrics' as const,
      licenseNumber: 'RN123458',
      npi: '2234567892',
      bio: 'Amanda Davis is a pediatric nurse with a passion for child health and development.',
      education: 'BSN from University of Washington, Seattle',
      certifications: 'RN License, BLS, PALS, Pediatric Advanced Life Support',
      languages: '["English", "French"]',
      isActive: true,
      isAvailable: true,
    },

    // Specialists
    {
      firstName: 'Dr. James',
      lastName: 'Wilson',
      email: 'james.wilson@mentalhealth.com',
      phone: '+1-555-0301',
      type: 'specialist' as const,
      specialty: 'psychiatry' as const,
      licenseNumber: 'MD123461',
      npi: '3234567890',
      bio: 'Dr. James Wilson is a psychiatrist specializing in mood disorders and anxiety.',
      education:
        'MD from Columbia Medical School, Psychiatry Residency, Fellowship in Mood Disorders',
      certifications:
        'Board Certified in Psychiatry, Subspecialty in Mood Disorders',
      languages: '["English", "German"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Dr. Maria',
      lastName: 'Lopez',
      email: 'maria.lopez@orthopedic.com',
      phone: '+1-555-0302',
      type: 'specialist' as const,
      specialty: 'radiology' as const,
      licenseNumber: 'MD123462',
      npi: '3234567891',
      bio: 'Dr. Maria Lopez is a radiologist with expertise in MRI and CT imaging.',
      education:
        'MD from University of Miami Medical School, Radiology Residency',
      certifications:
        'Board Certified in Radiology, Subspecialty in Neuroradiology',
      languages: '["English", "Spanish", "Portuguese"]',
      isActive: true,
      isAvailable: true,
    },

    // Therapists
    {
      firstName: 'Sarah',
      lastName: 'Brown',
      email: 'sarah.brown@healthcare.com',
      phone: '+1-555-0401',
      type: 'therapist' as const,
      specialty: 'general_practice' as const,
      licenseNumber: 'LCSW123456',
      npi: '4234567890',
      bio: 'Sarah Brown is a licensed clinical social worker specializing in cognitive behavioral therapy.',
      education: 'MSW from University of Chicago, LCSW License',
      certifications: 'LCSW License, CBT Certification, Trauma-Informed Care',
      languages: '["English", "Spanish"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Mark',
      lastName: 'Taylor',
      email: 'mark.taylor@cardiology.com',
      phone: '+1-555-0402',
      type: 'therapist' as const,
      specialty: 'general_practice' as const,
      licenseNumber: 'PT123456',
      npi: '4234567891',
      bio: 'Mark Taylor is a physical therapist specializing in sports rehabilitation and orthopedic conditions.',
      education: 'DPT from University of Southern California',
      certifications:
        'DPT License, Certified Sports Physical Therapist, Manual Therapy Certification',
      languages: '["English"]',
      isActive: true,
      isAvailable: true,
    },

    // Technicians
    {
      firstName: 'Kevin',
      lastName: 'Anderson',
      email: 'kevin.anderson@pediatric.com',
      phone: '+1-555-0501',
      type: 'technician' as const,
      specialty: 'radiology' as const,
      licenseNumber: 'RT123456',
      npi: '5234567890',
      bio: 'Kevin Anderson is a radiology technician with expertise in X-ray and CT imaging.',
      education: 'Associate Degree in Radiologic Technology',
      certifications: 'RT License, CT Certification, MRI Certification',
      languages: '["English"]',
      isActive: true,
      isAvailable: true,
    },
    {
      firstName: 'Rachel',
      lastName: 'Martinez',
      email: 'rachel.martinez@mentalhealth.com',
      phone: '+1-555-0502',
      type: 'technician' as const,
      specialty: 'general_practice' as const,
      licenseNumber: 'MLT123456',
      npi: '5234567891',
      bio: 'Rachel Martinez is a medical laboratory technician with expertise in clinical chemistry and hematology.',
      education: 'Associate Degree in Medical Laboratory Technology',
      certifications: 'MLT License, ASCP Certification',
      languages: '["English", "Spanish"]',
      isActive: true,
      isAvailable: true,
    },

    // Administrators
    {
      firstName: 'Patricia',
      lastName: 'White',
      email: 'patricia.white@orthopedic.com',
      phone: '+1-555-0601',
      type: 'administrator' as const,
      specialty: 'general_practice' as const,
      licenseNumber: 'ADM123456',
      npi: '6234567890',
      bio: 'Patricia White is the clinic administrator with over 15 years of healthcare management experience.',
      education:
        'MBA in Healthcare Administration from University of Pennsylvania',
      certifications:
        'Certified Healthcare Administrator, Lean Six Sigma Green Belt',
      languages: '["English", "French"]',
      isActive: true,
      isAvailable: true,
    },
  ];

  try {
    // Create health professionals for each organization
    for (const organization of allOrganizations) {
      for (const healthProfessionalData of healthProfessionalsData) {
        try {
          // Find an admin user from the same organization to use as createdBy
          const adminUser =
            adminUsers.find(
              (user) => user.organizationId === organization.id,
            ) || adminUsers[0]; // Fallback to first admin if not found

          let createdUserId: string | null = null;

          // Find existing user if health professional has an email
          if (healthProfessionalData.email) {
            try {
              // Find user in Clerk
              const clerkUser = await findUserByEmail(
                healthProfessionalData.email,
              );

              if (clerkUser) {
                // Find user in local database by clerkUserId first, then by email as fallback
                let [user] = await db
                  .select()
                  .from(users)
                  .where(eq(users.clerkUserId, clerkUser.id));

                // Fallback: if not found by clerkUserId, try by email
                if (!user) {
                  [user] = await db
                    .select()
                    .from(users)
                    .where(eq(users.email, healthProfessionalData.email));
                }

                if (user) {
                  createdUserId = user.id;
                  console.log(
                    `✅ Found existing user for health professional: ${healthProfessionalData.email} (ID: ${user.id})`,
                  );
                } else {
                  console.log(
                    `⚠️  User found in Clerk but not in local database: ${healthProfessionalData.email}`,
                  );
                }
              } else {
                // Try to find user directly in local database by email
                const [user] = await db
                  .select()
                  .from(users)
                  .where(eq(users.email, healthProfessionalData.email));

                if (user) {
                  createdUserId = user.id;
                  console.log(
                    `✅ Found user in local database for health professional: ${healthProfessionalData.email} (ID: ${user.id})`,
                  );
                } else {
                  console.log(
                    `⚠️  User not found in Clerk or local database: ${healthProfessionalData.email}. Please run users seed first.`,
                  );
                }
              }
            } catch (userError) {
              console.log(
                `⚠️  Error finding user ${healthProfessionalData.email}:`,
                userError.message,
              );
            }
          }

          // Create the health professional only if we have a valid user ID
          if (!createdUserId) {
            console.log(
              `⚠️  Skipping health professional creation for ${healthProfessionalData.firstName} ${healthProfessionalData.lastName} - no valid user found`,
            );
            skippedCount++;
            continue;
          }

          const [healthProfessional] = await db
            .insert(healthProfessionals)
            .values({
              ...healthProfessionalData,
              userId: createdUserId,
              organizationId: organization.id,
              createdBy: adminUser?.id,
              updatedBy: adminUser?.id,
            })
            .returning();

          // Update the user's metadata with the health professional ID if user was created
          if (createdUserId && healthProfessional) {
            try {
              const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, createdUserId));

              if (user) {
                await clerk.users.updateUser(user.clerkUserId, {
                  publicMetadata: {
                    type: 'regular',
                    role: 'health_professional',
                    organizationId: organization.id,
                    healthProfessionalId: healthProfessional.id,
                    professionalType: healthProfessionalData.type,
                    specialty: healthProfessionalData.specialty,
                    licenseNumber: healthProfessionalData.licenseNumber,
                    isAvailable: healthProfessionalData.isAvailable,
                  },
                });
              }
            } catch (updateError) {
              console.log(
                `⚠️  Failed to update user metadata:`,
                updateError.message,
              );
            }
          }

          successCount++;
          console.log(
            `✅ Created health professional: ${healthProfessionalData.firstName} ${healthProfessionalData.lastName} for organization ${organization.id}`,
          );
        } catch (error) {
          console.log(
            `⚠️  Health professional ${healthProfessionalData.firstName} ${healthProfessionalData.lastName} might already exist:`,
            error.message,
          );
        }
      }
    }
    console.log(
      `✅ Seeded ${healthProfessionalsData.length * allOrganizations.length} health professionals`,
    );
    console.log(
      `📊 Summary: ${successCount} health professionals created, ${skippedCount} skipped (no user found)`,
    );
  } catch (error) {
    console.error('❌ Error seeding health professionals:', error);
    throw error;
  }
}
