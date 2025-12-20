import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { verifyToken } from '@clerk/backend';
import { DatabaseService } from '@database/database.service';
import { users } from '@database/schemas/users.schema';
import { userOrganizations } from '@database/schemas/user-organizations.schema';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class ClerkGuard implements CanActivate {
  constructor(private readonly databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const jwtKey = process.env.CLERK_JWT_KEY;
      const publishableKey = process.env.CLERK_PUBLISHABLE_KEY;

      if (!jwtKey || !publishableKey) {
        throw new UnauthorizedException('Clerk configuration missing');
      }

      const payload = await verifyToken(token, {
        jwtKey,
        authorizedParties: [publishableKey],
      });

      // Extract organization information from the token
      const organizationId = payload.org_id;

      if (!organizationId) {
        throw new UnauthorizedException('Organization context is required');
      }

      // Find the user in our database
      const db = this.databaseService.getDatabase();
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, payload.sub));

      if (!user) {
        throw new UnauthorizedException('User not found in database');
      }

      // Get user's role in the specific organization
      const [userOrg] = await db
        .select({
          role: userOrganizations.role,
          isActive: userOrganizations.isActive,
        })
        .from(userOrganizations)
        .where(
          and(
            eq(userOrganizations.userId, user.id),
            eq(userOrganizations.organizationId, organizationId),
            eq(userOrganizations.isActive, true),
          ),
        );

      if (!userOrg) {
        throw new UnauthorizedException('User not found in organization');
      }

      // Attach the user data to the request for use in controllers
      request['user'] = {
        id: user.id,
        userId: payload.sub,
        email: payload.email,
        firstName: payload.first_name,
        lastName: payload.last_name,
        imageUrl: payload.picture,
        type: user.type,
        organizationId: parseInt(organizationId),
        role: userOrg.role,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
