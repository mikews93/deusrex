import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3501', 10),
  environment: process.env.NODE_ENV || 'development',
  swaggerTheme: process.env.SWAGGER_THEME || 'light',
}));
