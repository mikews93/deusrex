import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { reset } from 'drizzle-seed';
import * as schema from './schema';
import { seedDatabase } from './seeds/seed';

async function main() {
  console.log('🔄 Starting database reset...');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const shouldSeed = !args.includes('--no-seed');

  if (!shouldSeed) {
    console.log('⚠️  Seeding will be skipped (--no-seed flag provided)');
  }

  const connectionString =
    process.env.DATABASE_URL || 'postgresql://localhost:5432/deusrex';
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Reset the database schema
    console.log('🗑️  Resetting database schema...');
    await reset(db, schema);

    // Seed the database with sample data (if enabled)
    if (shouldSeed) {
      console.log('🌱 Seeding database...');
      await seedDatabase();
      console.log('✅ Database reset and seeding completed successfully!');
    } else {
      console.log(
        '✅ Database reset completed successfully! (seeding skipped)',
      );
    }
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the reset function if this file is executed directly
if (require.main === module) {
  main();
}
