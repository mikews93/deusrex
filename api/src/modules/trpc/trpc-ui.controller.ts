import { Controller, Get, Res, Logger } from '@nestjs/common';
import type { Response } from 'express';

@Controller('v1')
export class TrpcUiController {
  private readonly logger = new Logger(TrpcUiController.name);

  @Get('docs')
  async getTrpcDocs(@Res() res: Response) {
    this.logger.log(`Accessing tRPC docs. NODE_ENV: ${process.env.NODE_ENV}`);

    // Only allow in development
    // Temporarily disabled for testing
    // if (process.env.NODE_ENV !== 'development') {
    //   this.logger.warn('tRPC docs accessed in non-development environment');
    //   return res.status(404).send('Not Found');
    // }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DeusRex tRPC API Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 3rem;
            max-width: 600px;
            text-align: center;
            margin: 2rem;
        }
        .logo {
            font-size: 2.5rem;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        .subtitle {
            color: #7f8c8d;
            font-size: 1.1rem;
            margin-bottom: 2rem;
        }
        .endpoint-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1.5rem 0;
            text-align: left;
        }
        .endpoint-info h3 {
            margin: 0 0 1rem 0;
            color: #2c3e50;
        }
        .endpoint-info code {
            background: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
        }
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 1rem 2rem;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 0.5rem;
        }
        .btn:hover {
            background: #5a6fd8;
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .btn-secondary {
            background: #95a5a6;
        }
        .btn-secondary:hover {
            background: #7f8c8d;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 2rem 0;
        }
        .feature {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .feature h4 {
            margin: 0 0 0.5rem 0;
            color: #2c3e50;
        }
        .feature p {
            margin: 0;
            color: #7f8c8d;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🚀 DeusRex</div>
        <div class="subtitle">tRPC API Documentation & Testing</div>
        
        <div class="endpoint-info">
            <h3>📡 API Endpoint</h3>
            <p><strong>tRPC URL:</strong> <code>http://localhost:3501/trpc</code></p>
            <p><strong>Documentation:</strong> <code>http://localhost:3501/v1/docs</code></p>
        </div>

        <div class="features">
            <div class="feature">
                <h4>🔐 Authentication</h4>
                <p>Use Clerk JWT tokens in Authorization header</p>
            </div>
            <div class="feature">
                <h4>📊 Available Routers</h4>
                <p>Patients, Medical Records, Appointments, Products, Services, Sales, Users, Organizations</p>
            </div>
            <div class="feature">
                <h4>🛡️ Type Safety</h4>
                <p>Full TypeScript support with Zod validation</p>
            </div>
        </div>

        <a href="https://github.com/trpc/trpc/tree/main/packages/playground" class="btn" target="_blank">
            📚 tRPC Playground Docs
        </a>
        <a href="/health" class="btn btn-secondary">
            💚 Health Check
        </a>
        
        <div style="margin-top: 2rem; font-size: 0.9rem; color: #7f8c8d;">
            <p><strong>Testing Options:</strong></p>
            <ul style="text-align: left; max-width: 500px; margin: 1rem auto;">
                <li><strong>Postman/Insomnia:</strong> Use <code>http://localhost:3501/trpc</code> as your endpoint</li>
                <li><strong>cURL:</strong> Send POST requests to <code>http://localhost:3501/trpc/[procedure]</code></li>
                <li><strong>Frontend:</strong> Use the tRPC client in your React app</li>
                <li><strong>Playground:</strong> Install <code>@trpc/playground</code> locally</li>
            </ul>
        </div>
    </div>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
