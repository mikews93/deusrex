import { Injectable, Logger } from '@nestjs/common';
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
import { Context } from './context';
import { TrpcAuthService } from './auth.service';

@Injectable()
export class TrpcContextFactory {
  private readonly logger = new Logger(TrpcContextFactory.name);

  constructor(
    private readonly patientsService: PatientsService,
    private readonly clientsService: ClientsService,
    private readonly itemsService: ItemsService,
    private readonly salesService: SalesService,
    private readonly appointmentsService: AppointmentsService,
    private readonly medicalRecordsService: MedicalRecordsService,
    private readonly organizationsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly healthProfessionalsService: HealthProfessionalsService,
    private readonly authService: TrpcAuthService,
  ) {}

  async createContext(opts: CreateHTTPContextOptions): Promise<Context> {
    const { req } = opts;

    // Get database from request
    const db = (req as any).db || null;

    if (!db) {
      this.logger.error('Database not found in request context');
      return this.createUnauthenticatedContext(db);
    }

    // Authenticate the request using the auth service
    const user = await this.authService.authenticateRequest(req, db);

    if (user) {
      return {
        user,
        db,
        services: {
          patientsService: this.patientsService,
          clientsService: this.clientsService,
          itemsService: this.itemsService,
          salesService: this.salesService,
          appointmentsService: this.appointmentsService,
          medicalRecordsService: this.medicalRecordsService,
          organizationsService: this.organizationsService,
          usersService: this.usersService,
          healthProfessionalsService: this.healthProfessionalsService,
        },
      };
    }

    // If no user data, return unauthenticated context
    return this.createUnauthenticatedContext(db);
  }

  private createUnauthenticatedContext(db: PostgresJsDatabase<any>): Context {
    return {
      db,
      services: {
        patientsService: this.patientsService,
        clientsService: this.clientsService,
        itemsService: this.itemsService,
        salesService: this.salesService,
        appointmentsService: this.appointmentsService,
        medicalRecordsService: this.medicalRecordsService,
        organizationsService: this.organizationsService,
        usersService: this.usersService,
        healthProfessionalsService: this.healthProfessionalsService,
      },
    };
  }
}
