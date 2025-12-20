import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { appointments } from '@database/schemas/appointments.schema';
import { BaseService } from '@common/services/base.service';
import { eq, and, gte, lte, isNull, like, SQL } from 'drizzle-orm';
import { Appointment } from '@/database/types';
import { appointmentStatusEnum } from '@/database/schemas/enums';
import { AppointmentFilter } from '@common/schemas/filter.schema';

@Injectable()
export class AppointmentsService extends BaseService<Appointment> {
  constructor(databaseService: DatabaseService) {
    super(databaseService, appointments);
  }

  protected buildWhereConditions(
    organizationId?: string,
    includeDeleted: boolean = false,
    filters?: AppointmentFilter,
  ) {
    const conditions: SQL[] = [];

    if (organizationId) {
      conditions.push(eq(appointments.organizationId, organizationId));
    }

    // Filter out deleted records unless explicitly requested
    if (!includeDeleted && appointments.deletedAt) {
      conditions.push(isNull(appointments.deletedAt));
    }

    // Apply filters if provided
    if (filters) {
      // Apply search filter if provided (simplified for now)
      if (filters.search) {
        // For now, just search in description field
        conditions.push(like(appointments.description, `%${filters.search}%`));
      }

      // Apply appointment-specific date range filters
      if (filters.appointmentDateFrom) {
        conditions.push(
          gte(
            appointments.appointmentDate,
            new Date(filters.appointmentDateFrom),
          ),
        );
      }
      if (filters.appointmentDateTo) {
        conditions.push(
          lte(
            appointments.appointmentDate,
            new Date(filters.appointmentDateTo),
          ),
        );
      }

      // Apply appointment-specific filters
      if (filters.status) {
        conditions.push(eq(appointments.status, filters.status as any));
      }
      if (filters.appointmentType) {
        conditions.push(
          eq(appointments.appointmentType, filters.appointmentType as any),
        );
      }
      if (filters.priority) {
        conditions.push(eq(appointments.priority, filters.priority as any));
      }
      if (filters.patientId) {
        conditions.push(eq(appointments.patientId, filters.patientId));
      }
      if (filters.healthProfessionalId) {
        conditions.push(
          eq(appointments.healthProfessionalId, filters.healthProfessionalId),
        );
      }
      if (filters.roomNumber) {
        conditions.push(eq(appointments.roomNumber, filters.roomNumber));
      }
      if (filters.location) {
        conditions.push(eq(appointments.location, filters.location));
      }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  async findByPatient(
    patientId: string,
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(appointments.organizationId, organizationId),
      eq(appointments.patientId, patientId),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(appointments.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(appointments.appointmentDate);

    return results as any[];
  }

  async findByHealthProfessional(
    healthProfessionalId: string,
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(appointments.organizationId, organizationId),
      eq(appointments.healthProfessionalId, healthProfessionalId),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(appointments.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(appointments.appointmentDate);

    return results as any[];
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(appointments.organizationId, organizationId),
      gte(appointments.appointmentDate, new Date(startDate)),
      lte(appointments.appointmentDate, new Date(endDate)),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(appointments.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(appointments.appointmentDate);

    return results as any[];
  }

  async findByStatus(
    status: (typeof appointmentStatusEnum.enumValues)[number],
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(appointments.organizationId, organizationId),
      eq(appointments.status, status),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(appointments.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(appointments.appointmentDate);

    return results as any[];
  }

  // Get appointment statistics
  async getStatistics(organizationId: string) {
    const [total] = await this.db
      .select({ count: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          isNull(appointments.deletedAt),
        ),
      );

    // Get today's appointments
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    );

    const [todayAppointments] = await this.db
      .select({ count: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay),
          isNull(appointments.deletedAt),
        ),
      );

    // Get appointments by status
    const [scheduled] = await this.db
      .select({ count: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          eq(appointments.status, 'scheduled'),
          isNull(appointments.deletedAt),
        ),
      );

    const [completed] = await this.db
      .select({ count: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          eq(appointments.status, 'completed'),
          isNull(appointments.deletedAt),
        ),
      );

    const [cancelled] = await this.db
      .select({ count: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.organizationId, organizationId),
          eq(appointments.status, 'cancelled'),
          isNull(appointments.deletedAt),
        ),
      );

    return {
      total: Number(total?.count || 0),
      today: Number(todayAppointments?.count || 0),
      scheduled: Number(scheduled?.count || 0),
      completed: Number(completed?.count || 0),
      cancelled: Number(cancelled?.count || 0),
    };
  }
}
