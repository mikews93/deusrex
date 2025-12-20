import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { jurisdictions } from '../../database/schemas';
import { eq, and, desc } from 'drizzle-orm';
import {
  jurisdictionSelectSchema,
  jurisdictionInsertSchema,
} from '../../database/schemas/zod-schemas';
import { z } from 'zod';

@Injectable()
export class JurisdictionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: z.infer<typeof jurisdictionInsertSchema>) {
    const [jurisdiction] = await this.databaseService.db
      .insert(jurisdictions)
      .values(data)
      .returning();

    return jurisdiction;
  }

  async findAll(organizationId: string) {
    return await this.databaseService.db
      .select()
      .from(jurisdictions)
      .where(
        and(
          eq(jurisdictions.organizationId, organizationId),
          eq(jurisdictions.isActive, true),
        ),
      )
      .orderBy(desc(jurisdictions.createdAt));
  }

  async findOne(id: string, organizationId: string) {
    const [jurisdiction] = await this.databaseService.db
      .select()
      .from(jurisdictions)
      .where(
        and(
          eq(jurisdictions.id, id),
          eq(jurisdictions.organizationId, organizationId),
          eq(jurisdictions.isActive, true),
        ),
      );

    return jurisdiction;
  }

  async update(
    id: string,
    data: Partial<z.infer<typeof jurisdictionInsertSchema>>,
    organizationId: string,
  ) {
    const [jurisdiction] = await this.databaseService.db
      .update(jurisdictions)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(jurisdictions.id, id),
          eq(jurisdictions.organizationId, organizationId),
        ),
      )
      .returning();

    return jurisdiction;
  }

  async remove(id: string, organizationId: string) {
    const [jurisdiction] = await this.databaseService.db
      .update(jurisdictions)
      .set({
        isActive: false,
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(jurisdictions.id, id),
          eq(jurisdictions.organizationId, organizationId),
        ),
      )
      .returning();

    return jurisdiction;
  }

  async findByCountry(country: string, organizationId: string) {
    return await this.databaseService.db
      .select()
      .from(jurisdictions)
      .where(
        and(
          eq(jurisdictions.country, country),
          eq(jurisdictions.organizationId, organizationId),
          eq(jurisdictions.isActive, true),
        ),
      )
      .orderBy(desc(jurisdictions.createdAt));
  }
}
