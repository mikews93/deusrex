import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { organizations } from '@database/schemas/organizations.schema';
import { eq } from 'drizzle-orm';
import { Organization, NewOrganization } from '@database/types';

@Injectable()
export class OrganizationsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(organizationData: Omit<NewOrganization, 'id'>) {
    const db = this.databaseService.getDatabase();
    const [organization] = await db
      .insert(organizations)
      .values(organizationData)
      .returning();
    return organization;
  }

  async findAll() {
    const db = this.databaseService.getDatabase();
    return await db.select().from(organizations);
  }

  async findOne(id: string) {
    const db = this.databaseService.getDatabase();
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id));
    return organization;
  }

  async findByClerkId(clerkOrgId: string) {
    const db = this.databaseService.getDatabase();
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId));
    return organization;
  }

  async update(id: string, updateData: Partial<Omit<NewOrganization, 'id'>>) {
    const db = this.databaseService.getDatabase();
    const [organization] = await db
      .update(organizations)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return organization;
  }

  async remove(id: string) {
    const db = this.databaseService.getDatabase();
    const [organization] = await db
      .delete(organizations)
      .where(eq(organizations.id, id))
      .returning();
    return organization;
  }
}
