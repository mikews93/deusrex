import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { taxCategories, organizations, users } from '@database/schemas';
import { eq } from 'drizzle-orm';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function seedTaxCategories() {
  console.log('📊 Seeding tax categories...');

  try {
    // Get the first organization
    const [organization] = await db.select().from(organizations).limit(1);

    if (!organization) {
      console.log('⚠️ No organization found, skipping tax categories seeding');
      return;
    }

    // Get the first user for this organization
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.organizationId, organization.id))
      .limit(1);

    if (!user) {
      console.log('⚠️ No user found, skipping tax categories seeding');
      return;
    }

    const colombiaTaxCategories = [
      // IVA (VAT) Categories according to DIAN
      {
        name: 'IVA Estándar',
        description: 'Impuesto al Valor Agregado - Tarifa Estándar',
        code: 'IVA_ESTANDAR',
        defaultRate: 0.19, // 19% - Standard VAT rate in Colombia
        isCompound: false,
        isInclusive: false,
        requiresExemption: false,
        metadata: {
          dianCode: '01',
          taxType: 'IVA',
          description: 'Impuesto al Valor Agregado',
          applicableGoods: 'Bienes y servicios generales',
          exemptionCode: null,
          legalBasis: 'Artículo 420 del Estatuto Tributario',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        name: 'IVA Reducido',
        description: 'Impuesto al Valor Agregado - Tarifa Reducida',
        code: 'IVA_REDUCIDO',
        defaultRate: 0.05, // 5% - Reduced VAT rate
        isCompound: false,
        isInclusive: false,
        requiresExemption: false,
        metadata: {
          dianCode: '02',
          taxType: 'IVA',
          description: 'Impuesto al Valor Agregado - Tarifa Reducida',
          applicableGoods:
            'Productos de la canasta familiar, medicamentos, libros',
          exemptionCode: null,
          legalBasis: 'Artículo 421 del Estatuto Tributario',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        name: 'IVA Exento',
        description: 'Impuesto al Valor Agregado - Exento',
        code: 'IVA_EXENTO',
        defaultRate: 0.0, // 0% - Exempt from VAT
        isCompound: false,
        isInclusive: false,
        requiresExemption: true,
        exemptionCode: 'EXENTO',
        metadata: {
          dianCode: '03',
          taxType: 'IVA',
          description: 'Impuesto al Valor Agregado - Exento',
          applicableGoods: 'Servicios de salud, educación, transporte público',
          exemptionCode: 'EXENTO',
          legalBasis: 'Artículo 424 del Estatuto Tributario',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        name: 'IVA Excluido',
        description: 'Impuesto al Valor Agregado - Excluido',
        code: 'IVA_EXCLUIDO',
        defaultRate: 0.0, // 0% - Excluded from VAT
        isCompound: false,
        isInclusive: false,
        requiresExemption: true,
        exemptionCode: 'EXCLUIDO',
        metadata: {
          dianCode: '04',
          taxType: 'IVA',
          description: 'Impuesto al Valor Agregado - Excluido',
          applicableGoods: 'Productos financieros, seguros, algunos servicios',
          exemptionCode: 'EXCLUIDO',
          legalBasis: 'Artículo 425 del Estatuto Tributario',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },

      // ICA (Impuesto de Industria y Comercio) Categories
      {
        name: 'ICA General',
        description: 'Impuesto de Industria y Comercio - Tarifa General',
        code: 'ICA_GENERAL',
        defaultRate: 0.01, // 1.0% - General ICA rate
        isCompound: false,
        isInclusive: false,
        requiresExemption: false,
        metadata: {
          dianCode: '05',
          taxType: 'ICA',
          description: 'Impuesto de Industria y Comercio',
          applicableGoods:
            'Actividades comerciales, industriales y de servicios',
          exemptionCode: null,
          legalBasis: 'Decreto 1333 de 1986',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        name: 'ICA Reducido',
        description: 'Impuesto de Industria y Comercio - Tarifa Reducida',
        code: 'ICA_REDUCIDO',
        defaultRate: 0.005, // 0.5% - Reduced ICA rate
        isCompound: false,
        isInclusive: false,
        requiresExemption: false,
        metadata: {
          dianCode: '06',
          taxType: 'ICA',
          description: 'Impuesto de Industria y Comercio - Tarifa Reducida',
          applicableGoods: 'Actividades de menor impacto económico',
          exemptionCode: null,
          legalBasis: 'Decreto 1333 de 1986',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        name: 'ICA Exento',
        description: 'Impuesto de Industria y Comercio - Exento',
        code: 'ICA_EXENTO',
        defaultRate: 0.0, // 0% - Exempt from ICA
        isCompound: false,
        isInclusive: false,
        requiresExemption: true,
        exemptionCode: 'EXENTO_ICA',
        metadata: {
          dianCode: '07',
          taxType: 'ICA',
          description: 'Impuesto de Industria y Comercio - Exento',
          applicableGoods: 'Actividades educativas, de salud, culturales',
          exemptionCode: 'EXENTO_ICA',
          legalBasis: 'Decreto 1333 de 1986',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },

      // Retención en la Fuente (Withholding Tax) Categories
      {
        name: 'Retención IVA',
        description: 'Retención en la Fuente - IVA',
        code: 'RET_IVA',
        defaultRate: 0.19, // 19% - VAT withholding
        isCompound: false,
        isInclusive: false,
        requiresExemption: false,
        metadata: {
          dianCode: '08',
          taxType: 'RETENCION',
          description: 'Retención en la Fuente - IVA',
          applicableGoods: 'Servicios gravados con IVA',
          exemptionCode: null,
          legalBasis: 'Artículo 437 del Estatuto Tributario',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        name: 'Retención ICA',
        description: 'Retención en la Fuente - ICA',
        code: 'RET_ICA',
        defaultRate: 0.01, // 1.0% - ICA withholding
        isCompound: false,
        isInclusive: false,
        requiresExemption: false,
        metadata: {
          dianCode: '09',
          taxType: 'RETENCION',
          description: 'Retención en la Fuente - ICA',
          applicableGoods: 'Servicios gravados con ICA',
          exemptionCode: null,
          legalBasis: 'Artículo 437 del Estatuto Tributario',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
      {
        name: 'Retención Renta',
        description: 'Retención en la Fuente - Renta',
        code: 'RET_RENTA',
        defaultRate: 0.035, // 3.5% - Income tax withholding
        isCompound: false,
        isInclusive: false,
        requiresExemption: false,
        metadata: {
          dianCode: '10',
          taxType: 'RETENCION',
          description: 'Retención en la Fuente - Renta',
          applicableGoods: 'Servicios profesionales y técnicos',
          exemptionCode: null,
          legalBasis: 'Artículo 437 del Estatuto Tributario',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },

      // CREE (Impuesto sobre la Renta para la Equidad) Categories
      {
        name: 'CREE',
        description: 'Impuesto sobre la Renta para la Equidad',
        code: 'CREE',
        defaultRate: 0.09, // 9% - CREE rate
        isCompound: false,
        isInclusive: false,
        requiresExemption: false,
        metadata: {
          dianCode: '11',
          taxType: 'CREE',
          description: 'Impuesto sobre la Renta para la Equidad',
          applicableGoods: 'Empresas con ingresos superiores a 800 UVT',
          exemptionCode: null,
          legalBasis: 'Ley 1607 de 2012',
        },
        organizationId: organization.id,
        createdBy: user.id,
      },
    ];

    for (const taxCategory of colombiaTaxCategories) {
      try {
        await db
          .insert(taxCategories)
          .values(taxCategory)
          .onConflictDoNothing();
        console.log(`✓ Created tax category: ${taxCategory.name}`);
      } catch (error) {
        console.error(
          `✗ Failed to create tax category ${taxCategory.name}:`,
          error,
        );
      }
    }

    console.log('✅ Tax categories seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding tax categories:', error);
    throw error;
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedTaxCategories().finally(() => client.end());
}
