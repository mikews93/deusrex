import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { appointments } from '@database/schemas/appointments.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { users } from '@database/schemas/users.schema';
import { patients } from '@database/schemas/patients.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function seedAppointments() {
  console.log('🌱 Seeding appointments...');

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

  // Get all patients
  const allPatients = await db.select().from(patients);

  const appointmentsData = [
    // Organization 1 - General Healthcare Center
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[0].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[0].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[0].id)
          ?.id,
      appointmentDate: new Date('2024-02-15 09:00:00'),
      duration: 30,
      startTime: new Date('2024-02-15 09:00:00'),
      endTime: new Date('2024-02-15 09:30:00'),
      appointmentType: 'consultation',
      status: 'scheduled',
      priority: 'normal',
      description: 'Annual checkup',
      notes: 'Patient reports feeling well',
      symptoms: 'None',
      roomNumber: '101',
      location: 'Main Building - Floor 1',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[0].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[0].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[0].id)
          ?.id,
      appointmentDate: new Date('2024-02-15 14:00:00'),
      duration: 45,
      startTime: new Date('2024-02-15 14:00:00'),
      endTime: new Date('2024-02-15 14:45:00'),
      appointmentType: 'follow_up',
      status: 'confirmed',
      priority: 'high',
      description: 'Diabetes management follow-up',
      notes: 'Check blood sugar levels and medication effectiveness',
      symptoms: 'Increased thirst, frequent urination',
      roomNumber: '102',
      location: 'Main Building - Floor 1',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },

    // Organization 2 - Cardiology Center
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[1].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[1].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[1].id)
          ?.id,
      appointmentDate: new Date('2024-02-16 10:00:00'),
      duration: 60,
      startTime: new Date('2024-02-16 10:00:00'),
      endTime: new Date('2024-02-16 11:00:00'),
      appointmentType: 'specialist_visit',
      status: 'scheduled',
      priority: 'high',
      description: 'Cardiac consultation',
      notes: 'Patient with history of heart attack',
      symptoms: 'Chest pain, shortness of breath',
      roomNumber: '201',
      location: 'Cardiology Wing - Floor 2',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[1].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[1].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[1].id)
          ?.id,
      appointmentDate: new Date('2024-02-16 15:30:00'),
      duration: 30,
      startTime: new Date('2024-02-16 15:30:00'),
      endTime: new Date('2024-02-16 16:00:00'),
      appointmentType: 'routine_checkup',
      status: 'confirmed',
      priority: 'normal',
      description: 'Blood pressure monitoring',
      notes: 'Regular BP check for hypertension management',
      symptoms: 'None',
      roomNumber: '202',
      location: 'Cardiology Wing - Floor 2',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },

    // Organization 3 - Pediatric Center
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[2].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[2].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[2].id)
          ?.id,
      appointmentDate: new Date('2024-02-17 11:00:00'),
      duration: 45,
      startTime: new Date('2024-02-17 11:00:00'),
      endTime: new Date('2024-02-17 11:45:00'),
      appointmentType: 'consultation',
      status: 'scheduled',
      priority: 'normal',
      description: 'Asthma management',
      notes: 'Review inhaler technique and asthma action plan',
      symptoms: 'Wheezing, coughing',
      roomNumber: '301',
      location: 'Pediatric Wing - Floor 3',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[2].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[2].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[2].id)
          ?.id,
      appointmentDate: new Date('2024-02-17 16:00:00'),
      duration: 30,
      startTime: new Date('2024-02-17 16:00:00'),
      endTime: new Date('2024-02-17 16:30:00'),
      appointmentType: 'routine_checkup',
      status: 'confirmed',
      priority: 'low',
      description: 'Well-child visit',
      notes: 'Regular developmental checkup',
      symptoms: 'None',
      roomNumber: '302',
      location: 'Pediatric Wing - Floor 3',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },

    // Organization 4 - Mental Health Center
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[3].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[3].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[3].id)
          ?.id,
      appointmentDate: new Date('2024-02-18 13:00:00'),
      duration: 60,
      startTime: new Date('2024-02-18 13:00:00'),
      endTime: new Date('2024-02-18 14:00:00'),
      appointmentType: 'consultation',
      status: 'scheduled',
      priority: 'high',
      description: 'Depression therapy session',
      notes: 'Weekly therapy session for depression management',
      symptoms: 'Depressed mood, lack of energy',
      roomNumber: '401',
      location: 'Mental Health Wing - Floor 4',
      organizationId: allOrganizations[3].id,
      isActive: true,
    },
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[3].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[3].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[3].id)
          ?.id,
      appointmentDate: new Date('2024-02-18 17:00:00'),
      duration: 45,
      startTime: new Date('2024-02-18 17:00:00'),
      endTime: new Date('2024-02-18 17:45:00'),
      appointmentType: 'follow_up',
      status: 'confirmed',
      priority: 'normal',
      description: 'ADHD medication review',
      notes: 'Review medication effectiveness and side effects',
      symptoms: 'Difficulty concentrating, hyperactivity',
      roomNumber: '402',
      location: 'Mental Health Wing - Floor 4',
      organizationId: allOrganizations[3].id,
      isActive: true,
    },

    // Organization 5 - Orthopedic Center
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[4].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[4].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[4].id)
          ?.id,
      appointmentDate: new Date('2024-02-19 09:30:00'),
      duration: 60,
      startTime: new Date('2024-02-19 09:30:00'),
      endTime: new Date('2024-02-19 10:30:00'),
      appointmentType: 'consultation',
      status: 'scheduled',
      priority: 'high',
      description: 'Knee pain evaluation',
      notes: 'Post-knee replacement follow-up',
      symptoms: 'Knee pain, stiffness',
      roomNumber: '501',
      location: 'Orthopedic Wing - Floor 5',
      organizationId: allOrganizations[4].id,
      isActive: true,
    },
    {
      patientId: allPatients.find(
        (p) => p.organizationId === allOrganizations[4].id,
      )?.id,
      healthProfessionalId:
        healthProfessionals.find(
          (hp) => hp.organizationId === allOrganizations[4].id,
        )?.id ||
        adminUsers.find((au) => au.organizationId === allOrganizations[4].id)
          ?.id,
      appointmentDate: new Date('2024-02-19 14:30:00'),
      duration: 45,
      startTime: new Date('2024-02-19 14:30:00'),
      endTime: new Date('2024-02-19 15:15:00'),
      appointmentType: 'routine_checkup',
      status: 'confirmed',
      priority: 'normal',
      description: 'Hip replacement follow-up',
      notes: 'Regular post-surgery checkup',
      symptoms: 'None',
      roomNumber: '502',
      location: 'Orthopedic Wing - Floor 5',
      organizationId: allOrganizations[4].id,
      isActive: true,
    },
  ];

  for (const appointmentData of appointmentsData) {
    try {
      // Skip if required fields are missing
      if (!appointmentData.patientId || !appointmentData.healthProfessionalId) {
        console.log(
          `⚠️  Skipping appointment - missing patient or health professional for organization ${appointmentData.organizationId}`,
        );
        continue;
      }

      // Find an admin user from the same organization to use as createdBy
      const adminUser =
        adminUsers.find(
          (user) => user.organizationId === appointmentData.organizationId,
        ) || adminUsers[0]; // Fallback to first admin if not found

      await db.insert(appointments).values({
        patientId: appointmentData.patientId,
        healthProfessionalId: appointmentData.healthProfessionalId,
        appointmentDate: appointmentData.appointmentDate,
        duration: appointmentData.duration,
        startTime: appointmentData.startTime,
        endTime: appointmentData.endTime,
        appointmentType: appointmentData.appointmentType as
          | 'consultation'
          | 'follow_up'
          | 'emergency'
          | 'routine_checkup'
          | 'specialist_visit',
        status: appointmentData.status as
          | 'scheduled'
          | 'confirmed'
          | 'in_progress'
          | 'completed'
          | 'cancelled'
          | 'no_show',
        priority: appointmentData.priority as
          | 'low'
          | 'normal'
          | 'high'
          | 'urgent',
        description: appointmentData.description,
        notes: appointmentData.notes,
        symptoms: appointmentData.symptoms,
        roomNumber: appointmentData.roomNumber,
        location: appointmentData.location,
        organizationId: appointmentData.organizationId,
        isActive: appointmentData.isActive,
        createdBy: adminUser?.id,
        updatedBy: adminUser?.id,
      });
      console.log(
        `✅ Created appointment: ${appointmentData.appointmentType} for organization ${appointmentData.organizationId}`,
      );
    } catch (error) {
      console.log(`⚠️  Appointment might already exist:`, error.message);
    }
  }

  console.log('✅ Appointments seeding completed!');
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedAppointments().finally(() => client.end());
}
