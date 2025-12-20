import { Injectable } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { NewUser, Organization, User } from '@/database/types';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { BaseService } from '@common/services/base.service';
import { eq, and } from 'drizzle-orm';
import { userRoleEnum } from '@/database/schemas/enums';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(databaseService: DatabaseService) {
    super(databaseService, users);
  }

  // Override create to handle user-specific fields
  async create(
    createUserDto: NewUser,
    organizationId: string,
    userId?: string,
  ) {
    const userData = {
      email: createUserDto.email,
      name: createUserDto.name,
      password: createUserDto.password,
      type: createUserDto.type,
      clerkUserId: createUserDto.clerkUserId,
    };

    // Create the user first
    const user = await super.create(userData, organizationId, userId);

    // Then create the user-organization relationship
    if (user && organizationId) {
      await this.db.insert(userOrganizations).values({
        userId: user.id,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
      });
    }

    return user;
  }

  // User-specific methods
  async findByEmail(email: User['email']) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));
    return user;
  }

  async findByClerkId(clerkUserId: User['clerkUserId']) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId));
    return user;
  }

  // Get user's organizations and roles
  async getUserOrganizations(userId: string) {
    return await this.db
      .select({
        organizationId: userOrganizations.organizationId,
        role: userOrganizations.role,
        isActive: userOrganizations.isActive,
        createdAt: userOrganizations.createdAt,
      })
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.isActive, true),
        ),
      );
  }

  // Get user's role in a specific organization
  async getUserRoleInOrganization(userId: User['id'], organizationId: string) {
    const [userOrg] = await this.db
      .select({
        role: userOrganizations.role,
        isActive: userOrganizations.isActive,
      })
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, organizationId),
          eq(userOrganizations.isActive, true),
        ),
      );

    return userOrg?.role || null;
  }

  // Add user to organization
  async addUserToOrganization(
    userId: User['id'],
    organizationId: string,
    role: (typeof userRoleEnum.enumValues)[number] = 'member',
    createdBy?: string,
  ) {
    const [result] = await this.db
      .insert(userOrganizations)
      .values({
        userId,
        organizationId,
        role,
        createdBy,
        updatedBy: createdBy,
      })
      .returning();
    return result;
  }

  // Update user's role in organization
  async updateUserRoleInOrganization(
    userId: User['id'],
    organizationId: string,
    role: (typeof userRoleEnum.enumValues)[number],
    updatedBy?: string,
  ) {
    const [result] = await this.db
      .update(userOrganizations)
      .set({
        role,
        updatedAt: new Date(),
        updatedBy,
      })
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, organizationId),
        ),
      )
      .returning();
    return result;
  }

  // Remove user from organization (soft delete)
  async removeUserFromOrganization(
    userId: User['id'],
    organizationId: string,
    deletedBy?: string,
  ) {
    await this.db
      .update(userOrganizations)
      .set({
        isActive: false,
        updatedAt: new Date(),
        updatedBy: deletedBy,
      })
      .where(
        and(
          eq(userOrganizations.userId, userId),
          eq(userOrganizations.organizationId, organizationId),
        ),
      );

    return { message: 'User removed from organization successfully' };
  }

  // Get all users in an organization
  async getUsersInOrganization(organizationId: Organization['id']) {
    return await this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        type: users.type,
        isActive: users.isActive,
        role: userOrganizations.role,
        joinedAt: userOrganizations.createdAt,
      })
      .from(users)
      .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
      .where(
        and(
          eq(userOrganizations.organizationId, organizationId),
          eq(userOrganizations.isActive, true),
          eq(users.isActive, true),
        ),
      );
  }
}
