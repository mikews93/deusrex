import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { items } from '@database/schemas/items.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function seedItems() {
  console.log('🌱 Seeding items...');

  // Get all organizations
  const allOrganizations = await db.select().from(organizations);
  if (allOrganizations.length === 0) {
    console.log('⚠️  No organizations found. Please seed organizations first.');
    return;
  }

  // Get admin users for each organization
  const adminUsers = await db
    .select({
      id: users.id,
      organizationId: userOrganizations.organizationId,
    })
    .from(users)
    .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
    .where(
      and(
        eq(users.type, 'regular'),
        eq(userOrganizations.role, 'admin'),
        eq(userOrganizations.isActive, true),
      ),
    );

  const itemsData = [
    // Acme Corporation products (Technology/Software)
    {
      name: 'Enterprise CRM Suite',
      description: 'Comprehensive customer relationship management software',
      sku: 'ACME-CRM-001',
      price: '2999.99',
      cost: '1500.00',
      type: 'product' as const,
      stock: '10',
      category: 'Software',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'Cloud Storage Solution',
      description: 'Secure cloud storage with enterprise-grade encryption',
      sku: 'ACME-CLOUD-002',
      price: '199.99',
      cost: '50.00',
      type: 'product' as const,
      stock: '100',
      category: 'Cloud Services',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'API Gateway Pro',
      description: 'High-performance API management and gateway solution',
      sku: 'ACME-API-003',
      price: '1499.99',
      cost: '750.00',
      type: 'product' as const,
      stock: '25',
      category: 'Software',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'AI Model Training Platform',
      description:
        'Advanced machine learning model training and deployment platform',
      sku: 'ACME-AI-004',
      price: '4999.99',
      cost: '2500.00',
      type: 'product' as const,
      stock: '5',
      category: 'AI/ML',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'Neural Network Library',
      description: 'Comprehensive neural network library for deep learning',
      sku: 'ACME-NN-005',
      price: '799.99',
      cost: '400.00',
      type: 'product' as const,
      stock: '50',
      category: 'AI/ML',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'Computer Vision API',
      description: 'Real-time computer vision and image recognition API',
      sku: 'ACME-CV-006',
      price: '299.99',
      cost: '150.00',
      type: 'product' as const,
      stock: '100',
      category: 'AI/ML',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },

    // Acme Corporation services (Consulting)
    {
      name: 'Business Strategy Package',
      description: 'Comprehensive business strategy consulting package',
      sku: 'ACME-STRAT-001',
      price: '5000.00',
      cost: '2500.00',
      type: 'service' as const,
      duration: 40,
      category: 'Consulting',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'Process Optimization Service',
      description: 'Business process optimization and efficiency consulting',
      sku: 'ACME-PROC-002',
      price: '3000.00',
      cost: '1500.00',
      type: 'service' as const,
      duration: 20,
      category: 'Consulting',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'Digital Transformation Guide',
      description: 'Complete digital transformation roadmap and implementation',
      sku: 'ACME-DIGI-003',
      price: '8000.00',
      cost: '4000.00',
      type: 'service' as const,
      duration: 60,
      category: 'Consulting',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },

    // GreenTech Solutions products (Renewable Energy)
    {
      name: 'Solar Panel System',
      description: 'Complete residential solar panel installation system',
      sku: 'GREEN-SOLAR-001',
      price: '15000.00',
      cost: '8000.00',
      type: 'product' as const,
      stock: '20',
      category: 'Solar Energy',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },
    {
      name: 'Wind Turbine Kit',
      description: 'Small-scale wind turbine for residential use',
      sku: 'GREEN-WIND-002',
      price: '8000.00',
      cost: '4000.00',
      type: 'product' as const,
      stock: '15',
      category: 'Wind Energy',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },
    {
      name: 'Energy Storage Battery',
      description: 'High-capacity lithium-ion battery for energy storage',
      sku: 'GREEN-BATT-003',
      price: '5000.00',
      cost: '2500.00',
      type: 'product' as const,
      stock: '30',
      category: 'Energy Storage',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },

    // Creative Studio services (Design)
    {
      name: 'Brand Identity Package',
      description:
        'Complete brand identity design including logo, colors, and guidelines',
      sku: 'CREATIVE-BRAND-001',
      price: '2500.00',
      cost: '1250.00',
      type: 'service' as const,
      duration: 15,
      category: 'Branding',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },
    {
      name: 'Website Design Service',
      description: 'Custom website design and development service',
      sku: 'CREATIVE-WEB-002',
      price: '4000.00',
      cost: '2000.00',
      type: 'service' as const,
      duration: 30,
      category: 'Web Design',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },
    {
      name: 'Marketing Materials Kit',
      description: 'Complete marketing materials design package',
      sku: 'CREATIVE-MARK-003',
      price: '1500.00',
      cost: '750.00',
      type: 'service' as const,
      duration: 10,
      category: 'Marketing',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },
  ];

  try {
    // Insert items
    for (const itemData of itemsData) {
      const adminUser = adminUsers.find(
        (user) => user.organizationId === itemData.organizationId,
      );

      if (adminUser) {
        await db.insert(items).values({
          ...itemData,
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        });
      }
    }

    console.log(`✅ Successfully seeded ${itemsData.length} items`);
  } catch (error) {
    console.error('❌ Error seeding items:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedItems()
    .then(() => {
      console.log('Items seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Items seeding failed:', error);
      process.exit(1);
    });
}
