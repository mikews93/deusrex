import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ConfigService } from '@nestjs/config';
import * as schema from './schema';

// Create the connection with schema
export const createDatabaseConnection = (configService: ConfigService) => {
  const connectionString = configService.get('database.url');
  const enableDrizzleDebug = configService.get('database.debug', false);

  const client = postgres(connectionString);

  // Configure Drizzle with optional debugging
  const drizzleConfig: any = { schema };

  if (enableDrizzleDebug) {
    drizzleConfig.logger = true;
    console.log('🔍 Drizzle query debugging enabled');
  }

  return drizzle(client, drizzleConfig);
};

// For backward compatibility
const client = postgres(process.env.DATABASE_URL!);
const enableDrizzleDebug = process.env.DRIZZLE_DEBUG === 'true';

const drizzleConfig: any = { schema };
if (enableDrizzleDebug) {
  drizzleConfig.logger = true;
  console.log('🔍 Drizzle query debugging enabled (backward compatibility)');
}

export const db = drizzle(client, drizzleConfig);
export { client };
