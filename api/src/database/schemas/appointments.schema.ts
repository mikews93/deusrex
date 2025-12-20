import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core';
import { organizations } from './organizations.schema';
import { users } from './users.schema';
import { patients } from './patients.schema';
import { healthProfessionals } from './health-professionals.schema';
import {
  appointmentTypeEnum,
  appointmentStatusEnum,
  appointmentPriorityEnum,
} from './enums';

export const appointments = pgTable('appointments', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),

  // Appointment Details
  patientId: uuid('patient_id')
    .references(() => patients.id)
    .notNull(),
  healthProfessionalId: uuid('health_professional_id')
    .references(() => healthProfessionals.id)
    .notNull(),

  // Scheduling
  appointmentDate: timestamp('appointment_date').notNull(),
  duration: integer('duration').notNull(), // Duration in minutes
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),

  // Appointment Information
  appointmentType: appointmentTypeEnum('appointment_type').notNull(),
  status: appointmentStatusEnum('status').default('scheduled'),
  priority: appointmentPriorityEnum('priority').default('normal'),

  // Notes and Description
  description: text('description'),
  notes: text('notes'),
  symptoms: text('symptoms'),

  // Location
  roomNumber: varchar('room_number', { length: 20 }),
  location: varchar('location', { length: 200 }),

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
