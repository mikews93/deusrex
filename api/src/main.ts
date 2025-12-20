import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors';
import { LoggingService } from './common/services/logging.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { openApiDocument } from './modules/trpc/openapi-document';

// Load environment variables from .env files
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable logging interceptor globally
  const loggingService = app.get(LoggingService);
  app.useGlobalInterceptors(new LoggingInterceptor(loggingService));

  // Enable global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(loggingService));

  // Setup Swagger with OpenAPI document
  SwaggerModule.setup('v1/docs', app, openApiDocument as any, {
    customSiteTitle: 'DeusRex API Documentation',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
  });

  // Add endpoint to serve OpenAPI specification
  app.use('/v1/api-spec', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );
    res.send(openApiDocument);
  });

  // Add health check endpoint
  app.use('/health', (req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'DeusRex API',
      version: '1.0.0',
    });
  });

  const port = configService.get('PORT') || 3501;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/v1/docs`);
}
bootstrap();
