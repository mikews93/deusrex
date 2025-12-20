import { Injectable, Logger } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  LOG = 'log',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogContext {
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  organizationId?: string;
  duration?: number;
  statusCode?: number;
  error?: any;
}

@Injectable()
export class LoggingService {
  private readonly logger = new Logger('API');

  logRequest(context: LogContext) {
    const { method, url, ip, userAgent } = context;
    this.logger.log(
      `🚀 ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`,
    );
  }

  logResponse(context: LogContext) {
    const { method, url, statusCode, duration } = context;
    this.logger.log(`✅ ${method} ${url} - ${statusCode} - ${duration}ms`);
  }

  logError(context: LogContext) {
    const { method, url, statusCode, duration, error } = context;
    this.logger.error(
      `❌ ${method} ${url} - ${statusCode} - ${duration}ms - Error: ${error?.message || 'Unknown error'}`,
    );

    // Log error name if available
    if (error?.name) {
      this.logger.error(`🔍 Error Type: ${error.name}`);
    }

    // Log stack trace if available
    if (error?.stack) {
      this.logger.error(`🔍 Stack Trace: ${error.stack}`);
    }

    // Log additional error details
    if (error && typeof error === 'object') {
      const errorDetails = Object.keys(error)
        .filter((key) => !['message', 'name', 'stack'].includes(key))
        .reduce((acc, key) => {
          acc[key] = error[key];
          return acc;
        }, {} as any);

      if (Object.keys(errorDetails).length > 0) {
        this.logger.error(
          `🔍 Error Details: ${JSON.stringify(errorDetails, null, 2)}`,
        );
      }
    }
  }

  logData(data: any, type: 'request' | 'response' = 'request') {
    const icon = type === 'request' ? '📦' : '📤';
    const label = type === 'request' ? 'Request Body' : 'Response';

    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      const sanitizedData = this.sanitizeData(data);
      this.logger.log(
        `${icon} ${label}: ${JSON.stringify(sanitizedData, null, 2)}`,
      );
    }
  }

  logQueryParams(params: any) {
    if (params && Object.keys(params).length > 0) {
      this.logger.log(`🔍 Query Params: ${JSON.stringify(params, null, 2)}`);
    }
  }

  logPathParams(params: any) {
    if (params && Object.keys(params).length > 0) {
      this.logger.log(`📍 Path Params: ${JSON.stringify(params, null, 2)}`);
    }
  }

  logDatabaseQuery(query: string, params?: any[]) {
    this.logger.debug(`🗄️  Database Query: ${query}`);
    if (params && params.length > 0) {
      this.logger.debug(`📊 Query Params: ${JSON.stringify(params)}`);
    }
  }

  logDatabaseError(error: any, query?: string) {
    this.logger.error(`🗄️  Database Error: ${error.message}`);
    if (query) {
      this.logger.error(`🔍 Failed Query: ${query}`);
    }
    if (error.stack) {
      this.logger.error(`🔍 Stack Trace: ${error.stack}`);
    }
  }

  logAuthentication(userId: string, method: string, success: boolean) {
    const icon = success ? '🔓' : '🔒';
    const status = success ? 'SUCCESS' : 'FAILED';
    this.logger.log(
      `${icon} Authentication ${status} - User: ${userId} - Method: ${method}`,
    );
  }

  logAuthorization(
    userId: string,
    resource: string,
    action: string,
    allowed: boolean,
  ) {
    const icon = allowed ? '✅' : '❌';
    const status = allowed ? 'ALLOWED' : 'DENIED';
    this.logger.log(
      `${icon} Authorization ${status} - User: ${userId} - Resource: ${resource} - Action: ${action}`,
    );
  }

  logBusinessLogic(operation: string, details: any) {
    this.logger.log(
      `💼 Business Logic - ${operation}: ${JSON.stringify(details, null, 2)}`,
    );
  }

  logPerformance(
    operation: string,
    duration: number,
    threshold: number = 1000,
  ) {
    const icon = duration > threshold ? '🐌' : '⚡';
    const level = duration > threshold ? 'warn' : 'log';
    this.logger[level](`${icon} Performance - ${operation}: ${duration}ms`);
  }

  private sanitizeData(data: any): any {
    // Create a copy to avoid modifying the original data
    const sanitized = JSON.parse(JSON.stringify(data));

    // Remove sensitive fields from logging
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'secret',
      'apiKey',
      'authorization',
      'cookie',
      'session',
      'clerk_user_id',
      'jwt',
    ];

    const removeSensitiveData = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(removeSensitiveData);
      }

      if (obj && typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (
            sensitiveFields.some((field) =>
              key.toLowerCase().includes(field.toLowerCase()),
            )
          ) {
            cleaned[key] = '[REDACTED]';
          } else if (typeof value === 'object' && value !== null) {
            cleaned[key] = removeSensitiveData(value);
          } else {
            cleaned[key] = value;
          }
        }
        return cleaned;
      }

      return obj;
    };

    return removeSensitiveData(sanitized);
  }
}
