import { relations } from 'drizzle-orm/relations';
import {
  users,
  clients,
  organizations,
  saleItems,
  sales,
  items,
  userOrganizations,
  appointments,
  patients,
  healthProfessionals,
  medicalRecords,
  // Multi-country compliance schemas
  jurisdictions,
  taxCategories,
  taxRates,
  fiscalDocuments,
  // Inventory management schemas
  inventoryMovements,
  adjustments,
  adjustmentItems,
  // Service and digital delivery schemas
  digitalDeliveries,
  serviceFulfillments,
  // Accounting schemas
  journalEntries,
  journalLines,
} from './index';

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user_createdBy: one(users, {
    fields: [clients.createdBy],
    references: [users.id],
    relationName: 'clients_createdBy_users_id',
  }),
  user_deletedBy: one(users, {
    fields: [clients.deletedBy],
    references: [users.id],
    relationName: 'clients_deletedBy_users_id',
  }),
  organization: one(organizations, {
    fields: [clients.organizationId],
    references: [organizations.id],
  }),
  user_updatedBy: one(users, {
    fields: [clients.updatedBy],
    references: [users.id],
    relationName: 'clients_updatedBy_users_id',
  }),
  sales: many(sales),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  clients_createdBy: many(clients, {
    relationName: 'clients_createdBy_users_id',
  }),
  clients_deletedBy: many(clients, {
    relationName: 'clients_deletedBy_users_id',
  }),
  clients_updatedBy: many(clients, {
    relationName: 'clients_updatedBy_users_id',
  }),
  sales_createdBy: many(sales, {
    relationName: 'sales_createdBy_users_id',
  }),
  sales_deletedBy: many(sales, {
    relationName: 'sales_deletedBy_users_id',
  }),
  sales_updatedBy: many(sales, {
    relationName: 'sales_updatedBy_users_id',
  }),
  items_createdBy: many(items, {
    relationName: 'items_createdBy_users_id',
  }),
  items_deletedBy: many(items, {
    relationName: 'items_deletedBy_users_id',
  }),
  items_updatedBy: many(items, {
    relationName: 'items_updatedBy_users_id',
  }),
  userOrganizations_createdBy: many(userOrganizations, {
    relationName: 'userOrganizations_createdBy_users_id',
  }),
  userOrganizations_updatedBy: many(userOrganizations, {
    relationName: 'userOrganizations_updatedBy_users_id',
  }),
  userOrganizations_userId: many(userOrganizations, {
    relationName: 'userOrganizations_userId_users_id',
  }),
  appointments_createdBy: many(appointments, {
    relationName: 'appointments_createdBy_users_id',
  }),
  appointments_deletedBy: many(appointments, {
    relationName: 'appointments_deletedBy_users_id',
  }),
  appointments_healthProfessionalId: many(appointments, {
    relationName: 'appointments_healthProfessionalId_users_id',
  }),
  appointments_updatedBy: many(appointments, {
    relationName: 'appointments_updatedBy_users_id',
  }),
  medicalRecords_createdBy: many(medicalRecords, {
    relationName: 'medicalRecords_createdBy_users_id',
  }),
  medicalRecords_deletedBy: many(medicalRecords, {
    relationName: 'medicalRecords_deletedBy_users_id',
  }),
  medicalRecords_updatedBy: many(medicalRecords, {
    relationName: 'medicalRecords_updatedBy_users_id',
  }),
  user_createdBy: one(users, {
    fields: [users.createdBy],
    references: [users.id],
    relationName: 'users_createdBy_users_id',
  }),
  users_createdBy: many(users, {
    relationName: 'users_createdBy_users_id',
  }),
  user_updatedBy: one(users, {
    fields: [users.updatedBy],
    references: [users.id],
    relationName: 'users_updatedBy_users_id',
  }),
  users_updatedBy: many(users, {
    relationName: 'users_updatedBy_users_id',
  }),
  patients: many(patients, {
    relationName: 'patients_user_users_id',
  }),
  patients_createdBy: many(patients, {
    relationName: 'patients_createdBy_users_id',
  }),
  patients_deletedBy: many(patients, {
    relationName: 'patients_deletedBy_users_id',
  }),
  patients_updatedBy: many(patients, {
    relationName: 'patients_updatedBy_users_id',
  }),
  healthProfessionals: many(healthProfessionals, {
    relationName: 'healthProfessionals_user_users_id',
  }),
  healthProfessionals_createdBy: many(healthProfessionals, {
    relationName: 'healthProfessionals_createdBy_users_id',
  }),
  healthProfessionals_updatedBy: many(healthProfessionals, {
    relationName: 'healthProfessionals_updatedBy_users_id',
  }),
  healthProfessionals_deletedBy: many(healthProfessionals, {
    relationName: 'healthProfessionals_deletedBy_users_id',
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  clients: many(clients),
  sales: many(sales),
  items: many(items),
  userOrganizations: many(userOrganizations),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  patients: many(patients),
  healthProfessionals: many(healthProfessionals),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  item: one(items, {
    fields: [saleItems.itemId],
    references: [items.id],
  }),
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
}));

export const salesRelations = relations(sales, ({ one, many }) => ({
  saleItems: many(saleItems),
  client: one(clients, {
    fields: [sales.clientId],
    references: [clients.id],
  }),
  user_createdBy: one(users, {
    fields: [sales.createdBy],
    references: [users.id],
    relationName: 'sales_createdBy_users_id',
  }),
  user_deletedBy: one(users, {
    fields: [sales.deletedBy],
    references: [users.id],
    relationName: 'sales_deletedBy_users_id',
  }),
  organization: one(organizations, {
    fields: [sales.organizationId],
    references: [organizations.id],
  }),
  user_updatedBy: one(users, {
    fields: [sales.updatedBy],
    references: [users.id],
    relationName: 'sales_updatedBy_users_id',
  }),
}));

export const itemsRelations = relations(items, ({ one, many }) => ({
  user_createdBy: one(users, {
    fields: [items.createdBy],
    references: [users.id],
    relationName: 'items_createdBy_users_id',
  }),
  user_deletedBy: one(users, {
    fields: [items.deletedBy],
    references: [users.id],
    relationName: 'items_deletedBy_users_id',
  }),
  organization: one(organizations, {
    fields: [items.organizationId],
    references: [organizations.id],
  }),
  user_updatedBy: one(users, {
    fields: [items.updatedBy],
    references: [users.id],
    relationName: 'items_updatedBy_users_id',
  }),
  saleItems: many(saleItems),
}));

export const userOrganizationsRelations = relations(
  userOrganizations,
  ({ one }) => ({
    user_createdBy: one(users, {
      fields: [userOrganizations.createdBy],
      references: [users.id],
      relationName: 'userOrganizations_createdBy_users_id',
    }),
    organization: one(organizations, {
      fields: [userOrganizations.organizationId],
      references: [organizations.id],
    }),
    user_updatedBy: one(users, {
      fields: [userOrganizations.updatedBy],
      references: [users.id],
      relationName: 'userOrganizations_updatedBy_users_id',
    }),
    user_userId: one(users, {
      fields: [userOrganizations.userId],
      references: [users.id],
      relationName: 'userOrganizations_userId_users_id',
    }),
  }),
);

export const appointmentsRelations = relations(
  appointments,
  ({ one, many }) => ({
    user_createdBy: one(users, {
      fields: [appointments.createdBy],
      references: [users.id],
      relationName: 'appointments_createdBy_users_id',
    }),
    user_deletedBy: one(users, {
      fields: [appointments.deletedBy],
      references: [users.id],
      relationName: 'appointments_deletedBy_users_id',
    }),
    healthProfessional: one(healthProfessionals, {
      fields: [appointments.healthProfessionalId],
      references: [healthProfessionals.id],
    }),
    organization: one(organizations, {
      fields: [appointments.organizationId],
      references: [organizations.id],
    }),
    patient: one(patients, {
      fields: [appointments.patientId],
      references: [patients.id],
    }),
    user_updatedBy: one(users, {
      fields: [appointments.updatedBy],
      references: [users.id],
      relationName: 'appointments_updatedBy_users_id',
    }),
    medicalRecords: many(medicalRecords),
  }),
);

export const patientsRelations = relations(patients, ({ one, many }) => ({
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
    relationName: 'patients_user_users_id',
  }),
  user_createdBy: one(users, {
    fields: [patients.createdBy],
    references: [users.id],
    relationName: 'patients_createdBy_users_id',
  }),
  user_deletedBy: one(users, {
    fields: [patients.deletedBy],
    references: [users.id],
    relationName: 'patients_deletedBy_users_id',
  }),
  organization: one(organizations, {
    fields: [patients.organizationId],
    references: [organizations.id],
  }),
  user_updatedBy: one(users, {
    fields: [patients.updatedBy],
    references: [users.id],
    relationName: 'patients_updatedBy_users_id',
  }),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id],
  }),
  user_createdBy: one(users, {
    fields: [medicalRecords.createdBy],
    references: [users.id],
    relationName: 'medicalRecords_createdBy_users_id',
  }),
  user_deletedBy: one(users, {
    fields: [medicalRecords.deletedBy],
    references: [users.id],
    relationName: 'medicalRecords_deletedBy_users_id',
  }),
  organization: one(organizations, {
    fields: [medicalRecords.organizationId],
    references: [organizations.id],
  }),
  patient: one(patients, {
    fields: [medicalRecords.patientId],
    references: [patients.id],
  }),
  user_updatedBy: one(users, {
    fields: [medicalRecords.updatedBy],
    references: [users.id],
    relationName: 'medicalRecords_updatedBy_users_id',
  }),
}));

export const healthProfessionalsRelations = relations(
  healthProfessionals,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [healthProfessionals.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [healthProfessionals.userId],
      references: [users.id],
      relationName: 'healthProfessionals_user_users_id',
    }),
    user_createdBy: one(users, {
      fields: [healthProfessionals.createdBy],
      references: [users.id],
      relationName: 'healthProfessionals_createdBy_users_id',
    }),
    user_updatedBy: one(users, {
      fields: [healthProfessionals.updatedBy],
      references: [users.id],
      relationName: 'healthProfessionals_updatedBy_users_id',
    }),
    user_deletedBy: one(users, {
      fields: [healthProfessionals.deletedBy],
      references: [users.id],
      relationName: 'healthProfessionals_deletedBy_users_id',
    }),
    appointments: many(appointments),
  }),
);

// Multi-country compliance relations
export const jurisdictionsRelations = relations(
  jurisdictions,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [jurisdictions.organizationId],
      references: [organizations.id],
    }),
    user_createdBy: one(users, {
      fields: [jurisdictions.createdBy],
      references: [users.id],
    }),
    user_updatedBy: one(users, {
      fields: [jurisdictions.updatedBy],
      references: [users.id],
    }),
    user_deletedBy: one(users, {
      fields: [jurisdictions.deletedBy],
      references: [users.id],
    }),
    taxRates: many(taxRates),
    sales: many(sales),
    adjustments: many(adjustments),
    fiscalDocuments: many(fiscalDocuments),
  }),
);

export const taxCategoriesRelations = relations(
  taxCategories,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [taxCategories.organizationId],
      references: [organizations.id],
    }),
    user_createdBy: one(users, {
      fields: [taxCategories.createdBy],
      references: [users.id],
    }),
    user_updatedBy: one(users, {
      fields: [taxCategories.updatedBy],
      references: [users.id],
    }),
    user_deletedBy: one(users, {
      fields: [taxCategories.deletedBy],
      references: [users.id],
    }),
    taxRates: many(taxRates),
  }),
);

export const taxRatesRelations = relations(taxRates, ({ one }) => ({
  jurisdiction: one(jurisdictions, {
    fields: [taxRates.jurisdictionId],
    references: [jurisdictions.id],
  }),
  taxCategory: one(taxCategories, {
    fields: [taxRates.taxCategoryId],
    references: [taxCategories.id],
  }),
  organization: one(organizations, {
    fields: [taxRates.organizationId],
    references: [organizations.id],
  }),
  user_createdBy: one(users, {
    fields: [taxRates.createdBy],
    references: [users.id],
  }),
  user_updatedBy: one(users, {
    fields: [taxRates.updatedBy],
    references: [users.id],
  }),
  user_deletedBy: one(users, {
    fields: [taxRates.deletedBy],
    references: [users.id],
  }),
}));

export const fiscalDocumentsRelations = relations(
  fiscalDocuments,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [fiscalDocuments.organizationId],
      references: [organizations.id],
    }),
    user_createdBy: one(users, {
      fields: [fiscalDocuments.createdBy],
      references: [users.id],
    }),
    user_updatedBy: one(users, {
      fields: [fiscalDocuments.updatedBy],
      references: [users.id],
    }),
  }),
);

// Inventory management relations
export const inventoryMovementsRelations = relations(
  inventoryMovements,
  ({ one }) => ({
    product: one(items, {
      fields: [inventoryMovements.productId],
      references: [items.id],
    }),
    relatedSale: one(sales, {
      fields: [inventoryMovements.relatedSaleId],
      references: [sales.id],
    }),
    organization: one(organizations, {
      fields: [inventoryMovements.organizationId],
      references: [organizations.id],
    }),
    user_createdBy: one(users, {
      fields: [inventoryMovements.createdBy],
      references: [users.id],
    }),
  }),
);

export const adjustmentsRelations = relations(adjustments, ({ one, many }) => ({
  sale: one(sales, {
    fields: [adjustments.saleId],
    references: [sales.id],
  }),
  organization: one(organizations, {
    fields: [adjustments.organizationId],
    references: [organizations.id],
  }),
  user_createdBy: one(users, {
    fields: [adjustments.createdBy],
    references: [users.id],
  }),
  user_updatedBy: one(users, {
    fields: [adjustments.updatedBy],
    references: [users.id],
  }),
  adjustmentItems: many(adjustmentItems),
}));

export const adjustmentItemsRelations = relations(
  adjustmentItems,
  ({ one }) => ({
    adjustment: one(adjustments, {
      fields: [adjustmentItems.adjustmentId],
      references: [adjustments.id],
    }),
    salesItem: one(saleItems, {
      fields: [adjustmentItems.salesItemId],
      references: [saleItems.id],
    }),
  }),
);

// Service and digital delivery relations
export const digitalDeliveriesRelations = relations(
  digitalDeliveries,
  ({ one }) => ({
    salesItem: one(saleItems, {
      fields: [digitalDeliveries.salesItemId],
      references: [saleItems.id],
    }),
    product: one(items, {
      fields: [digitalDeliveries.productId],
      references: [items.id],
    }),
    client: one(clients, {
      fields: [digitalDeliveries.clientId],
      references: [clients.id],
    }),
    user_deliveredBy: one(users, {
      fields: [digitalDeliveries.deliveredBy],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [digitalDeliveries.organizationId],
      references: [organizations.id],
    }),
  }),
);

export const serviceFulfillmentsRelations = relations(
  serviceFulfillments,
  ({ one }) => ({
    salesItem: one(saleItems, {
      fields: [serviceFulfillments.salesItemId],
      references: [saleItems.id],
    }),
    client: one(clients, {
      fields: [serviceFulfillments.clientId],
      references: [clients.id],
    }),
    provider: one(users, {
      fields: [serviceFulfillments.providerId],
      references: [users.id],
    }),
    organization: one(organizations, {
      fields: [serviceFulfillments.organizationId],
      references: [organizations.id],
    }),
  }),
);

// Accounting relations
export const journalEntriesRelations = relations(
  journalEntries,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [journalEntries.organizationId],
      references: [organizations.id],
    }),
    user_createdBy: one(users, {
      fields: [journalEntries.createdBy],
      references: [users.id],
    }),
    journalLines: many(journalLines),
  }),
);

export const journalLinesRelations = relations(journalLines, ({ one }) => ({
  journalEntry: one(journalEntries, {
    fields: [journalLines.journalEntryId],
    references: [journalEntries.id],
  }),
}));
