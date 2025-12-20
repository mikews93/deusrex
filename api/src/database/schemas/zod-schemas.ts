import { createSelectSchema, createInsertSchema } from 'drizzle-zod';
import { patients } from './patients.schema';
import { users } from './users.schema';
import { organizations } from './organizations.schema';
import { userOrganizations } from './user-organizations.schema';
import { appointments } from './appointments.schema';
import { medicalRecords } from './medical-records.schema';
import { clients } from './clients.schema';
import { items } from './items.schema';
import { sales } from './sales.schema';
import { saleItems } from './sale-items.schema';
import { healthProfessionals } from './health-professionals.schema';
// Multi-country compliance schemas
import { jurisdictions } from './jurisdictions.schema';
import { taxCategories } from './tax-categories.schema';
import { taxRates } from './tax-rates.schema';
import { fiscalDocuments } from './fiscal-documents.schema';
// Inventory management schemas
import { inventoryMovements } from './inventory-movements.schema';
import { adjustments } from './adjustments.schema';
import { adjustmentItems } from './adjustment-items.schema';
// Service and digital delivery schemas
import { digitalDeliveries } from './digital-deliveries.schema';
import { serviceFulfillments } from './service-fulfillments.schema';
// Accounting schemas
import { journalEntries } from './journal-entries.schema';
import { journalLines } from './journal-lines.schema';
import z from 'zod';

// Patient schemas
export const patientSelectSchema = createSelectSchema(patients);
export const patientInsertSchema = createInsertSchema(patients);

// User schemas
export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);

// Organization schemas
export const organizationSelectSchema = createSelectSchema(organizations);
export const organizationInsertSchema = createInsertSchema(organizations);

// User Organization schemas
export const userOrganizationSelectSchema =
  createSelectSchema(userOrganizations);
export const userOrganizationInsertSchema =
  createInsertSchema(userOrganizations);

// Appointment schemas
export const appointmentSelectSchema = createSelectSchema(appointments);
export const appointmentInsertSchema = createInsertSchema(appointments, {
  appointmentDate: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});

// Medical Record schemas
export const medicalRecordSelectSchema = createSelectSchema(medicalRecords);
export const medicalRecordInsertSchema = createInsertSchema(medicalRecords);

// Client schemas
export const clientSelectSchema = createSelectSchema(clients);
export const clientInsertSchema = createInsertSchema(clients);

// Item schemas
export const itemSelectSchema = createSelectSchema(items);
export const itemInsertSchema = createInsertSchema(items, {
  organizationId: z.string().optional(),
});

// Sale schemas
export const saleSelectSchema = createSelectSchema(sales);
export const saleInsertSchema = createInsertSchema(sales);

// Sale Item schemas
export const saleItemSelectSchema = createSelectSchema(saleItems);
export const saleItemInsertSchema = createInsertSchema(saleItems);

// Health Professional schemas
export const healthProfessionalSelectSchema =
  createSelectSchema(healthProfessionals);
export const healthProfessionalInsertSchema =
  createInsertSchema(healthProfessionals);

// Multi-country compliance schemas
export const jurisdictionSelectSchema = createSelectSchema(jurisdictions);
export const jurisdictionInsertSchema = createInsertSchema(jurisdictions);

export const taxCategorySelectSchema = createSelectSchema(taxCategories);
export const taxCategoryInsertSchema = createInsertSchema(taxCategories);

export const taxRateSelectSchema = createSelectSchema(taxRates);
export const taxRateInsertSchema = createInsertSchema(taxRates);

export const fiscalDocumentSelectSchema = createSelectSchema(fiscalDocuments);
export const fiscalDocumentInsertSchema = createInsertSchema(fiscalDocuments);

// Inventory management schemas
export const inventoryMovementSelectSchema =
  createSelectSchema(inventoryMovements);
export const inventoryMovementInsertSchema =
  createInsertSchema(inventoryMovements);

export const adjustmentSelectSchema = createSelectSchema(adjustments);
export const adjustmentInsertSchema = createInsertSchema(adjustments);

export const adjustmentItemSelectSchema = createSelectSchema(adjustmentItems);
export const adjustmentItemInsertSchema = createInsertSchema(adjustmentItems);

// Service and digital delivery schemas
export const digitalDeliverySelectSchema =
  createSelectSchema(digitalDeliveries);
export const digitalDeliveryInsertSchema =
  createInsertSchema(digitalDeliveries);

export const serviceFulfillmentSelectSchema =
  createSelectSchema(serviceFulfillments);
export const serviceFulfillmentInsertSchema =
  createInsertSchema(serviceFulfillments);

// Accounting schemas
export const journalEntrySelectSchema = createSelectSchema(journalEntries);
export const journalEntryInsertSchema = createInsertSchema(journalEntries);

export const journalLineSelectSchema = createSelectSchema(journalLines);
export const journalLineInsertSchema = createInsertSchema(journalLines);

// Enhanced validation schemas for multi-country compliance
export const saleCreateSchema = saleInsertSchema.extend({
  saleItems: z.array(saleItemInsertSchema.omit({ saleId: true })),
  jurisdictionId: z.string().min(1, 'Jurisdiction is required'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
});

export const saleUpdateSchema = saleCreateSchema
  .partial()
  .omit({ saleItems: true });

export const clientCreateSchema = clientInsertSchema.extend({
  taxId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const itemCreateSchema = itemInsertSchema.extend({
  currency: z.string().length(3, 'Currency must be 3 characters').optional(),
  productType: z.enum(['physical', 'digital', 'service', 'misc']),
  isStockTracked: z.boolean().optional(),
  stock: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});
