import { Injectable, Logger } from '@nestjs/common';
import { verifyToken } from '@clerk/backend';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { organizations } from '@database/schemas/organizations.schema';
import { eq, and } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  type: string;
  organizationId: string;
  role: string;
}

@Injectable()
export class TrpcAuthService {
  private readonly logger = new Logger(TrpcAuthService.name);

  async authenticateRequest(
    req: any,
    db: PostgresJsDatabase<any>,
  ): Promise<AuthenticatedUser | null> {
    const token = this.extractTokenFromHeader(req);

    if (!token) {
      return null;
    }

    try {
      const jwtKey = process.env.CLERK_JWT_KEY;
      const secretKey = process.env.CLERK_SECRET_KEY;
      const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

      if (!jwtKey || !secretKey || !publishableKey) {
        this.logger.error('Clerk environment variables not found');
        return null;
      }

      // Build authorized parties list
      const configuredAzp = process.env.CLERK_JWT_AZP;
      const frontendUrl = process.env.FRONTEND_URL;
      const allowedAzp = [
        configuredAzp,
        frontendUrl,
        publishableKey
      ].filter((v): v is string => Boolean(v));

      // Try with jwtKey first (for JWT templates like "Eden")
      let payload: any;
      try {
        payload = (await verifyToken(token, {
          jwtKey,
          authorizedParties: allowedAzp,
        })) as any;
      } catch (jwtKeyError) {
        // Fallback to secretKey if jwtKey fails
        payload = (await verifyToken(token, {
          secretKey,
          authorizedParties: allowedAzp,
        })) as any;
      }

      // Extract organization information from the token
      const clerkOrganizationId: string | undefined =
        (payload as any).organizationId || (payload as any).org_id;

      if (!clerkOrganizationId) {
        this.logger.warn('No organization ID in token');
        return null;
      }

      // Get user, organization, and user-organization relationship in a single query
      const [userWithOrg] = await db
        .select({
          // User fields
          userId: users.id,
          userEmail: users.email,
          userName: users.name,
          userType: users.type,
          // Organization fields
          organizationId: organizations.id,
          organizationName: organizations.name,
          // User-Organization relationship fields
          userRole: userOrganizations.role,
          isActive: userOrganizations.isActive,
        })
        .from(users)
        .innerJoin(
          organizations,
          eq(organizations.clerkOrgId, clerkOrganizationId),
        )
        .innerJoin(
          userOrganizations,
          and(
            eq(userOrganizations.userId, users.id),
            eq(userOrganizations.organizationId, organizations.id),
            eq(userOrganizations.isActive, true),
          ),
        )
        .where(eq(users.clerkUserId, payload.sub));

      if (!userWithOrg) {
        this.logger.warn(
          `User not found or not in organization: ${payload.sub}, org: ${clerkOrganizationId}`,
        );
        return null;
      }

      this.logger.log(
        `User authenticated: ${userWithOrg.userEmail} in org: ${userWithOrg.organizationName}`,
      );

      return {
        id: userWithOrg.userId,
        userId: payload.sub as string,
        email: payload.email as string,
        firstName: payload.firstName as string,
        lastName: payload.lastName as string,
        imageUrl: payload.picture as string,
        type: userWithOrg.userType,
        organizationId: userWithOrg.organizationId,
        role: userWithOrg.userRole,
      };
    } catch (error) {
      this.logger.error('Error in authentication:', error);
      return null;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
