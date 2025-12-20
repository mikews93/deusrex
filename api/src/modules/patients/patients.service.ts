import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { patients } from '@database/schemas/patients.schema';
import { BaseService } from '@common/services/base.service';
import { ClerkService } from '@common/services/clerk.service';
import { eq, and, or, like, isNull } from 'drizzle-orm';
import { Patient } from '@/database/types';
import { bloodTypeEnum } from '@/database/schemas/enums';

@Injectable()
export class PatientsService extends BaseService<Patient> {
  private readonly logger = new Logger(PatientsService.name);

  constructor(
    databaseService: DatabaseService,
    private readonly clerkService: ClerkService,
  ) {
    super(databaseService, patients);
  }

  // Override create to automatically create a user for the patient
  async create(
    createPatientDto: Partial<Patient>,
    organizationId: string,
    userId?: string,
  ) {
    try {
      // Create user in Clerk and local database if email is provided
      let createdUser: any = null;
      if (createPatientDto.email) {
        this.logger.log(`Creating user for patient: ${createPatientDto.email}`);

        createdUser = await this.clerkService.createUser({
          email: createPatientDto.email,
          firstName: createPatientDto.firstName || '',
          lastName: createPatientDto.lastName || '',
          type: 'regular',
          role: 'patient',
          organizationId: organizationId,
          metadata: {
            patientId: null, // Will be updated after patient creation
            bloodType: createPatientDto.bloodType,
            dateOfBirth: createPatientDto.dateOfBirth,
            sex: createPatientDto.sex,
          },
        });

        this.logger.log(
          `Created user ${createdUser.id} for patient ${createPatientDto.email}`,
        );
      }

      // Create the patient with the userId if user was created
      const patientData = {
        ...createPatientDto,
        userId: createdUser?.id,
      };

      const patient = await super.create(patientData, organizationId, userId);

      // Update the user's metadata with the patient ID
      if (createdUser && patient) {
        await this.clerkService.updateUser(createdUser.clerkUserId, {
          metadata: {
            patientId: patient.id,
            bloodType: createPatientDto.bloodType,
            dateOfBirth: createPatientDto.dateOfBirth,
            sex: createPatientDto.sex,
          },
        });
      }

      return patient;
    } catch (error) {
      this.logger.error(`Failed to create patient:`, error.message);
      throw error;
    }
  }

  async findByEmail(
    email: string,
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(patients.organizationId, organizationId),
      eq(patients.email, email),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(patients.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(patients)
      .where(and(...conditions))
      .limit(1);

    return results[0];
  }

  async searchPatients(
    searchTerm: string,
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(patients.organizationId, organizationId),
      or(
        like(patients.firstName, `%${searchTerm}%`),
        like(patients.lastName, `%${searchTerm}%`),
        like(patients.email, `%${searchTerm}%`),
        like(patients.phone, `%${searchTerm}%`),
      ),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(patients.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(patients)
      .where(and(...conditions));

    return results as any[];
  }

  async findByBloodType(
    bloodType: (typeof bloodTypeEnum.enumValues)[number],
    organizationId: string,
    includeDeleted = false,
  ) {
    const conditions = [
      eq(patients.organizationId, organizationId),
      eq(patients.bloodType, bloodType),
    ];

    if (!includeDeleted) {
      conditions.push(isNull(patients.deletedAt));
    }

    const results = await this.databaseService
      .getDatabase()
      .select()
      .from(patients)
      .where(and(...conditions));

    return results as any[];
  }

  // Get patient statistics
  async getStatistics(organizationId: string) {
    const [total] = await this.db
      .select({ count: patients.id })
      .from(patients)
      .where(
        and(
          eq(patients.organizationId, organizationId),
          isNull(patients.deletedAt),
        ),
      );

    const [active] = await this.db
      .select({ count: patients.id })
      .from(patients)
      .where(
        and(
          eq(patients.organizationId, organizationId),
          eq(patients.isActive, true),
          isNull(patients.deletedAt),
        ),
      );

    return {
      total: Number(total?.count || 0),
      active: Number(active?.count || 0),
      inactive: Number(total?.count || 0) - Number(active?.count || 0),
    };
  }
}
