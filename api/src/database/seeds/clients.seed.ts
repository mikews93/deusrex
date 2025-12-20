import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { clients } from '@database/schemas/clients.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';

// Database connection
const connectionString =
  process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
const client = postgres(connectionString);
const db = drizzle(client);

export async function seedClients() {
  console.log('🌱 Seeding clients...');

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

  const clientsData = [
    // Acme Corporation clients (Technology/Software)
    {
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      phone: '+1-555-0101',
      address: '100 Innovation Drive, Silicon Valley, CA',
      company: 'TechCorp Solutions Inc',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'DataFlow Systems',
      email: 'info@dataflow.com',
      phone: '+1-555-0102',
      address: '250 Data Street, Austin, TX',
      company: 'DataFlow Systems LLC',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },
    {
      name: 'CloudNet Enterprise',
      email: 'sales@cloudnet.com',
      phone: '+1-555-0103',
      address: '500 Cloud Avenue, Seattle, WA',
      company: 'CloudNet Enterprise',
      organizationId: allOrganizations[0].id,
      isActive: true,
    },

    // TechStart Inc clients (AI/ML)
    {
      name: 'AI Innovations Lab',
      email: 'hello@aiinnovations.com',
      phone: '+1-555-0201',
      address: '75 AI Boulevard, Boston, MA',
      company: 'AI Innovations Lab',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },
    {
      name: 'Machine Learning Pro',
      email: 'contact@mlpro.com',
      phone: '+1-555-0202',
      address: '300 ML Parkway, San Francisco, CA',
      company: 'Machine Learning Pro Inc',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },
    {
      name: 'Neural Networks Co',
      email: 'info@neuralnetworks.com',
      phone: '+1-555-0203',
      address: '150 Neural Road, Cambridge, MA',
      company: 'Neural Networks Co',
      organizationId: allOrganizations[1].id,
      isActive: true,
    },

    // Global Solutions clients (Consulting)
    {
      name: 'International Business Corp',
      email: 'contact@ibc.com',
      phone: '+1-555-0301',
      address: '1000 Global Plaza, New York, NY',
      company: 'International Business Corp',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },
    {
      name: 'Strategic Partners Ltd',
      email: 'info@strategicpartners.com',
      phone: '+1-555-0302',
      address: '750 Strategy Street, Chicago, IL',
      company: 'Strategic Partners Ltd',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },
    {
      name: 'Consulting Excellence',
      email: 'hello@consultingexcellence.com',
      phone: '+1-555-0303',
      address: '500 Excellence Drive, Los Angeles, CA',
      company: 'Consulting Excellence Inc',
      organizationId: allOrganizations[2].id,
      isActive: true,
    },

    // Green Energy Co clients (Sustainable Energy)
    {
      name: 'Solar Power Solutions',
      email: 'contact@solarpower.com',
      phone: '+1-555-0401',
      address: '200 Solar Street, Phoenix, AZ',
      company: 'Solar Power Solutions LLC',
      organizationId: allOrganizations[3].id,
      isActive: true,
    },
    {
      name: 'Wind Energy Corp',
      email: 'info@windenergy.com',
      phone: '+1-555-0402',
      address: '400 Wind Avenue, Denver, CO',
      company: 'Wind Energy Corp',
      organizationId: allOrganizations[3].id,
      isActive: true,
    },
    {
      name: 'EcoTech Industries',
      email: 'hello@ecotech.com',
      phone: '+1-555-0403',
      address: '600 Eco Drive, Portland, OR',
      company: 'EcoTech Industries Inc',
      organizationId: allOrganizations[3].id,
      isActive: true,
    },

    // Creative Design Studio clients (Design/Branding)
    {
      name: 'Brand Identity Pro',
      email: 'contact@brandidentity.com',
      phone: '+1-555-0501',
      address: '300 Brand Street, Miami, FL',
      company: 'Brand Identity Pro LLC',
      organizationId: allOrganizations[4].id,
      isActive: true,
    },
    {
      name: 'Design Masters Co',
      email: 'info@designmasters.com',
      phone: '+1-555-0502',
      address: '150 Design Avenue, Nashville, TN',
      company: 'Design Masters Co',
      organizationId: allOrganizations[4].id,
      isActive: true,
    },
    {
      name: 'Creative Solutions Inc',
      email: 'hello@creativesolutions.com',
      phone: '+1-555-0503',
      address: '450 Creative Drive, Atlanta, GA',
      company: 'Creative Solutions Inc',
      organizationId: allOrganizations[4].id,
      isActive: true,
    },
  ];

  for (const clientData of clientsData) {
    try {
      // Find an admin user from the same organization to use as createdBy
      const adminUser =
        adminUsers.find(
          (user) => user.organizationId === clientData.organizationId,
        ) || adminUsers[0]; // Fallback to first admin if not found

      await db.insert(clients).values({
        ...clientData,
        createdBy: adminUser?.id,
        updatedBy: adminUser?.id,
      });
      console.log(
        `✅ Created client: ${clientData.name} for organization ${clientData.organizationId}`,
      );
    } catch (error) {
      console.log(
        `⚠️  Client ${clientData.name} might already exist:`,
        error.message,
      );
    }
  }

  console.log('✅ Clients seeding completed!');
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedClients().finally(() => client.end());
}
