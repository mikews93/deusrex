import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { fiscalDocuments } from '../../database/schemas';
import { eq, and, desc } from 'drizzle-orm';
import {
  fiscalDocumentSelectSchema,
  fiscalDocumentInsertSchema,
} from '../../database/schemas/zod-schemas';
import { z } from 'zod';

@Injectable()
export class FiscalDocumentsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: z.infer<typeof fiscalDocumentInsertSchema>) {
    const [fiscalDocument] = await this.databaseService.db
      .insert(fiscalDocuments)
      .values(data)
      .returning();

    return fiscalDocument;
  }

  async findAll(organizationId: string) {
    return await this.databaseService.db
      .select()
      .from(fiscalDocuments)
      .where(eq(fiscalDocuments.organizationId, organizationId))
      .orderBy(desc(fiscalDocuments.createdAt));
  }

  async findOne(id: string, organizationId: string) {
    const [fiscalDocument] = await this.databaseService.db
      .select()
      .from(fiscalDocuments)
      .where(
        and(
          eq(fiscalDocuments.id, id),
          eq(fiscalDocuments.organizationId, organizationId),
        ),
      );

    return fiscalDocument;
  }

  async update(
    id: string,
    data: Partial<z.infer<typeof fiscalDocumentInsertSchema>>,
    organizationId: string,
  ) {
    const [fiscalDocument] = await this.databaseService.db
      .update(fiscalDocuments)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(fiscalDocuments.id, id),
          eq(fiscalDocuments.organizationId, organizationId),
        ),
      )
      .returning();

    return fiscalDocument;
  }

  async findByRelated(
    relatedType: string,
    relatedId: string,
    organizationId: string,
  ) {
    return await this.databaseService.db
      .select()
      .from(fiscalDocuments)
      .where(
        and(
          eq(fiscalDocuments.relatedType, relatedType),
          eq(fiscalDocuments.relatedId, relatedId),
          eq(fiscalDocuments.organizationId, organizationId),
        ),
      )
      .orderBy(desc(fiscalDocuments.createdAt));
  }

  async findByJurisdiction(jurisdictionId: string, organizationId: string) {
    return await this.databaseService.db
      .select()
      .from(fiscalDocuments)
      .where(
        and(
          eq(fiscalDocuments.jurisdictionId, jurisdictionId),
          eq(fiscalDocuments.organizationId, organizationId),
        ),
      )
      .orderBy(desc(fiscalDocuments.createdAt));
  }

  async updateStatus(id: string, status: string, organizationId: string) {
    const [fiscalDocument] = await this.databaseService.db
      .update(fiscalDocuments)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(fiscalDocuments.id, id),
          eq(fiscalDocuments.organizationId, organizationId),
        ),
      )
      .returning();

    return fiscalDocument;
  }
}
