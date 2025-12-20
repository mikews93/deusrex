import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Extend the Request interface to include user and organizationId
declare global {
  namespace Express {
    interface Request {
      user?: any;
      organizationId?: number;
    }
  }
}

@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip organization check for login endpoint
    if (req.path === '/users/login' && req.method === 'POST') {
      return next();
    }

    const user = req.user;

    // If no user is present (e.g., unauthenticated requests), skip organization check
    if (!user) {
      return next();
    }

    // Skip organization check for admin users
    if (user?.role === 'admin') {
      return next();
    }

    // Check if user has organization context
    if (!user?.organizationId) {
      throw new UnauthorizedException('Organization context is required');
    }

    // Add organization context to request for use in services
    req.organizationId = user.organizationId;

    next();
  }
}
