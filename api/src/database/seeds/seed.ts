import { seedOrganizations } from './organizations.seed';
import { seedUsers } from './users.seed';
import { seedClients } from './clients.seed';
import { seedItems } from './items.seed';
import { seedSales } from './sales.seed';
import { seedPatients } from './patients.seed';
import { seedHealthProfessionals } from './health-professionals.seed';
import { seedAppointments } from './appointments.seed';
import { seedMedicalRecords } from './medical-records.seed';
import { createUserOrganizations } from './create-user-orgs.seed';
// Multi-country compliance seeds
import { seedJurisdictions } from './jurisdictions.seed';
import { seedTaxCategories } from './tax-categories.seed';
import { seedTaxRates } from './tax-rates.seed';

export async function seedDatabase() {
  console.log('🚀 Starting database seeding...');

  try {
    // Seed organizations first since other entities depend on them
    await seedOrganizations();
    await seedUsers();
    await createUserOrganizations();
    await seedClients();
    await seedItems();
    await seedSales();

    // Multi-country compliance seeds (Colombia tax system)
    await seedJurisdictions();
    await seedTaxCategories();
    await seedTaxRates();

    // Healthcare seeds
    await seedPatients();
    await seedHealthProfessionals();
    await seedAppointments();
    await seedMedicalRecords();

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}
