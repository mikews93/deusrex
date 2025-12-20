# Clerk Integration Setup Guide

## Quick Start

### 1. Install Clerk Backend Package

```bash
bun add @clerk/backend
```

### 2. Configure Environment Variables

Update your `.env` file with your Clerk credentials:

```env
# Existing variables
PORT=3501
DATABASE_URL=postgresql://localhost:5432/deusrex

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_JWT_KEY=your_jwt_key_here
```

### 3. Get Your Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select existing one
3. Go to **API Keys** section
4. Copy your keys:
   - **Secret Key**: `sk_test_...`
   - **Publishable Key**: `pk_test_...`
   - **JWT Key**: Found in **JWT Templates** section

### 4. Protect Your Endpoints

#### Option A: Protect All Endpoints in a Controller

```typescript
import { UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ClerkGuard } from "../../common/auth";

@Controller("clients")
@UseGuards(ClerkGuard)
@ApiBearerAuth()
export class ClientsController {
  // All endpoints now require authentication
}
```

#### Option B: Protect Individual Endpoints

```typescript
import { UseGuards } from "@nestjs/common";
import { ClerkGuard, RolesGuard, Roles } from "../../common/auth";

@Controller("clients")
export class ClientsController {
  @Get()
  // Public endpoint - no authentication required
  async findAll() {
    return await this.clientsService.findAll();
  }

  @Post()
  @UseGuards(ClerkGuard, RolesGuard)
  @Roles("admin", "manager")
  // Protected endpoint - requires authentication and specific roles
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientsService.create(createClientDto);
  }
}
```

### 5. Access User Information

```typescript
import { CurrentUser } from '../../common/auth';

@Post()
@UseGuards(ClerkGuard)
async create(
  @Body() createClientDto: CreateClientDto,
  @CurrentUser() user: any,
) {
  console.log('User creating client:', user.email);
  console.log('User ID:', user.userId);

  return await this.clientsService.create(createClientDto);
}
```

## Testing

### 1. Test Without Authentication (Should Fail)

```bash
curl -X GET http://localhost:3501/clients
# Expected: 401 Unauthorized
```

### 2. Test With Authentication

```bash
curl -X GET http://localhost:3501/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
# Expected: 200 OK with data
```

## Available Guards and Decorators

### Guards

- `ClerkGuard`: Verifies JWT tokens
- `RolesGuard`: Checks user roles

### Decorators

- `@CurrentUser()`: Get current user info
- `@Roles('admin', 'manager')`: Define required roles

## Next Steps

1. **Set up your Clerk application** and get your API keys
2. **Update your `.env` file** with the real Clerk keys
3. **Protect your endpoints** using the guards
4. **Test the authentication** with real JWT tokens
5. **Customize role logic** in `RolesGuard` if needed

## Security Notes

- Never commit your Clerk keys to version control
- Use environment variables for all sensitive data
- Always use HTTPS in production
- Consider implementing rate limiting
- Log authentication events for monitoring
