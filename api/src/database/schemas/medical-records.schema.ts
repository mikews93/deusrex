import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { patients } from './patients.schema';
import { appointments } from './appointments.schema';
import { medicalRecordTypeEnum } from './enums';

export const medicalRecords = pgTable('medical_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),

  // Patient and Appointment Reference
  patientId: uuid('patient_id')
    .references(() => patients.id)
    .notNull(),
  appointmentId: uuid('appointment_id').references(() => appointments.id),

  // Record Information
  recordType: medicalRecordTypeEnum('record_type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),

  // Vital Signs
  bloodPressure: varchar('blood_pressure', { length: 20 }), // e.g., "120/80"
  heartRate: integer('heart_rate'), // beats per minute
  temperature: decimal('temperature', { precision: 4, scale: 1 }), // in Celsius
  weight: decimal('weight', { precision: 5, scale: 2 }), // in kg
  height: decimal('height', { precision: 5, scale: 2 }), // in cm
  oxygenSaturation: integer('oxygen_saturation'), // percentage

  // Medical Details
  symptoms: text('symptoms'),
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  medications: text('medications'),
  dosage: text('dosage'),
  instructions: text('instructions'),

  // Lab Results
  labResults: text('lab_results'),
  imagingResults: text('imaging_results'),

  // Follow-up
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date'),
  followUpNotes: text('follow_up_notes'),

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
