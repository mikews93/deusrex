# Clerk Authentication Integration

This directory contains the authentication components for integrating Clerk with your NestJS application.

## Components

### Guards

- **`ClerkGuard`**: Verifies JWT tokens from Clerk and extracts user information
- **`RolesGuard`**: Provides role-based access control

### Decorators

- **`@CurrentUser()`**: Extracts current user information from the request
- **`@Roles(...roles)`**: Defines required roles for endpoints

## Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_JWT_KEY=your_clerk_jwt_key_here
```

### 2. Protecting Controllers

#### Basic Authentication (All endpoints require login)

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

#### Role-Based Protection

```typescript
import { UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ClerkGuard, RolesGuard, Roles } from "../../common/auth";

@Controller("clients")
@UseGuards(ClerkGuard, RolesGuard)
@ApiBearerAuth()
export class ClientsController {
  @Post()
  @Roles("admin", "manager") // Only admin and manager can create clients
  async create(@Body() createClientDto: CreateClientDto) {
    return await this.clientsService.create(createClientDto);
  }

  @Get()
  // No @Roles decorator - any authenticated user can read
  async findAll() {
    return await this.clientsService.findAll();
  }

  @Delete(":id")
  @Roles("admin") // Only admin can delete
  async remove(@Param("id") id: number) {
    return await this.clientsService.remove(id);
  }
}
```

### 3. Accessing User Information

```typescript
import { CurrentUser } from "../../common/auth";

@Controller("clients")
@UseGuards(ClerkGuard)
export class ClientsController {
  @Post()
  async create(
    @Body() createClientDto: CreateClientDto,
    @CurrentUser() user: any
  ) {
    console.log("User creating client:", user.email);
    console.log("User ID:", user.userId);

    // You can use user information in your business logic
    return await this.clientsService.create(createClientDto);
  }
}
```

### 4. User Information Structure

The `@CurrentUser()` decorator provides:

```typescript
interface CurrentUser {
  userId: string; // Clerk user ID
  email: string; // User's email
  firstName: string; // User's first name
  lastName: string; // User's last name
  imageUrl: string; // User's profile image
}
```

## Usage Examples

### Public Endpoints (No Authentication)

```typescript
@Controller("public")
export class PublicController {
  @Get("health")
  getHealth() {
    return { status: "ok" };
  }
}
```

### Protected Endpoints (Authentication Required)

```typescript
@Controller("protected")
@UseGuards(ClerkGuard)
@ApiBearerAuth()
export class ProtectedController {
  @Get("profile")
  getProfile(@CurrentUser() user: any) {
    return { message: `Hello ${user.firstName}!` };
  }
}
```

### Admin-Only Endpoints

```typescript
@Controller("admin")
@UseGuards(ClerkGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  @Post("system-config")
  @Roles("admin")
  updateSystemConfig(@Body() config: any) {
    return { message: "System config updated" };
  }
}
```

### Mixed Access Levels

```typescript
@Controller("products")
@UseGuards(ClerkGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  @Get()
  // Any authenticated user can read
  findAll() {
    return this.productsService.findAll();
  }

  @Post()
  @Roles("admin", "manager")
  // Only admin and manager can create
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Delete(":id")
  @Roles("admin")
  // Only admin can delete
  remove(@Param("id") id: number) {
    return this.productsService.remove(id);
  }
}
```

## Testing Protected Endpoints

### 1. Get a JWT Token from Clerk

```bash
# In your frontend or using Clerk's API
curl -X POST https://api.clerk.com/v1/sessions \
  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_123"}'
```

### 2. Use the Token in API Requests

```bash
curl -X GET http://localhost:3501/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Error Handling

The guards will automatically return appropriate HTTP status codes:

- **401 Unauthorized**: No token provided or invalid token
- **403 Forbidden**: User doesn't have required role

## Security Notes

1. **Always use HTTPS** in production
2. **Keep your Clerk keys secure** and never commit them to version control
3. **Validate user permissions** in your business logic, not just at the API level
4. **Consider implementing rate limiting** for additional security
5. **Log authentication events** for security monitoring

## Customization

You can customize the role checking logic in `RolesGuard` to match your application's needs:

```typescript
// In roles.guard.ts
const hasRole = requiredRoles.some((role) => {
  // Customize this logic based on your user roles
  return user.roles?.includes(role) || user.email?.includes(role);
});
```
