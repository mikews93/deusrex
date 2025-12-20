import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = request['user'];

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Superadmin can access everything
    if (user.type === 'superadmin') {
      return true;
    }

    // Check if user has the required role in the organization
    const hasRole = requiredRoles.some((role) => {
      // Check organization-specific role
      if (role === 'admin' && user.role === 'admin') {
        return true;
      }
      if (role === 'member' && user.role === 'member') {
        return true;
      }
      if (
        role === 'manager' &&
        (user.role === 'admin' || user.role === 'member')
      ) {
        return true;
      }

      // Healthcare-specific roles
      if (
        role === 'health_professional' &&
        user.role === 'health_professional'
      ) {
        return true;
      }
      if (role === 'receptionist' && user.role === 'receptionist') {
        return true;
      }
      if (role === 'patient' && user.role === 'patient') {
        return true;
      }

      // Healthcare role hierarchies
      if (
        role === 'healthcare_staff' &&
        (user.role === 'admin' ||
          user.role === 'health_professional' ||
          user.role === 'receptionist')
      ) {
        return true;
      }

      if (
        role === 'healthcare_admin' &&
        (user.role === 'admin' || user.role === 'health_professional')
      ) {
        return true;
      }

      return false;
    });

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
