import { Module } from '@nestjs/common';
import { TrpcController } from './trpc.controller';
import { TrpcUiController } from './trpc-ui.controller';
import { OpenApiController } from './openapi.controller';
import { TrpcContextFactory } from '@/modules/trpc/context-factory';
import { TrpcAuthService } from '@/modules/trpc/auth.service';
import { DatabaseModule } from '@database/database.module';
import { UsersModule } from '@modules/users/users.module';
import { ClientsModule } from '@modules/clients/clients.module';
import { ItemsModule } from '@modules/items/items.module';
import { SalesModule } from '@modules/sales/sales.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { PatientsModule } from '@modules/patients/patients.module';
import { AppointmentsModule } from '@modules/appointments/appointments.module';
import { MedicalRecordsModule } from '@modules/medical-records/medical-records.module';
import { HealthProfessionalsModule } from '@modules/health-professionals/health-professionals.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    ClientsModule,
    ItemsModule,
    SalesModule,
    OrganizationsModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    HealthProfessionalsModule,
  ],
  controllers: [TrpcController, TrpcUiController, OpenApiController],
  providers: [TrpcContextFactory, TrpcAuthService],
})
export class TrpcModule {}
