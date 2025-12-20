import { generateOpenApiDocument } from 'trpc-to-openapi';
import { appRouter } from './app.router';

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'DeusRex API',
  version: '1.0.0',
  baseUrl: 'http://localhost:3501',
  description: 'DeusRex Medical Practice Management API - tRPC to OpenAPI',
  docsUrl: 'https://github.com/your-org/deusrex',
  tags: [
    'auth',
    'patients',
    'medical-records',
    'appointments',
    'products',
    'services',
    'clients',
    'sales',
    'users',
    'organizations',
  ],
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
});
