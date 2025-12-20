import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { jurisdictions, organizations, users } from '@database/schemas';
import { eq } from 'drizzle-orm';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function seedJurisdictions() {
  console.log('🏛️ Seeding jurisdictions...');

  try {
    // Get the first organization
    const [organization] = await db.select().from(organizations).limit(1);

    if (!organization) {
      console.log('⚠️ No organization found, skipping jurisdictions seeding');
      return;
    }

    // Get the first user for this organization
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.organizationId, organization.id))
      .limit(1);

    if (!user) {
      console.log('⚠️ No user found, skipping jurisdictions seeding');
      return;
    }

    const colombiaJurisdictions = [
      // Main Colombia jurisdiction
      {
        id: 'CO',
        name: 'Colombia',
        country: 'CO',
        region: null,
        currency: 'COP',
        taxSystem: 'VAT',
        requiresTaxId: true,
        requiresFiscalDocument: true,
        fiscalDocumentPrefix: 'FAC',
        metadata: {
          dianCode: 'CO',
          taxAuthority: 'DIAN',
          fiscalRegime: 'Responsable de IVA',
          electronicInvoicing: true,
          invoiceNumbering: 'Consecutivo',
          retentionAgent: true,
          icaAgent: true,
          creeAgent: true,
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      // Major cities and departments
      {
        id: 'CO-BOG',
        name: 'Bogotá D.C.',
        country: 'CO',
        region: 'Cundinamarca',
        currency: 'COP',
        taxSystem: 'VAT',
        requiresTaxId: true,
        requiresFiscalDocument: true,
        fiscalDocumentPrefix: 'FAC',
        metadata: {
          dianCode: 'CO-BOG',
          taxAuthority: 'DIAN',
          fiscalRegime: 'Responsable de IVA',
          electronicInvoicing: true,
          icaRate: 0.009, // 0.9% ICA for Bogotá
          retentionAgent: true,
          icaAgent: true,
          creeAgent: true,
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        id: 'CO-ANT',
        name: 'Antioquia',
        country: 'CO',
        region: 'Antioquia',
        currency: 'COP',
        taxSystem: 'VAT',
        requiresTaxId: true,
        requiresFiscalDocument: true,
        fiscalDocumentPrefix: 'FAC',
        metadata: {
          dianCode: 'CO-ANT',
          taxAuthority: 'DIAN',
          fiscalRegime: 'Responsable de IVA',
          electronicInvoicing: true,
          icaRate: 0.01, // 1.0% ICA for Antioquia
          retentionAgent: true,
          icaAgent: true,
          creeAgent: true,
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        id: 'CO-VAL',
        name: 'Valle del Cauca',
        country: 'CO',
        region: 'Valle del Cauca',
        currency: 'COP',
        taxSystem: 'VAT',
        requiresTaxId: true,
        requiresFiscalDocument: true,
        fiscalDocumentPrefix: 'FAC',
        metadata: {
          dianCode: 'CO-VAL',
          taxAuthority: 'DIAN',
          fiscalRegime: 'Responsable de IVA',
          electronicInvoicing: true,
          icaRate: 0.01, // 1.0% ICA for Valle del Cauca
          retentionAgent: true,
          icaAgent: true,
          creeAgent: true,
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        id: 'CO-ATL',
        name: 'Atlántico',
        country: 'CO',
        region: 'Atlántico',
        currency: 'COP',
        taxSystem: 'VAT',
        requiresTaxId: true,
        requiresFiscalDocument: true,
        fiscalDocumentPrefix: 'FAC',
        metadata: {
          dianCode: 'CO-ATL',
          taxAuthority: 'DIAN',
          fiscalRegime: 'Responsable de IVA',
          electronicInvoicing: true,
          icaRate: 0.01, // 1.0% ICA for Atlántico
          retentionAgent: true,
          icaAgent: true,
          creeAgent: true,
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
    ];

    for (const jurisdiction of colombiaJurisdictions) {
      try {
        await db
          .insert(jurisdictions)
          .values(jurisdiction)
          .onConflictDoNothing();
        console.log(`✓ Created jurisdiction: ${jurisdiction.name}`);
      } catch (error) {
        console.error(
          `✗ Failed to create jurisdiction ${jurisdiction.name}:`,
          error,
        );
      }
    }

    console.log('✅ Jurisdictions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding jurisdictions:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedJurisdictions().finally(() => client.end());
}
