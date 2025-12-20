import { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { PatientsService } from '@modules/patients/patients.service';
import { ClientsService } from '@modules/clients/clients.service';
import { ItemsService } from '@modules/items/items.service';
import { SalesService } from '@modules/sales/sales.service';
import { AppointmentsService } from '@modules/appointments/appointments.service';
import { MedicalRecordsService } from '@modules/medical-records/medical-records.service';
import { OrganizationsService } from '@modules/organizations/organizations.service';
import { UsersService } from '@modules/users/users.service';
import { HealthProfessionalsService } from '@modules/health-professionals/health-professionals.service';
export interface Context {
  user?: {
    id: string;
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    imageUrl: string;
    type: string;
    organizationId: string;
    role: string;
  };
  db: PostgresJsDatabase<typeof import('../../database/schema')>;
  services: {
    patientsService: PatientsService;
    clientsService: ClientsService;
    itemsService: ItemsService;
    salesService: SalesService;
    appointmentsService: AppointmentsService;
    medicalRecordsService: MedicalRecordsService;
    organizationsService: OrganizationsService;
    usersService: UsersService;
    healthProfessionalsService: HealthProfessionalsService;
  };
}

// This function is now a simple wrapper that delegates to the factory
export async function createContext(
  opts: CreateHTTPContextOptions,
  contextFactory: any,
): Promise<Context> {
  return contextFactory.createContext(opts);
}
