import { z } from 'zod';

// Base filter schema for OpenAPI (with with/columns as strings)
export const commonFilterBaseSchema = z.object({
  search: z.string().optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  status: z.string().optional(),
  paginated: z.boolean().default(false),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  includeDeleted: z.boolean().default(false),
  with: z.string().optional(), // JSON string for relationships to include
  columns: z.string().optional(), // JSON string for columns to select
});

// Extended filter schema with complex objects (for internal use)
export const commonFilterSchema = commonFilterBaseSchema.extend({
  with: z.record(z.string(), z.any()).optional(), // Override string with object for internal use
  columns: z.record(z.string(), z.boolean()).optional(), // Override string with object for internal use
});

// Type for common filters
export type CommonFilter = z.infer<typeof commonFilterSchema>;

// Appointment-specific filters (base for OpenAPI)
export const appointmentFilterBaseSchema = commonFilterBaseSchema.extend({
  appointmentType: z
    .enum([
      'consultation',
      'follow_up',
      'emergency',
      'routine_checkup',
      'specialist_visit',
    ])
    .optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  patientId: z.string().uuid().optional(),
  healthProfessionalId: z.string().uuid().optional(),
  appointmentDateFrom: z.iso.datetime().optional(),
  appointmentDateTo: z.iso.datetime().optional(),
  roomNumber: z.string().optional(),
  location: z.string().optional(),
});

// Extended appointment filter schema (for internal use)
export const appointmentFilterSchema = appointmentFilterBaseSchema.extend({
  with: z.record(z.string(), z.any()).optional(), // Override string with object for internal use
  columns: z.record(z.string(), z.boolean()).optional(), // Override string with object for internal use
});

export type AppointmentFilter = z.infer<typeof appointmentFilterSchema>;

// Patient-specific filters (base for OpenAPI)
export const patientFilterBaseSchema = commonFilterBaseSchema.extend({
  gender: z.enum(['male', 'female']).optional(),
  ageFrom: z.number().min(0).optional(),
  ageTo: z.number().min(0).optional(),
  bloodType: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  dateOfBirthFrom: z.iso.datetime().optional(),
  dateOfBirthTo: z.iso.datetime().optional(),
  phone: z.string().optional(),
  email: z.email().optional(),
});

// Extended patient filter schema (for internal use)
export const patientFilterSchema = patientFilterBaseSchema.extend({
  with: z.record(z.string(), z.any()).optional(), // Override string with object for internal use
  columns: z.record(z.string(), z.boolean()).optional(), // Override string with object for internal use
});

export type PatientFilter = z.infer<typeof patientFilterSchema>;

// Sales-specific filters (base for OpenAPI)
export const salesFilterBaseSchema = commonFilterBaseSchema.extend({
  clientId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  serviceId: z.string().uuid().optional(),
  amountFrom: z.number().min(0).optional(),
  amountTo: z.number().min(0).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'partial', 'refunded']).optional(),
  paymentMethod: z.string().optional(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional(),
});

// Extended sales filter schema (for internal use)
export const salesFilterSchema = salesFilterBaseSchema.extend({
  with: z.record(z.string(), z.any()).optional(), // Override string with object for internal use
  columns: z.record(z.string(), z.boolean()).optional(), // Override string with object for internal use
});

export type SalesFilter = z.infer<typeof salesFilterSchema>;

// Products-specific filters
export const productsFilterSchema = commonFilterSchema.extend({
  category: z.string().optional(),
  priceFrom: z.number().min(0).optional(),
  priceTo: z.number().min(0).optional(),
  stockFrom: z.number().min(0).optional(),
  stockTo: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type ProductsFilter = z.infer<typeof productsFilterSchema>;

// Services-specific filters
export const servicesFilterSchema = commonFilterSchema.extend({
  category: z.string().optional(),
  durationFrom: z.number().min(0).optional(),
  durationTo: z.number().min(0).optional(),
  priceFrom: z.number().min(0).optional(),
  priceTo: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export type ServicesFilter = z.infer<typeof servicesFilterSchema>;

// Clients-specific filters
export const clientsFilterSchema = commonFilterSchema.extend({
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export type ClientsFilter = z.infer<typeof clientsFilterSchema>;

// Medical Records-specific filters
export const medicalRecordsFilterSchema = commonFilterSchema.extend({
  patientId: z.number().optional(),
  appointmentId: z.number().optional(),
  recordType: z
    .enum([
      'consultation',
      'examination',
      'lab_result',
      'imaging',
      'prescription',
      'procedure',
      'vaccination',
    ])
    .optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
});

export type MedicalRecordsFilter = z.infer<typeof medicalRecordsFilterSchema>;

// Health Professionals-specific filters (base for OpenAPI)
export const healthProfessionalFilterBaseSchema = commonFilterBaseSchema.extend(
  {
    type: z
      .enum([
        'doctor',
        'nurse',
        'specialist',
        'therapist',
        'technician',
        'administrator',
      ])
      .optional(),
    specialty: z
      .enum([
        'general_practice',
        'cardiology',
        'dermatology',
        'neurology',
        'orthopedics',
        'pediatrics',
        'psychiatry',
        'radiology',
        'surgery',
        'emergency_medicine',
        'internal_medicine',
        'family_medicine',
        'oncology',
        'gynecology',
        'urology',
        'ophthalmology',
        'otolaryngology',
        'anesthesiology',
        'pathology',
        'other',
      ])
      .optional(),
    isAvailable: z.boolean().optional(),
    isActive: z.boolean().optional(),
    licenseNumber: z.string().optional(),
    npi: z.string().optional(),
  },
);

// Extended health professional filter schema (for internal use)
export const healthProfessionalFilterSchema =
  healthProfessionalFilterBaseSchema.extend({
    with: z.record(z.string(), z.any()).optional(), // Override string with object for internal use
    columns: z.record(z.string(), z.boolean()).optional(), // Override string with object for internal use
  });

export type HealthProfessionalFilter = z.infer<
  typeof healthProfessionalFilterSchema
>;

// Item-specific filters (base for OpenAPI)
export const itemFilterBaseSchema = commonFilterBaseSchema.extend({
  type: z.enum(['product', 'service']).optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
  stockMin: z.number().min(0).optional(),
  stockMax: z.number().min(0).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
});

// Extended item filter schema (for internal use)
export const itemFilterSchema = itemFilterBaseSchema.extend({
  with: z.record(z.string(), z.any()).optional(), // Override string with object for internal use
  columns: z.record(z.string(), z.boolean()).optional(), // Override string with object for internal use
});

export type ItemFilter = z.infer<typeof itemFilterSchema>;
