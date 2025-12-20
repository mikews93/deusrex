// Shared types that match the server schemas
// These types are derived from the Zod schemas in the server

export enum PatientSex {
  MALE = "male",
  FEMALE = "female",
}

export enum BloodType {
  A_POSITIVE = "A+",
  A_NEGATIVE = "A-",
  B_POSITIVE = "B+",
  B_NEGATIVE = "B-",
  AB_POSITIVE = "AB+",
  AB_NEGATIVE = "AB-",
  O_POSITIVE = "O+",
  O_NEGATIVE = "O-",
}

export interface Patient {
  id?: string;
  organizationId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  sex?: PatientSex | "male" | "female";
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  bloodType?:
    | BloodType
    | "A+"
    | "A-"
    | "B+"
    | "B-"
    | "AB+"
    | "AB-"
    | "O+"
    | "O-";
  allergies?: string;
  currentMedications?: string;
  medicalHistory?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface Client {
  id?: string;
  organizationId?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface Product {
  id?: string;
  organizationId?: string;
  name?: string;
  description?: string;
  sku?: string;
  price?: string;
  cost?: string;
  stock?: number;
  category?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export interface Service {
  id?: string;
  organizationId?: string;
  name?: string;
  description?: string;
  price?: string;
  duration?: number;
  category?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export enum SaleStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
export interface Sale {
  id?: string;
  organizationId?: string;
  clientId?: string;
  totalAmount?: string;
  status?: SaleStatus | "pending" | "completed" | "cancelled";
  saleDate?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

export enum AppointmentType {
  CONSULTATION = "consultation",
  FOLLOW_UP = "follow_up",
  EMERGENCY = "emergency",
  ROUTINE_CHECKUP = "routine_checkup",
  SPECIALIST_VISIT = "specialist_visit",
}

export enum AppointmentStatus {
  SCHEDULED = "scheduled",
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

export enum AppointmentPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

export interface Appointment {
  id?: string;
  organizationId?: string;
  patientId?: string;
  healthProfessionalId?: string;
  appointmentDate?: string;
  duration?: number;
  startTime?: string;
  endTime?: string;
  appointmentType?:
    | AppointmentType
    | "scheduled"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  status?:
    | AppointmentStatus
    | "scheduled"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "no_show";
  priority?: AppointmentPriority | "low" | "normal" | "high" | "urgent";
  description?: string;
  notes?: string;
  symptoms?: string;
  roomNumber?: string;
  location?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
  patient?: Patient;
  healthProfessional?: HealthProfessional;
}

export enum MedicalRecordType {
  CONSULTATION = "consultation",
  EXAMINATION = "examination",
  LAB_RESULT = "lab_result",
  IMAGING = "imaging",
  PRESCRIPTION = "prescription",
  PROCEDURE = "procedure",
  VACCINATION = "vaccination",
}
export interface MedicalRecord {
  id?: string;
  organizationId?: string;
  patientId?: string;
  appointmentId?: string;
  recordType?:
    | MedicalRecordType
    | "consultation"
    | "examination"
    | "lab_result"
    | "imaging"
    | "prescription"
    | "procedure"
    | "vaccination";
  title?: string;
  description?: string;
  bloodPressure?: string;
  heartRate?: number;
  temperature?: string;
  weight?: string;
  height?: string;
  oxygenSaturation?: number;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  dosage?: string;
  instructions?: string;
  labResults?: string;
  imagingResults?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  followUpNotes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}

// Form data types for create/update operations
export interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  sex: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  bloodType: string;
  allergies: string;
  currentMedications: string;
  medicalHistory: string;
  insuranceProvider: string;
  insuranceNumber: string;
}

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  price: string;
  cost: string;
  stock: string;
  category: string;
}

export interface ServiceFormData {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

export interface SaleFormData {
  clientId: string;
  totalAmount: string;
  status: string;
  saleDate: string;
}

export interface AppointmentFormData {
  patientId: string;
  healthProfessionalId: string;
  appointmentDate: string;
  duration: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  status: string;
  priority: string;
  description: string;
  notes: string;
  symptoms: string;
  roomNumber: string;
  location: string;
}

export interface MedicalRecordFormData {
  patientId: string;
  appointmentId: string;
  recordType: string;
  title: string;
  description: string;
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  height: string;
  oxygenSaturation: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  dosage: string;
  instructions: string;
  labResults: string;
  imagingResults: string;
  followUpRequired: boolean;
  followUpDate: string;
  followUpNotes: string;
}

export enum HealthProfessionalType {
  DOCTOR = "doctor",
  NURSE = "nurse",
  SPECIALIST = "specialist",
  THERAPIST = "therapist",
  TECHNICIAN = "technician",
  ADMINISTRATOR = "administrator",
}

export interface HealthProfessional {
  id?: string;
  organizationId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  languages?: string;
  type?:
    | HealthProfessionalType
    | "doctor"
    | "nurse"
    | "specialist"
    | "therapist"
    | "technician"
    | "administrator";
  specialty?:
    | "general_practice"
    | "cardiology"
    | "dermatology"
    | "neurology"
    | "orthopedics"
    | "pediatrics"
    | "psychiatry"
    | "radiology"
    | "surgery"
    | "emergency_medicine"
    | "internal_medicine"
    | "family_medicine"
    | "oncology"
    | "gynecology"
    | "urology"
    | "ophthalmology"
    | "otolaryngology"
    | "anesthesiology"
    | "pathology"
    | "other";
  licenseNumber?: string;
  bio?: string;
  isAvailable?: boolean;
  workingHours?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  deletedBy?: string;
}
