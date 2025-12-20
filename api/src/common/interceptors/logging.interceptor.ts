import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggingService } from '@common/services/logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = this.getClientIp(request);
    const startTime = Date.now();

    // Log incoming request
    this.loggingService.logRequest({ method, url, ip, userAgent });

    // Log request data
    this.loggingService.logData(body, 'request');
    this.loggingService.logQueryParams(query);
    this.loggingService.logPathParams(params);

    return next.handle().pipe(
      tap((data) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = response.statusCode;

        // Log successful response
        this.loggingService.logResponse({ method, url, statusCode, duration });

        // Log response data
        this.loggingService.logData(data, 'response');
      }),
      catchError((error) => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const statusCode = error.status || error.statusCode || 500;

        // Enhanced error logging with more details
        this.loggingService.logError({
          method,
          url,
          statusCode,
          duration,
          error,
        });

        // Log additional error details if available
        if (error.name) {
          this.loggingService.logError({
            method,
            url,
            statusCode,
            duration,
            error: { ...error, name: error.name },
          });
        }

        // Log validation errors specifically
        if (error.message && error.message.includes('validation')) {
          this.loggingService.logError({
            method,
            url,
            statusCode,
            duration,
            error: { ...error, type: 'validation' },
          });
        }

        throw error;
      }),
    );
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    const connectionIp = request.connection.remoteAddress;
    const socketIp = request.socket.remoteAddress;

    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }
    if (typeof realIp === 'string') {
      return realIp;
    }
    if (typeof connectionIp === 'string') {
      return connectionIp;
    }
    if (typeof socketIp === 'string') {
      return socketIp;
    }

    return 'unknown';
  }
}
