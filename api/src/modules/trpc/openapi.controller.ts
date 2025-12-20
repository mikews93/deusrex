import { Controller, All, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createOpenApiExpressMiddleware } from 'trpc-to-openapi';
import { appRouter } from './app.router';
import { TrpcContextFactory } from './context-factory';

@Controller('api')
export class OpenApiController {
  constructor(private readonly contextFactory: TrpcContextFactory) {}

  @All('*')
  async handleOpenApiRequest(@Req() req: Request, @Res() res: Response) {
    const middleware = createOpenApiExpressMiddleware({
      router: appRouter,
      createContext: async ({ req, res, info }) => {
        return this.contextFactory.createContext({ req, res, info });
      },
      onError: (err) => {
        console.error('OpenAPI Error:', err);
      },
    });

    return middleware(req, res);
  }
}
