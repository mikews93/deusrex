import { Injectable, Logger } from '@nestjs/common';
import { createClerkClient } from '@clerk/backend';
import { DatabaseService } from '@database/database.service';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq } from 'drizzle-orm';

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  type: 'regular' | 'superadmin';
  role: 'patient' | 'health_professional' | 'admin' | 'member' | 'receptionist';
  organizationId: string;
  metadata?: Record<string, any>;
}

export interface CreatedUser {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  type: string;
  role: string;
  organizationId: string;
  password: string;
}

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private readonly clerk;

  constructor(private readonly databaseService: DatabaseService) {
    this.clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
  }

  /**
   * Generate a secure password that meets Clerk's requirements
   */
  private generateSecurePassword(): string {
    const length = 16;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one of each required character type
    password += 'A'; // uppercase
    password += 'a'; // lowercase
    password += '1'; // number
    password += '!'; // special character

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Generate a random avatar URL
   */
  private generateAvatarUrl(): string {
    const randomNumber = Math.floor(Math.random() * 1000);
    return `https://avatar.iran.liara.run/public/${randomNumber}`;
  }

  /**
   * Create a user in both Clerk and the local database
   */
  async createUser(userData: CreateUserData): Promise<CreatedUser> {
    const db = this.databaseService.getDatabase();

    try {
      // Check if user already exists in local database
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email));

      if (existingUser) {
        throw new Error(`User with email ${userData.email} already exists`);
      }

      // Generate secure password
      const password = this.generateSecurePassword();

      // Create user in Clerk
      const clerkUser = await this.clerk.users.createUser({
        emailAddress: [userData.email],
        password: password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        publicMetadata: {
          type: userData.type,
          role: userData.role,
          organizationId: userData.organizationId,
          ...userData.metadata,
        },
      });

      this.logger.log(
        `Created Clerk user: ${clerkUser.id} for ${userData.email}`,
      );

      // Create user in local database
      const [user] = await db
        .insert(users)
        .values({
          clerkUserId: clerkUser.id,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          type: userData.type as 'regular' | 'superadmin',
          isActive: true,
          imageUrl: this.generateAvatarUrl(),
        })
        .returning();

      // Create user-organization relationship
      await db.insert(userOrganizations).values({
        userId: user.id,
        organizationId: userData.organizationId,
        role: userData.role as any,
        isActive: true,
        createdBy: user.id, // Self-created
        updatedBy: user.id,
      });

      this.logger.log(`Created local user: ${user.id} for ${userData.email}`);

      return {
        id: user.id,
        clerkUserId: clerkUser.id,
        email: user.email,
        name: user.name,
        type: user.type,
        role: userData.role,
        organizationId: userData.organizationId,
        password: password,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create user ${userData.email}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Delete a user from both Clerk and local database
   */
  async deleteUser(clerkUserId: string): Promise<void> {
    const db = this.databaseService.getDatabase();

    try {
      // Delete from Clerk
      await this.clerk.users.deleteUser(clerkUserId);
      this.logger.log(`Deleted Clerk user: ${clerkUserId}`);

      // Find and delete from local database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, clerkUserId));

      if (user) {
        // Delete user-organization relationships
        await db
          .delete(userOrganizations)
          .where(eq(userOrganizations.userId, user.id));

        // Delete user
        await db.delete(users).where(eq(users.id, user.id));

        this.logger.log(`Deleted local user: ${user.id}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete user ${clerkUserId}:`, error.message);
      throw error;
    }
  }

  /**
   * Update user in both Clerk and local database
   */
  async updateUser(
    clerkUserId: string,
    updateData: Partial<CreateUserData>,
  ): Promise<void> {
    const db = this.databaseService.getDatabase();

    try {
      // Update in Clerk
      const clerkUpdateData: any = {};
      if (updateData.firstName)
        clerkUpdateData.firstName = updateData.firstName;
      if (updateData.lastName) clerkUpdateData.lastName = updateData.lastName;
      if (updateData.email) clerkUpdateData.emailAddress = [updateData.email];
      if (updateData.metadata)
        clerkUpdateData.publicMetadata = updateData.metadata;

      if (Object.keys(clerkUpdateData).length > 0) {
        await this.clerk.users.updateUser(clerkUserId, clerkUpdateData);
        this.logger.log(`Updated Clerk user: ${clerkUserId}`);
      }

      // Update in local database
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, clerkUserId));

      if (user) {
        const localUpdateData: any = {};
        if (updateData.email) localUpdateData.email = updateData.email;
        if (updateData.firstName && updateData.lastName) {
          localUpdateData.name = `${updateData.firstName} ${updateData.lastName}`;
        }
        if (updateData.type) localUpdateData.type = updateData.type;

        if (Object.keys(localUpdateData).length > 0) {
          await db
            .update(users)
            .set(localUpdateData)
            .where(eq(users.id, user.id));

          this.logger.log(`Updated local user: ${user.id}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to update user ${clerkUserId}:`, error.message);
      throw error;
    }
  }
}
