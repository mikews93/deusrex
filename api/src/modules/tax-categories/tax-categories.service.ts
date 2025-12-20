import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { taxCategories } from '../../database/schemas';
import { eq, and, desc } from 'drizzle-orm';
import {
  taxCategorySelectSchema,
  taxCategoryInsertSchema,
} from '../../database/schemas/zod-schemas';
import { z } from 'zod';

@Injectable()
export class TaxCategoriesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: z.infer<typeof taxCategoryInsertSchema>) {
    const [taxCategory] = await this.databaseService.db
      .insert(taxCategories)
      .values(data)
      .returning();

    return taxCategory;
  }

  async findAll(organizationId: string) {
    return await this.databaseService.db
      .select()
      .from(taxCategories)
      .where(
        and(
          eq(taxCategories.organizationId, organizationId),
          eq(taxCategories.isActive, true),
        ),
      )
      .orderBy(desc(taxCategories.createdAt));
  }

  async findOne(id: string, organizationId: string) {
    const [taxCategory] = await this.databaseService.db
      .select()
      .from(taxCategories)
      .where(
        and(
          eq(taxCategories.id, id),
          eq(taxCategories.organizationId, organizationId),
          eq(taxCategories.isActive, true),
        ),
      );

    return taxCategory;
  }

  async update(
    id: string,
    data: Partial<z.infer<typeof taxCategoryInsertSchema>>,
    organizationId: string,
  ) {
    const [taxCategory] = await this.databaseService.db
      .update(taxCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(taxCategories.id, id),
          eq(taxCategories.organizationId, organizationId),
        ),
      )
      .returning();

    return taxCategory;
  }

  async remove(id: string, organizationId: string) {
    const [taxCategory] = await this.databaseService.db
      .update(taxCategories)
      .set({
        isActive: false,
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(taxCategories.id, id),
          eq(taxCategories.organizationId, organizationId),
        ),
      )
      .returning();

    return taxCategory;
  }

  async findByCode(code: string, organizationId: string) {
    const [taxCategory] = await this.databaseService.db
      .select()
      .from(taxCategories)
      .where(
        and(
          eq(taxCategories.code, code),
          eq(taxCategories.organizationId, organizationId),
          eq(taxCategories.isActive, true),
        ),
      );

    return taxCategory;
  }
}
