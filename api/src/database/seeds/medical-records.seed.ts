import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { medicalRecords } from '@database/schemas/medical-records.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { users } from '@database/schemas/users.schema';
import { patients } from '@database/schemas/patients.schema';
import { appointments } from '@database/schemas/appointments.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function seedMedicalRecords() {
  console.log('🌱 Seeding medical records...');

  // Get all organizations
  const allOrganizations = await db.select().from(organizations);
  if (allOrganizations.length === 0) {
    console.log('⚠️  No organizations found. Please seed organizations first.');
    return;
  }

  // Get health professionals and admin users for each organization
  const healthProfessionals = await db
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
        eq(userOrganizations.role, 'health_professional'),
        eq(userOrganizations.isActive, true),
      ),
    );

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

  // Get all patients and appointments
  const allPatients = await db.select().from(patients);
  const allAppointments = await db.select().from(appointments);

  // Create a simple medical record for each organization
  for (const org of allOrganizations) {
    try {
      const patient = allPatients.find((p) => p.organizationId === org.id);
      const appointment = allAppointments.find(
        (a) => a.organizationId === org.id,
      );
      const adminUser =
        adminUsers.find((u) => u.organizationId === org.id) || adminUsers[0];

      if (!patient) {
        console.log(`⚠️  No patient found for organization ${org.id}`);
        continue;
      }

      const medicalRecordData = {
        organizationId: org.id,
        patientId: patient.id,
        appointmentId: appointment?.id || null,
        recordType: 'consultation' as
          | 'consultation'
          | 'examination'
          | 'lab_result'
          | 'imaging'
          | 'prescription'
          | 'procedure'
          | 'vaccination',
        title: `Initial Consultation - ${org.name}`,
        description: 'Initial patient consultation and assessment',
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: '36.8',
        weight: '70.00',
        height: '170.00',
        oxygenSaturation: 98,
        symptoms: 'None reported',
        diagnosis: 'Healthy individual',
        treatment: 'Continue healthy lifestyle',
        medications: 'None',
        dosage: 'N/A',
        instructions: 'Maintain regular exercise and balanced diet',
        labResults: 'All blood work within normal ranges',
        imagingResults: 'None required',
        followUpRequired: false,
        followUpDate: null,
        followUpNotes: 'Schedule next checkup in 6 months',
        isActive: true,
        createdBy: adminUser?.id,
        updatedBy: adminUser?.id,
      };

      await db.insert(medicalRecords).values(medicalRecordData);

      console.log(`✅ Created medical record for organization: ${org.name}`);
    } catch (error) {
      console.log(
        `⚠️  Medical record might already exist for organization ${org.id}:`,
        error.message,
      );
    }
  }

  console.log('✅ Medical records seeding completed!');
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedMedicalRecords().finally(() => client.end());
}
