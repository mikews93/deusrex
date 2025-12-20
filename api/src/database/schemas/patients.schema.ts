import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { patientSexEnum, bloodTypeEnum } from './enums';

export const patients = pgTable('patients', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .unique(), // One user can only be linked to one patient record

  // Personal Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  sex: patientSexEnum('sex').notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),

  // Address Information
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }),

  // Emergency Contact
  emergencyContactName: varchar('emergency_contact_name', { length: 200 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  emergencyContactRelationship: varchar('emergency_contact_relationship', {
    length: 100,
  }),

  // Medical Information
  bloodType: bloodTypeEnum('blood_type'),
  allergies: text('allergies'),
  currentMedications: text('current_medications'),
  insuranceProvider: varchar('insurance_provider', { length: 200 }),
  insuranceNumber: varchar('insurance_number', { length: 100 }),

  // Status
  isActive: boolean('is_active').default(true),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),

  // Audit fields
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
});
