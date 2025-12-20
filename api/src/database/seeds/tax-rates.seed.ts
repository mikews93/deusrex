import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  taxRates,
  taxCategories,
  jurisdictions,
  organizations,
  users,
} from '@database/schemas';
import { eq } from 'drizzle-orm';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function seedTaxRates() {
  console.log('💰 Seeding tax rates...');

  try {
    // Get the first organization
    const [organization] = await db.select().from(organizations).limit(1);

    if (!organization) {
      console.log('⚠️ No organization found, skipping tax rates seeding');
      return;
    }

    // Get the first user for this organization
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.organizationId, organization.id))
      .limit(1);

    if (!user) {
      console.log('⚠️ No user found, skipping tax rates seeding');
      return;
    }

    // Get all jurisdictions and tax categories for this organization
    const allJurisdictions = await db
      .select()
      .from(jurisdictions)
      .where(eq(jurisdictions.organizationId, organization.id));

    const allTaxCategories = await db
      .select()
      .from(taxCategories)
      .where(eq(taxCategories.organizationId, organization.id));

    if (allJurisdictions.length === 0 || allTaxCategories.length === 0) {
      console.log(
        '⚠️ No jurisdictions or tax categories found, skipping tax rates seeding',
      );
      return;
    }

    const taxRatesData = [];

    // Create tax rates for each jurisdiction and tax category combination
    for (const jurisdiction of allJurisdictions) {
      for (const taxCategory of allTaxCategories) {
        let rate = taxCategory.defaultRate;
        let effectiveFrom = new Date('2024-01-01');
        let effectiveTo = null; // Current rate, no end date

        // Adjust rates based on jurisdiction and tax category
        if (taxCategory.code === 'ICA_GENERAL') {
          // ICA rates vary by jurisdiction
          if (jurisdiction.id === 'CO-BOG') {
            rate = 0.009; // 0.9% for Bogotá
          } else if (jurisdiction.id === 'CO-ANT') {
            rate = 0.01; // 1.0% for Antioquia
          } else if (jurisdiction.id === 'CO-VAL') {
            rate = 0.01; // 1.0% for Valle del Cauca
          } else if (jurisdiction.id === 'CO-ATL') {
            rate = 0.01; // 1.0% for Atlántico
          } else {
            rate = 0.01; // 1.0% default for other jurisdictions
          }
        } else if (taxCategory.code === 'ICA_REDUCIDO') {
          // Reduced ICA rate
          rate = 0.005; // 0.5%
        } else if (taxCategory.code === 'RET_ICA') {
          // ICA withholding rate
          rate = 0.01; // 1.0%
        } else if (taxCategory.code === 'RET_IVA') {
          // VAT withholding rate
          rate = 0.19; // 19%
        } else if (taxCategory.code === 'RET_RENTA') {
          // Income tax withholding rate
          rate = 0.035; // 3.5%
        } else if (taxCategory.code === 'CREE') {
          // CREE rate
          rate = 0.09; // 9%
        }

        // Set minimum and maximum amounts for certain taxes
        let minimumAmount = null;
        let maximumAmount = null;

        if (taxCategory.code === 'CREE') {
          // CREE applies to companies with income above 800 UVT
          minimumAmount = 800 * 42500; // 800 UVT * 42,500 COP (approximate UVT value)
        } else if (taxCategory.code === 'RET_RENTA') {
          // Income tax withholding applies to payments above certain thresholds
          minimumAmount = 1000000; // 1,000,000 COP
        }

        const taxRate = {
          jurisdictionId: jurisdiction.id,
          taxCategoryId: taxCategory.id,
          rate: rate,
          effectiveFrom: effectiveFrom.toISOString().split('T')[0],
          effectiveTo: effectiveTo,
          minimumAmount: minimumAmount ? minimumAmount.toString() : null,
          maximumAmount: maximumAmount ? maximumAmount.toString() : null,
          metadata: {
            jurisdictionName: jurisdiction.name,
            taxCategoryName: taxCategory.name,
            taxCategoryCode: taxCategory.code,
            dianCompliant: true,
            lastUpdated: new Date().toISOString(),
            legalBasis:
              taxCategory.metadata?.legalBasis || 'Estatuto Tributario',
          },
          organizationId: organization.id,
          createdBy: user.id,
        };

        taxRatesData.push(taxRate);
      }
    }

    // Insert all tax rates
    for (const taxRate of taxRatesData) {
      try {
        await db.insert(taxRates).values(taxRate).onConflictDoNothing();
        console.log(
          `✓ Created tax rate: ${taxRate.metadata.jurisdictionName} - ${taxRate.metadata.taxCategoryName} (${(taxRate.rate * 100).toFixed(1)}%)`,
        );
      } catch (error) {
        console.error(`✗ Failed to create tax rate:`, error);
      }
    }

    console.log('✅ Tax rates seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding tax rates:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedTaxRates().finally(() => client.end());
}
