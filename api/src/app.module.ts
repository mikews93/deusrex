import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';

import { UsersModule } from './modules/users/users.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ItemsModule } from './modules/items/items.module';
import { SalesModule } from './modules/sales/sales.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { PatientsModule } from './modules/patients/patients.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MedicalRecordsModule } from './modules/medical-records/medical-records.module';
import { AuthModule } from './modules/auth/auth.module';
import { TrpcModule } from './modules/trpc/trpc.module';
// Multi-country compliance modules
import { JurisdictionsModule } from './modules/jurisdictions/jurisdictions.module';
import { TaxCategoriesModule } from './modules/tax-categories/tax-categories.module';
import { FiscalDocumentsModule } from './modules/fiscal-documents/fiscal-documents.module';
import { OrganizationMiddleware } from './common/middleware/organization.middleware';
import { LoggingService } from './common/services/logging.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    DatabaseModule,

    AuthModule,
    TrpcModule,
    UsersModule,
    ClientsModule,
    ItemsModule,
    SalesModule,
    OrganizationsModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    // Multi-country compliance modules
    JurisdictionsModule,
    TaxCategoriesModule,
    FiscalDocumentsModule,
  ],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(OrganizationMiddleware)
      .forRoutes(
        'clients',
        'items',
        'sales',
        'users',
        'patients',
        'appointments',
        'medical-records',
        'jurisdictions',
        'tax-categories',
        'fiscal-documents',
      );
  }
}
