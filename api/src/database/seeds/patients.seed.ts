import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { patients } from '@database/schemas/patients.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';
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

export async function seedPatients() {
  console.log('🌱 Seeding patients...');

  let successCount = 0;
  let skippedCount = 0;

  // Get all organizations
  const allOrganizations = await db.select().from(organizations);
  if (allOrganizations.length === 0) {
    console.log('⚠️  No organizations found. Please seed organizations first.');
    return;
  }

  // Get admin users for each organization to use as createdBy
  const adminUsers = await db
    .select({
      id: users.id,
      email: users.email,
      organizationId: userOrganizations.organizationId,
    })
    .from(users)
    .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
    .where(
      and(
        eq(users.type, 'regular'),
        eq(userOrganizations.role, 'admin'),
        eq(userOrganizations.isActive, true),
      ),
    );

  const patientsData = [
    // Organization 1 - General Healthcare Center
    {
      firstName: 'John',
      lastName: 'Smith',
      dateOfBirth: '1985-03-15',
      sex: 'male' as const,
      email: 'john.smith@email.com',
      phone: '+1-555-0101',
      address: '123 Oak Street',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62701',
      country: 'USA',
      emergencyContactName: 'Mary Smith',
      emergencyContactPhone: '+1-555-0102',
      emergencyContactRelationship: 'Spouse',
      bloodType: 'A+',
      allergies: 'Penicillin, Peanuts',
      currentMedications: 'Lisinopril 10mg daily',
      medicalHistory: 'Hypertension, Type 2 Diabetes',
      insuranceProvider: 'Blue Cross Blue Shield',
      insuranceNumber: 'BCBS123456789',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      firstName: 'Sarah',
      lastName: 'Johnson',
      dateOfBirth: '1992-07-22',
      sex: 'female' as const,
      email: 'sarah.johnson@email.com',
      phone: '+1-555-0103',
      address: '456 Maple Avenue',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62702',
      country: 'USA',
      emergencyContactName: 'Robert Johnson',
      emergencyContactPhone: '+1-555-0104',
      emergencyContactRelationship: 'Father',
      bloodType: 'O-',
      allergies: 'None',
      currentMedications: 'None',
      medicalHistory: 'None',
      insuranceProvider: 'Aetna',
      insuranceNumber: 'AETNA987654321',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      firstName: 'Michael',
      lastName: 'Davis',
      dateOfBirth: '1978-11-08',
      sex: 'male' as const,
      email: 'michael.davis@email.com',
      phone: '+1-555-0105',
      address: '789 Pine Road',
      city: 'Springfield',
      state: 'IL',
      zipCode: '62703',
      country: 'USA',
      emergencyContactName: 'Jennifer Davis',
      emergencyContactPhone: '+1-555-0106',
      emergencyContactRelationship: 'Wife',
      bloodType: 'B+',
      allergies: 'Sulfa drugs',
      currentMedications: 'Metformin 500mg twice daily',
      medicalHistory: 'Type 2 Diabetes, High Cholesterol',
      insuranceProvider: 'UnitedHealth',
      insuranceNumber: 'UHC456789123',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },

    // Organization 2 - Cardiology Center
    {
      firstName: 'Emily',
      lastName: 'Wilson',
      dateOfBirth: '1965-04-12',
      sex: 'female' as const,
      email: 'emily.wilson@email.com',
      phone: '+1-555-0201',
      address: '321 Heart Street',
      city: 'Cardioville',
      state: 'CA',
      zipCode: '90210',
      country: 'USA',
      emergencyContactName: 'David Wilson',
      emergencyContactPhone: '+1-555-0202',
      emergencyContactRelationship: 'Husband',
      bloodType: 'AB+',
      allergies: 'Aspirin',
      currentMedications: 'Amlodipine 5mg daily, Atorvastatin 20mg daily',
      medicalHistory: 'Hypertension, Coronary Artery Disease',
      insuranceProvider: 'Kaiser Permanente',
      insuranceNumber: 'KP789123456',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },
    {
      firstName: 'Robert',
      lastName: 'Brown',
      dateOfBirth: '1958-09-30',
      sex: 'male' as const,
      email: 'robert.brown@email.com',
      phone: '+1-555-0203',
      address: '654 Cardiac Lane',
      city: 'Cardioville',
      state: 'CA',
      zipCode: '90211',
      country: 'USA',
      emergencyContactName: 'Lisa Brown',
      emergencyContactPhone: '+1-555-0204',
      emergencyContactRelationship: 'Daughter',
      bloodType: 'O+',
      allergies: 'None',
      currentMedications: 'Metoprolol 50mg twice daily',
      medicalHistory: 'Heart Attack (2020), Hypertension',
      insuranceProvider: 'Cigna',
      insuranceNumber: 'CIGNA321654987',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },

    // Organization 3 - Pediatric Center
    {
      firstName: 'Emma',
      lastName: 'Taylor',
      dateOfBirth: '2018-12-03',
      sex: 'female' as const,
      email: 'emma.taylor@parent.com',
      phone: '+1-555-0301',
      address: '987 Child Avenue',
      city: 'Kidstown',
      state: 'TX',
      zipCode: '75001',
      country: 'USA',
      emergencyContactName: 'James Taylor',
      emergencyContactPhone: '+1-555-0302',
      emergencyContactRelationship: 'Father',
      bloodType: 'A-',
      allergies: 'Milk, Eggs',
      currentMedications: 'None',
      medicalHistory: 'Asthma',
      insuranceProvider: 'Humana',
      insuranceNumber: 'HUMANA147258369',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },
    {
      firstName: 'Lucas',
      lastName: 'Anderson',
      dateOfBirth: '2020-06-18',
      sex: 'male' as const,
      email: 'lucas.anderson@parent.com',
      phone: '+1-555-0303',
      address: '456 Youth Street',
      city: 'Kidstown',
      state: 'TX',
      zipCode: '75002',
      country: 'USA',
      emergencyContactName: 'Maria Anderson',
      emergencyContactPhone: '+1-555-0304',
      emergencyContactRelationship: 'Mother',
      bloodType: 'B-',
      allergies: 'None',
      currentMedications: 'None',
      medicalHistory: 'None',
      insuranceProvider: 'Anthem',
      insuranceNumber: 'ANTHEM963852741',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },

    // Organization 4 - Mental Health Center
    {
      firstName: 'Jessica',
      lastName: 'Martinez',
      dateOfBirth: '1990-02-14',
      sex: 'female' as const,
      email: 'jessica.martinez@email.com',
      phone: '+1-555-0401',
      address: '753 Mind Street',
      city: 'Wellness City',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      emergencyContactName: 'Carlos Martinez',
      emergencyContactPhone: '+1-555-0402',
      emergencyContactRelationship: 'Brother',
      bloodType: 'O+',
      allergies: 'None',
      currentMedications: 'Sertraline 50mg daily',
      medicalHistory: 'Depression, Anxiety',
      insuranceProvider: 'Empire Blue Cross',
      insuranceNumber: 'EMPIRE852963741',
      organizationId: allOrganizations[3].id,
      isActive: true,
    },
    {
      firstName: 'Thomas',
      lastName: 'Garcia',
      dateOfBirth: '1983-08-25',
      sex: 'male',
      email: 'thomas.garcia@email.com',
      phone: '+1-555-0403',
      address: '159 Peace Avenue',
      city: 'Wellness City',
      state: 'NY',
      zipCode: '10002',
      country: 'USA',
      emergencyContactName: 'Ana Garcia',
      emergencyContactPhone: '+1-555-0404',
      emergencyContactRelationship: 'Sister',
      bloodType: 'A+',
      allergies: 'None',
      currentMedications: 'Bupropion 150mg twice daily',
      medicalHistory: 'Depression, ADHD',
      insuranceProvider: 'Oxford Health',
      insuranceNumber: 'OXFORD741852963',
      organizationId: allOrganizations[3].id,
      isActive: true,
    },

    // Organization 5 - Orthopedic Center
    {
      firstName: 'Amanda',
      lastName: 'Rodriguez',
      dateOfBirth: '1975-05-10',
      sex: 'female' as const,
      email: 'amanda.rodriguez@email.com',
      phone: '+1-555-0501',
      address: '357 Bone Street',
      city: 'Jointville',
      state: 'FL',
      zipCode: '33101',
      country: 'USA',
      emergencyContactName: 'Miguel Rodriguez',
      emergencyContactPhone: '+1-555-0502',
      emergencyContactRelationship: 'Husband',
      bloodType: 'B+',
      allergies: 'Latex',
      currentMedications: 'Ibuprofen 400mg as needed',
      medicalHistory: 'Knee replacement (2021), Arthritis',
      insuranceProvider: 'Florida Blue',
      insuranceNumber: 'FLBLUE369258147',
      organizationId: allOrganizations[4].id,
      isActive: true,
    },
    {
      firstName: 'William',
      lastName: 'Lee',
      dateOfBirth: '1968-12-20',
      sex: 'male' as const,
      email: 'william.lee@email.com',
      phone: '+1-555-0503',
      address: '951 Muscle Lane',
      city: 'Jointville',
      state: 'FL',
      zipCode: '33102',
      country: 'USA',
      emergencyContactName: 'Grace Lee',
      emergencyContactPhone: '+1-555-0504',
      emergencyContactRelationship: 'Wife',
      bloodType: 'AB-',
      allergies: 'None',
      currentMedications: 'Acetaminophen 500mg as needed',
      medicalHistory: 'Hip replacement (2022), Osteoporosis',
      insuranceProvider: 'AvMed',
      insuranceNumber: 'AVMED147369258',
      organizationId: allOrganizations[4].id,
      isActive: true,
    },
  ];

  for (const patientData of patientsData) {
    try {
      // Find an admin user from the same organization to use as createdBy
      const adminUser =
        adminUsers.find(
          (user) => user.organizationId === patientData.organizationId,
        ) || adminUsers[0]; // Fallback to first admin if not found

      let createdUserId: string | null = null;

      // Find existing user if patient has an email
      if (patientData.email) {
        try {
          // Find user in Clerk
          const clerkUser = await findUserByEmail(patientData.email);

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
                .where(eq(users.email, patientData.email));
            }

            if (user) {
              createdUserId = user.id;
              console.log(
                `✅ Found existing user for patient: ${patientData.email} (ID: ${user.id})`,
              );
            } else {
              console.log(
                `⚠️  User found in Clerk but not in local database: ${patientData.email}`,
              );
            }
          } else {
            // Try to find user directly in local database by email
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.email, patientData.email));

            if (user) {
              createdUserId = user.id;
              console.log(
                `✅ Found user in local database for patient: ${patientData.email} (ID: ${user.id})`,
              );
            } else {
              console.log(
                `⚠️  User not found in Clerk or local database: ${patientData.email}. Please run users seed first.`,
              );
            }
          }
        } catch (userError) {
          console.log(
            `⚠️  Error finding user ${patientData.email}:`,
            userError.message,
          );
        }
      }

      // Create the patient only if we have a valid user ID
      if (!createdUserId) {
        console.log(
          `⚠️  Skipping patient creation for ${patientData.firstName} ${patientData.lastName} - no valid user found`,
        );
        skippedCount++;
        continue;
      }

      const [patient] = await db
        .insert(patients)
        .values({
          ...patientData,
          userId: createdUserId,
          sex: patientData.sex as 'male' | 'female',
          bloodType: patientData.bloodType as
            | 'A+'
            | 'A-'
            | 'B+'
            | 'B-'
            | 'AB+'
            | 'AB-'
            | 'O+'
            | 'O-'
            | null,
          createdBy: adminUser?.id,
          updatedBy: adminUser?.id,
        })
        .returning();

      // Update the user's metadata with the patient ID if user was created
      if (createdUserId && patient) {
        try {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, createdUserId));

          if (user) {
            await clerk.users.updateUser(user.clerkUserId, {
              publicMetadata: {
                type: 'regular',
                role: 'patient',
                organizationId: patientData.organizationId,
                patientId: patient.id,
                bloodType: patientData.bloodType,
                dateOfBirth: patientData.dateOfBirth,
                sex: patientData.sex,
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
        `✅ Created patient: ${patientData.firstName} ${patientData.lastName} for organization ${patientData.organizationId}`,
      );
    } catch (error) {
      console.log(
        `⚠️  Patient ${patientData.firstName} ${patientData.lastName} might already exist:`,
        error.message,
      );
    }
  }

  console.log('✅ Patients seeding completed!');
  console.log(
    `📊 Summary: ${successCount} patients created, ${skippedCount} skipped (no user found)`,
  );
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedPatients().finally(() => client.end());
}
