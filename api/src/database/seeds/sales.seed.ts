import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sales } from '@database/schemas/sales.schema';
import { saleItems } from '@database/schemas/sale-items.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { clients } from '@database/schemas/clients.schema';
import { items } from '@database/schemas/items.schema';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function seedSales() {
  console.log('🌱 Seeding sales...');

  // Get all organizations
  const allOrganizations = await db.select().from(organizations);
  if (allOrganizations.length === 0) {
    console.log('⚠️  No organizations found. Please seed organizations first.');
    return;
  }

  // Get admin users for each organization to use as createdBy
  const adminUsers = await db
    .select({
      id: users.id,
      email: users.email,
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

  // Get clients and items for each organization
  const allClients = await db.select().from(clients);
  const allItems = await db.select().from(items);

  const salesData = [
    // Acme Corporation sales
    {
      organizationId: allOrganizations[0].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[0].id,
      )?.id,
      totalAmount: '4500.00',
      status: 'completed',
      saleDate: '2024-01-15',
      isActive: true,
    },
    {
      organizationId: allOrganizations[0].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[0].id,
      )?.id,
      totalAmount: '3200.00',
      status: 'completed',
      saleDate: '2024-01-20',
      isActive: true,
    },

    // TechStart Inc sales
    {
      organizationId: allOrganizations[1].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[1].id,
      )?.id,
      totalAmount: '8500.00',
      status: 'completed',
      saleDate: '2024-01-10',
      isActive: true,
    },
    {
      organizationId: allOrganizations[1].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[1].id,
      )?.id,
      totalAmount: '1200.00',
      status: 'completed',
      saleDate: '2024-01-25',
      isActive: true,
    },

    // Global Solutions sales
    {
      organizationId: allOrganizations[2].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[2].id,
      )?.id,
      totalAmount: '25000.00',
      status: 'completed',
      saleDate: '2024-01-05',
      isActive: true,
    },
    {
      organizationId: allOrganizations[2].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[2].id,
      )?.id,
      totalAmount: '15000.00',
      status: 'completed',
      saleDate: '2024-01-18',
      isActive: true,
    },

    // Green Energy Co sales
    {
      organizationId: allOrganizations[3].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[3].id,
      )?.id,
      totalAmount: '35000.00',
      status: 'completed',
      saleDate: '2024-01-12',
      isActive: true,
    },
    {
      organizationId: allOrganizations[3].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[3].id,
      )?.id,
      totalAmount: '8000.00',
      status: 'completed',
      saleDate: '2024-01-22',
      isActive: true,
    },

    // Creative Design Studio sales
    {
      organizationId: allOrganizations[4].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[4].id,
      )?.id,
      totalAmount: '7500.00',
      status: 'completed',
      saleDate: '2024-01-08',
      isActive: true,
    },
    {
      organizationId: allOrganizations[4].id,
      clientId: allClients.find(
        (c) => c.organizationId === allOrganizations[4].id,
      )?.id,
      totalAmount: '3000.00',
      status: 'completed',
      saleDate: '2024-01-28',
      isActive: true,
    },
  ];

  for (const saleData of salesData) {
    try {
      // Find an admin user from the same organization to use as createdBy
      const adminUser =
        adminUsers.find(
          (user) => user.organizationId === saleData.organizationId,
        ) || adminUsers[0]; // Fallback to first admin if not found

      // Create the sale
      const [sale] = await db
        .insert(sales)
        .values({
          ...saleData,
          createdBy: adminUser?.id,
          updatedBy: adminUser?.id,
        })
        .returning();

      console.log(
        `✅ Created sale: $${sale.totalAmount} for organization ${saleData.organizationId}`,
      );

      // Create sale items
      const orgItems = allItems.filter(
        (item) => item.organizationId === saleData.organizationId,
      );

      // Add 1-3 items per sale
      const numItems = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numItems; i++) {
        if (orgItems.length > 0) {
          const item = orgItems[Math.floor(Math.random() * orgItems.length)];
          const quantity =
            item.type === 'product' ? Math.floor(Math.random() * 3) + 1 : 1;

          await db.insert(saleItems).values({
            saleId: sale.id,
            itemId: item.id,
            quantity: quantity,
            unitPrice: item.price,
            totalPrice: item.price,
          });
        }
      }

      console.log(`✅ Created ${numItems} sale items for sale ${sale.id}`);
    } catch (error) {
      console.log(`⚠️  Sale might already exist:`, error.message);
    }
  }

  console.log('✅ Sales seeding completed!');
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedSales().finally(() => client.end());
}
