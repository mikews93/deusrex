import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
interface LoginRequest {
  email: string;
  password: string;
}

interface JwtResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
import { ClerkGuard } from '@common/guards/clerk.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Get user information (Clerk handles authentication)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { email: { type: 'string' }, password: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        user: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginData: LoginRequest) {
    return await this.authService.login(loginData);
  }

  @Get('me')
  @UseGuards(ClerkGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information using Clerk JWT' })
  @ApiResponse({
    status: 200,
    description: 'Current user information',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid token',
  })
  async getCurrentUser(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No token provided');
    }
    return await this.authService.validateClerkToken(token);
  }
}
