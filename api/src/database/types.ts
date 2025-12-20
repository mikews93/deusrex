import { InferSelectModel, InferInsertModel, InferEnum } from 'drizzle-orm';
import { patients } from './schemas/patients.schema';
import {
  users,
  organizations,
  userOrganizations,
  appointments,
  medicalRecords,
  clients,
  sales,
  healthProfessionals,
  saleItems,
  items,
} from './schemas';
import * as enums from './schemas/enums';

// Patient types
export type Patient = InferSelectModel<typeof patients>;
export type NewPatient = InferInsertModel<typeof patients>;
export type PatientWithRelations = Patient & {
  user?: User;
  medicalRecords?: MedicalRecordWithRelations[];
  appointments?: AppointmentWithRelations[];
  healthProfessional?: HealthProfessionalWithRelations;
  organization?: OrganizationWithRelations;
};

// Health Professional types
export type HealthProfessional = InferSelectModel<typeof healthProfessionals>;
export type NewHealthProfessional = InferInsertModel<
  typeof healthProfessionals
>;
export type HealthProfessionalWithRelations = HealthProfessional & {
  user?: User;
  organization?: OrganizationWithRelations;
  appointments?: AppointmentWithRelations[];
  user_createdBy?: User;
  user_updatedBy?: User;
  user_deletedBy?: User;
};

// User types
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type UserWithRelations = User & {
  user_createdBy?: User;
  user_updatedBy?: User;
  clients_createdBy?: ClientWithRelations[];
  clients_updatedBy?: ClientWithRelations[];
  clients_deletedBy?: ClientWithRelations[];
  sales_createdBy?: SaleWithRelations[];
  sales_updatedBy?: SaleWithRelations[];
  sales_deletedBy?: SaleWithRelations[];
  items_createdBy?: ItemWithRelations[];
  items_updatedBy?: ItemWithRelations[];
  items_deletedBy?: ItemWithRelations[];
  userOrganizations_createdBy?: UserOrganization[];
  userOrganizations_updatedBy?: UserOrganization[];
  userOrganizations_userId?: UserOrganization[];
  appointments_createdBy?: AppointmentWithRelations[];
  appointments_updatedBy?: AppointmentWithRelations[];
  appointments_deletedBy?: AppointmentWithRelations[];
  appointments_healthProfessionalId?: AppointmentWithRelations[];
  medicalRecords_createdBy?: MedicalRecordWithRelations[];
  medicalRecords_updatedBy?: MedicalRecordWithRelations[];
  medicalRecords_deletedBy?: MedicalRecordWithRelations[];
  patients?: PatientWithRelations[];
  patients_createdBy?: PatientWithRelations[];
  patients_updatedBy?: PatientWithRelations[];
  patients_deletedBy?: PatientWithRelations[];
  healthProfessionals?: HealthProfessional[];
  healthProfessionals_createdBy?: HealthProfessionalWithRelations[];
  healthProfessionals_updatedBy?: HealthProfessionalWithRelations[];
  healthProfessionals_deletedBy?: HealthProfessionalWithRelations[];
};

// Organization types
export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = InferInsertModel<typeof organizations>;
export type OrganizationWithRelations = Organization & {
  clients?: ClientWithRelations[];
  sales?: SaleWithRelations[];
  items?: ItemWithRelations[];
  userOrganizations?: UserOrganizationWithRelations[];
  appointments?: AppointmentWithRelations[];
  medicalRecords?: MedicalRecordWithRelations[];
  patients?: PatientWithRelations[];
  healthProfessionals?: HealthProfessionalWithRelations[];
};

// User Organization types
export type UserOrganization = InferSelectModel<typeof userOrganizations>;
export type NewUserOrganization = InferInsertModel<typeof userOrganizations>;
export type UserOrganizationWithRelations = UserOrganization & {
  user_createdBy?: User;
  organization?: OrganizationWithRelations;
  user_updatedBy?: User;
  user_userId?: User;
};

// Appointment types
export type Appointment = InferSelectModel<typeof appointments>;
export type NewAppointment = InferInsertModel<typeof appointments>;
export type AppointmentWithRelations = Appointment & {
  user_createdBy?: User;
  user_deletedBy?: User;
  healthProfessional?: HealthProfessionalWithRelations;
  organization?: OrganizationWithRelations;
  patient?: PatientWithRelations;
  user_updatedBy?: User;
  medicalRecords?: MedicalRecordWithRelations[];
};

// Medical Record types
export type MedicalRecord = InferSelectModel<typeof medicalRecords>;
export type NewMedicalRecord = InferInsertModel<typeof medicalRecords>;
export type MedicalRecordWithRelations = MedicalRecord & {
  appointment?: AppointmentWithRelations;
  user_createdBy?: User;
  user_deletedBy?: User;
  organization?: OrganizationWithRelations;
  patient?: PatientWithRelations;
  user_updatedBy?: User;
};

// Client types
export type Client = InferSelectModel<typeof clients>;
export type NewClient = InferInsertModel<typeof clients>;
export type ClientWithRelations = Client & {
  user_createdBy?: User;
  user_deletedBy?: User;
  organization?: OrganizationWithRelations;
  user_updatedBy?: User;
  sales?: SaleWithRelations[];
};

// Item types (unified products and services)
export type Item = InferSelectModel<typeof items>;
export type NewItem = InferInsertModel<typeof items>;
export type ItemWithRelations = Item & {
  saleItems?: SaleItemWithRelations[];
  user_createdBy?: User;
  user_deletedBy?: User;
  organization?: OrganizationWithRelations;
  user_updatedBy?: User;
};

// Sale types
export type Sale = InferSelectModel<typeof sales>;
export type NewSale = InferInsertModel<typeof sales>;
export type SaleWithRelations = Sale & {
  saleItems?: SaleItemWithRelations[];
  client?: ClientWithRelations;
  user_createdBy?: User;
  user_deletedBy?: User;
  organization?: OrganizationWithRelations;
  user_updatedBy?: User;
};

// Sale Item types
export type SaleItem = InferSelectModel<typeof saleItems>;
export type NewSaleItem = InferInsertModel<typeof saleItems>;
export type SaleItemWithRelations = SaleItem & {
  item?: ItemWithRelations;
  sale?: SaleWithRelations;
};

// Enum types
export type UserType = InferEnum<typeof enums.userTypeEnum>;
export type UserRole = InferEnum<typeof enums.userRoleEnum>;
export type PatientSex = InferEnum<typeof enums.patientSexEnum>;
export type BloodType = InferEnum<typeof enums.bloodTypeEnum>;
export type AppointmentType = InferEnum<typeof enums.appointmentTypeEnum>;
export type AppointmentStatus = InferEnum<typeof enums.appointmentStatusEnum>;
export type AppointmentPriority = InferEnum<
  typeof enums.appointmentPriorityEnum
>;
export type MedicalRecordType = InferEnum<typeof enums.medicalRecordTypeEnum>;
export type ItemType = InferEnum<typeof enums.itemTypeEnum>;

// Re-export Zod schemas
export * from './schemas/zod-schemas';
