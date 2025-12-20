import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '@database/database.service';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@clerk/backend';

interface LoginRequest {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly databaseService: DatabaseService) {}

  async login(loginData: LoginRequest) {
    const db = this.databaseService.getDatabase();

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, loginData.email));

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Since we're using Clerk for authentication, we don't verify passwords locally
    // The frontend should handle authentication through Clerk and send the JWT token
    // This endpoint is now primarily for getting user information and organization context

    // Get user's primary organization and role
    const userOrgs = await db
      .select({
        organizationId: userOrganizations.organizationId,
        role: userOrganizations.role,
        isActive: userOrganizations.isActive,
      })
      .from(userOrganizations)
      .where(
        and(
          eq(userOrganizations.userId, user.id),
          eq(userOrganizations.isActive, true),
        ),
      );

    const primaryOrg = userOrgs[0]; // Get the first organization

    // Return user information (no JWT token since Clerk handles that)
    return {
      user: {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        name: user.name,
        type: user.type,
        organizationId: primaryOrg?.organizationId,
        role: primaryOrg?.role,
      },
      message:
        'Authentication should be handled through Clerk. Use the Clerk JWT token for API requests.',
    };
  }

  async validateClerkToken(token: string) {
    try {
      const secretKey = process.env.CLERK_SECRET_KEY;
      const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

      if (!secretKey || !publishableKey) {
        throw new UnauthorizedException('Clerk configuration missing');
      }

      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
        authorizedParties: [publishableKey],
      });

      // Find the user in our database
      const db = this.databaseService.getDatabase();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, payload.sub));

      if (!user) {
        throw new UnauthorizedException('User not found in database');
      }

      // Get user's organizations
      const userOrgs = await db
        .select({
          organizationId: userOrganizations.organizationId,
          role: userOrganizations.role,
          isActive: userOrganizations.isActive,
        })
        .from(userOrganizations)
        .where(
          and(
            eq(userOrganizations.userId, user.id),
            eq(userOrganizations.isActive, true),
          ),
        );

      return {
        user: {
          id: user.id,
          clerkUserId: payload.sub,
          email: payload.email,
          firstName: payload.first_name,
          lastName: payload.last_name,
          imageUrl: payload.picture,
          type: user.type,
          organizations: userOrgs,
        },
        payload,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
