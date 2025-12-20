import { pgEnum } from 'drizzle-orm/pg-core';

// User types
export const userTypeEnum = pgEnum('user_type', ['superadmin', 'regular']);

// User organization roles
export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'member',
  'health_professional',
  'receptionist',
  'patient',
]);

// Patient biological sex
export const patientSexEnum = pgEnum('patient_sex', ['male', 'female']);

// Blood types
export const bloodTypeEnum = pgEnum('blood_type', [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
]);

// Appointment types
export const appointmentTypeEnum = pgEnum('appointment_type', [
  'consultation',
  'follow_up',
  'emergency',
  'routine_checkup',
  'specialist_visit',
]);

// Appointment status
export const appointmentStatusEnum = pgEnum('appointment_status', [
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);

// Appointment priority
export const appointmentPriorityEnum = pgEnum('appointment_priority', [
  'low',
  'normal',
  'high',
  'urgent',
]);

// Medical record types
export const medicalRecordTypeEnum = pgEnum('medical_record_type', [
  'consultation',
  'examination',
  'lab_result',
  'imaging',
  'prescription',
  'procedure',
  'vaccination',
]);

// Health professional types
export const healthProfessionalTypeEnum = pgEnum('health_professional_type', [
  'doctor',
  'nurse',
  'specialist',
  'therapist',
  'technician',
  'administrator',
]);

// Health professional specialties
export const healthProfessionalSpecialtyEnum = pgEnum(
  'health_professional_specialty',
  [
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
  ],
);

// Item types
export const itemTypeEnum = pgEnum('item_type', ['product', 'service']);

// Product types for multi-country compliance
export const productTypeEnum = pgEnum('product_type', [
  'physical',
  'digital',
  'service',
  'misc',
]);

// Sale status for multi-country compliance
export const saleStatusEnum = pgEnum('sale_status', [
  'draft',
  'issued',
  'accepted',
  'cancelled',
  'completed', // Keep existing status for backward compatibility
]);

// Adjustment types
export const adjustmentTypeEnum = pgEnum('adjustment_type', [
  'credit',
  'debit',
  'void',
]);

// Adjustment status
export const adjustmentStatusEnum = pgEnum('adjustment_status', [
  'draft',
  'issued',
  'accepted',
  'cancelled',
]);

// Inventory movement types
export const movementTypeEnum = pgEnum('movement_type', [
  'sale_out',
  'return_in',
  'adjustment',
  'manual',
]);

// Digital delivery types
export const deliveryTypeEnum = pgEnum('delivery_type', [
  'license_key',
  'download',
  'email_link',
]);

// Service fulfillment status
export const fulfillmentStatusEnum = pgEnum('fulfillment_status', [
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
]);

// Fiscal document status
export const fiscalDocumentStatusEnum = pgEnum('fiscal_document_status', [
  'pending',
  'generated',
  'sent',
  'accepted',
  'rejected',
  'failed',
]);
