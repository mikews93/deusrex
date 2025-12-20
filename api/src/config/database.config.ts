import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
  debug: process.env.DRIZZLE_DEBUG === 'true',
}));
