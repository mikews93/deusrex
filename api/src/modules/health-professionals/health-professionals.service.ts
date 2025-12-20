import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { HealthProfessional } from '@/database/types';
import { healthProfessionals } from '@database/schemas/health-professionals.schema';
import { BaseService } from '@common/services/base.service';
import { ClerkService } from '@common/services/clerk.service';
import { eq, and, like, SQL, isNull } from 'drizzle-orm';
import { HealthProfessionalFilter } from '@common/schemas/filter.schema';

@Injectable()
export class HealthProfessionalsService extends BaseService<HealthProfessional> {
  private readonly logger = new Logger(HealthProfessionalsService.name);

  constructor(
    databaseService: DatabaseService,
    private readonly clerkService: ClerkService,
  ) {
    super(databaseService, healthProfessionals);
  }

  // Override create to automatically create a user for the health professional
  async create(
    createHealthProfessionalDto: Partial<HealthProfessional>,
    organizationId: string,
    userId?: string,
  ) {
    try {
      // Create user in Clerk and local database if email is provided
      let createdUser: any = null;
      if (createHealthProfessionalDto.email) {
        this.logger.log(
          `Creating user for health professional: ${createHealthProfessionalDto.email}`,
        );

        createdUser = await this.clerkService.createUser({
          email: createHealthProfessionalDto.email,
          firstName: createHealthProfessionalDto.firstName || '',
          lastName: createHealthProfessionalDto.lastName || '',
          type: 'regular',
          role: 'health_professional',
          organizationId: organizationId,
          metadata: {
            healthProfessionalId: null, // Will be updated after health professional creation
            type: createHealthProfessionalDto.type,
            specialty: createHealthProfessionalDto.specialty,
            licenseNumber: createHealthProfessionalDto.licenseNumber,
            isAvailable: createHealthProfessionalDto.isAvailable,
          },
        });

        this.logger.log(
          `Created user ${createdUser.id} for health professional ${createHealthProfessionalDto.email}`,
        );
      }

      // Create the health professional with the userId if user was created
      const healthProfessionalData = {
        ...createHealthProfessionalDto,
        userId: createdUser?.id,
      };

      const healthProfessional = await super.create(
        healthProfessionalData,
        organizationId,
        userId,
      );

      // Update the user's metadata with the health professional ID
      if (createdUser && healthProfessional) {
        await this.clerkService.updateUser(createdUser.clerkUserId, {
          metadata: {
            healthProfessionalId: healthProfessional.id,
            type: createHealthProfessionalDto.type,
            specialty: createHealthProfessionalDto.specialty,
            licenseNumber: createHealthProfessionalDto.licenseNumber,
            isAvailable: createHealthProfessionalDto.isAvailable,
          },
        });
      }

      return healthProfessional;
    } catch (error) {
      this.logger.error(`Failed to create health professional:`, error.message);
      throw error;
    }
  }

  // Override buildWhereConditions for health professional-specific filtering
  protected buildWhereConditions(
    organizationId?: string,
    includeDeleted: boolean = false,
    filters?: HealthProfessionalFilter,
  ) {
    const conditions: SQL[] = [];

    if (organizationId) {
      conditions.push(eq(healthProfessionals.organizationId, organizationId));
    }

    if (!includeDeleted && healthProfessionals.deletedAt) {
      conditions.push(isNull(healthProfessionals.deletedAt));
    }

    if (filters) {
      // Apply search filter
      if (filters.search) {
        // Search in first name
        conditions.push(
          like(healthProfessionals.firstName, `%${filters.search}%`),
        );
      }

      // Apply type filter
      if (filters.type) {
        conditions.push(eq(healthProfessionals.type, filters.type as any));
      }

      // Apply specialty filter
      if (filters.specialty) {
        conditions.push(
          eq(healthProfessionals.specialty, filters.specialty as any),
        );
      }

      // Apply availability filter
      if (filters.isAvailable !== undefined) {
        conditions.push(
          eq(healthProfessionals.isAvailable, filters.isAvailable),
        );
      }

      // Apply active status filter
      if (filters.isActive !== undefined) {
        conditions.push(eq(healthProfessionals.isActive, filters.isActive));
      }
    }

    return conditions.length > 0 ? and(...conditions) : undefined;
  }

  // Health professional-specific methods
  async findByEmail(email: HealthProfessional['email']) {
    const [healthProfessional] = await this.db
      .select()
      .from(healthProfessionals)
      .where(eq(healthProfessionals.email, email));
    return healthProfessional;
  }

  async findByLicenseNumber(licenseNumber: string) {
    if (!licenseNumber) return null;

    const [healthProfessional] = await this.db
      .select()
      .from(healthProfessionals)
      .where(eq(healthProfessionals.licenseNumber, licenseNumber));
    return healthProfessional;
  }

  async findByNPI(npi: string) {
    if (!npi) return null;

    const [healthProfessional] = await this.db
      .select()
      .from(healthProfessionals)
      .where(eq(healthProfessionals.npi, npi));
    return healthProfessional;
  }

  // Get health professionals by type
  async getByType(type: HealthProfessional['type'], organizationId: string) {
    return await this.db
      .select()
      .from(healthProfessionals)
      .where(
        and(
          eq(healthProfessionals.type, type),
          eq(healthProfessionals.organizationId, organizationId),
          eq(healthProfessionals.isActive, true),
          isNull(healthProfessionals.deletedAt),
        ),
      );
  }

  // Get health professionals by specialty
  async getBySpecialty(specialty: string, organizationId: string) {
    if (!specialty) return [];

    return await this.db
      .select()
      .from(healthProfessionals)
      .where(
        and(
          eq(healthProfessionals.specialty, specialty as any),
          eq(healthProfessionals.organizationId, organizationId),
          eq(healthProfessionals.isActive, true),
          isNull(healthProfessionals.deletedAt),
        ),
      );
  }

  // Get available health professionals
  async getAvailable(organizationId: string) {
    return await this.db
      .select()
      .from(healthProfessionals)
      .where(
        and(
          eq(healthProfessionals.organizationId, organizationId),
          eq(healthProfessionals.isActive, true),
          eq(healthProfessionals.isAvailable, true),
          isNull(healthProfessionals.deletedAt),
        ),
      );
  }

  // Update availability status
  async updateAvailability(id: string, isAvailable: boolean, userId?: string) {
    return await this.db
      .update(healthProfessionals)
      .set({
        isAvailable,
        updatedAt: new Date(),
        updatedBy: userId,
      })
      .where(eq(healthProfessionals.id, id))
      .returning();
  }

  // Get health professional statistics
  async getStatistics(organizationId: string) {
    const [total] = await this.db
      .select({ count: healthProfessionals.id })
      .from(healthProfessionals)
      .where(
        and(
          eq(healthProfessionals.organizationId, organizationId),
          isNull(healthProfessionals.deletedAt),
        ),
      );

    const [active] = await this.db
      .select({ count: healthProfessionals.id })
      .from(healthProfessionals)
      .where(
        and(
          eq(healthProfessionals.organizationId, organizationId),
          eq(healthProfessionals.isActive, true),
          isNull(healthProfessionals.deletedAt),
        ),
      );

    const [available] = await this.db
      .select({ count: healthProfessionals.id })
      .from(healthProfessionals)
      .where(
        and(
          eq(healthProfessionals.organizationId, organizationId),
          eq(healthProfessionals.isActive, true),
          eq(healthProfessionals.isAvailable, true),
          isNull(healthProfessionals.deletedAt),
        ),
      );

    const totalCount = Number(total?.count) || 0;
    const activeCount = Number(active?.count) || 0;
    const availableCount = Number(available?.count) || 0;

    return {
      total: totalCount,
      active: activeCount,
      available: availableCount,
      inactive: totalCount - activeCount,
      unavailable: activeCount - availableCount,
    };
  }
}
