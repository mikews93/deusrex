import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import {
  healthProfessionalTypeEnum,
  healthProfessionalSpecialtyEnum,
} from './enums';
import { organizations } from './organizations.schema';
import { users } from './users.schema';

export const healthProfessionals = pgTable('health_professionals', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: uuid('organization_id')
    .references(() => organizations.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .unique(), // One user can only be linked to one health professional record

  // Personal Information
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),

  // Professional Information
  type: healthProfessionalTypeEnum('type').notNull(),
  specialty: healthProfessionalSpecialtyEnum('specialty'),
  licenseNumber: varchar('license_number', { length: 50 }),
  npi: varchar('npi', { length: 20 }), // National Provider Identifier

  // Additional Information
  bio: text('bio'),
  education: text('education'),
  certifications: text('certifications'),
  languages: text('languages'), // JSON array of languages

  // Status and Settings
  isActive: boolean('is_active').default(true),
  isAvailable: boolean('is_available').default(true),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),

  // Audit fields
  createdBy: uuid('created_by').references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  deletedBy: uuid('deleted_by').references(() => users.id),
});
