import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { medicalRecords } from '@database/schemas/medical-records.schema';
import { BaseService } from '@common/services/base.service';
import { eq, and, isNull } from 'drizzle-orm';

@Injectable()
export class MedicalRecordsService extends BaseService<any> {
  constructor(databaseService: DatabaseService) {
    super(databaseService, medicalRecords);
  }

  async findByPatient(
    patientId: string,
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(medicalRecords.organizationId, organizationId),
      eq(medicalRecords.patientId, patientId),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(medicalRecords.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(medicalRecords)
      .where(and(...conditions))
      .orderBy(medicalRecords.createdAt);

    return results as any[];
  }

  async findByAppointment(
    appointmentId: string,
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(medicalRecords.organizationId, organizationId),
      eq(medicalRecords.appointmentId, appointmentId),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(medicalRecords.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(medicalRecords)
      .where(and(...conditions))
      .orderBy(medicalRecords.createdAt);

    return results as any[];
  }

  async findByRecordType(
    recordType: string,
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(medicalRecords.organizationId, organizationId),
      eq(
        medicalRecords.recordType,
        recordType as
          | 'consultation'
          | 'examination'
          | 'lab_result'
          | 'imaging'
          | 'prescription'
          | 'procedure'
          | 'vaccination',
      ),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(medicalRecords.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(medicalRecords)
      .where(and(...conditions))
      .orderBy(medicalRecords.createdAt);

    return results as any[];
  }

  async findFollowUpRequired(organizationId: string, includeDeleted = false) {
    const conditions = [
      eq(medicalRecords.organizationId, organizationId),
      eq(medicalRecords.followUpRequired, true),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(medicalRecords.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(medicalRecords)
      .where(and(...conditions))
      .orderBy(medicalRecords.followUpDate);

    return results as any[];
  }
}
