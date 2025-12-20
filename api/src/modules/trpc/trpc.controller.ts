import { Controller, All, Req, Res, Inject, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from '@/modules/trpc/app.router';
import { createContext } from '@/modules/trpc/context';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { TrpcContextFactory } from '@/modules/trpc/context-factory';

@Controller('trpc')
export class TrpcController {
  private readonly logger = new Logger(TrpcController.name);

  constructor(
    @Inject('DATABASE_CONNECTION')
    private readonly db: PostgresJsDatabase<
      typeof import('../../database/schema')
    >,
    private readonly contextFactory: TrpcContextFactory,
  ) {}

  @All('*')
  async handleTrpc(@Req() req: Request, @Res() res: Response) {
    // Add CORS headers
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, Accept, Origin',
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    // Add database to request for context
    (req as any).db = this.db;

    const middleware = createExpressMiddleware({
      router: appRouter,
      createContext: (opts) => createContext(opts, this.contextFactory),
      onError: ({ path, error }) => {
        this.logger.error(
          `tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
        );
        if (error.stack) {
          this.logger.error(`Stack trace: ${error.stack}`);
        }
      },
    });

    return middleware(req, res, () => {
      // If tRPC doesn't handle the request, continue to next middleware
      res.status(404).json({ error: 'Not found' });
    });
  }
}
