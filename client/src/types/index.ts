// Re-export all types from shared
export * from "./shared";

// Export specific types for forms
export type { PatientFormData } from "./shared";
export type { ClientFormData } from "./shared";
export type { ProductFormData } from "./shared";
export type { ServiceFormData } from "./shared";
export type { SaleFormData } from "./shared";
export type { AppointmentFormData } from "./shared";
export type { MedicalRecordFormData } from "./shared";

// Export entity types
export type { Patient } from "./shared";
export type { Client } from "./shared";
export type { Product } from "./shared";
export type { Service } from "./shared";
export type { Sale } from "./shared";
export type { Appointment } from "./shared";
export type { MedicalRecord } from "./shared";
