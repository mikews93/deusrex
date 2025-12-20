# tRPC Setup Documentation

This document explains how tRPC is set up to connect your NestJS backend with your React frontend.

## Backend Setup (NestJS)

### 1. Dependencies

```bash
bun add @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod drizzle-zod
```

### 2. File Structure

```
api/src/trpc/
├── trpc.ts              # tRPC initialization and middleware
├── context.ts           # Context with Clerk authentication
├── routers/
│   ├── _app.ts         # Main app router
│   ├── auth.ts         # Authentication router
│   └── patients.ts     # Patients router
└── modules/trpc/
    ├── trpc.controller.ts  # NestJS controller for tRPC
    └── trpc.module.ts      # NestJS module

api/src/database/
├── schemas/
│   ├── patients.schema.ts    # Drizzle schema
│   ├── users.schema.ts       # Drizzle schema
│   └── zod-schemas.ts        # Auto-generated Zod schemas
└── types.ts                  # TypeScript types + Zod schemas
```

### 3. Key Features

#### Authentication Integration

- Uses Clerk JWT tokens for authentication
- Automatically extracts user and organization context
- Provides middleware for protected routes

#### Organization Context

- Automatically scopes data to the user's current organization
- Uses `organizationProcedure` for organization-scoped operations

#### Type Safety

- Full end-to-end type safety between frontend and backend
- **Drizzle Schema Types**: Automatic type inference from database schemas
- **Auto-generated Zod Schemas**: Using `drizzle-zod` for automatic validation
- Zod validation for all inputs
- Automatic TypeScript inference
- Shared types between frontend and backend

## Frontend Setup (React)

### 1. Dependencies

```bash
bun add @trpc/client @trpc/react-query @trpc/server @tanstack/react-query zod
```

### 2. File Structure

```
client/src/
├── lib/
│   ├── trpc.ts         # tRPC React client
│   └── trpc-client.ts  # Client configuration
├── types/
│   └── database.ts     # Shared database types from backend
└── providers/
    └── TrpcProvider.tsx # tRPC provider with Clerk integration
```

### 3. Usage Example

```tsx
import { trpc } from "@/lib/trpc";
import type { Patient } from "@/types/database";
import { patientInsertSchema } from "@/types/database";

function PatientsPage() {
  // Query data with full type safety
  const { data: patients, isLoading, error } = trpc.patients.getAll.useQuery();

  // Mutations with proper typing
  const createPatient = trpc.patients.create.useMutation();

  const handleCreate = async (patientData: any) => {
    // Validate with auto-generated Zod schema
    const validatedData = patientInsertSchema.parse(patientData);
    await createPatient.mutateAsync(validatedData);
  };

  return (
    <div>
      {patients?.map((patient: Patient) => (
        <div key={patient.id}>
          {patient.firstName} {patient.lastName}
        </div>
      ))}
    </div>
  );
}
```

## Available Routers

### Auth Router (`/trpc/auth`)

- `me` - Get current user information
- `myOrganizations` - Get user's organizations
- `currentOrganization` - Get current organization context

### Patients Router (`/trpc/patients`)

- `getAll` - Get all patients for current organization
- `getById` - Get patient by ID
- `create` - Create new patient
- `update` - Update patient
- `delete` - Delete patient
- `search` - Search patients

## Authentication Flow

1. User signs in with Clerk
2. Frontend gets JWT token from Clerk
3. tRPC automatically includes token in requests
4. Backend validates token and extracts user context
5. User and organization information is available in all procedures

## Benefits

1. **Type Safety**: Full TypeScript support across the stack
2. **Drizzle Schema Types**: Automatic type inference from database schemas
3. **Automatic Validation**: Zod schemas validate all inputs
4. **Authentication**: Seamless Clerk integration
5. **Organization Scoping**: Automatic data isolation
6. **Developer Experience**: Excellent IntelliSense and error messages
7. **Performance**: Built-in caching and optimistic updates
8. **Shared Types**: Single source of truth for database types

## Drizzle Type Extraction & Auto-Generated Zod Schemas

### Backend Types (`api/src/database/types.ts`)

```typescript
import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { patients } from "./schemas/patients.schema";

// Automatically inferred types from Drizzle schemas
export type Patient = InferSelectModel<typeof patients>;
export type NewPatient = InferInsertModel<typeof patients>;
```

### Auto-Generated Zod Schemas (`api/src/database/schemas/zod-schemas.ts`)

```typescript
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { patients } from "./patients.schema";

// Auto-generated Zod schemas from Drizzle schemas
export const patientSelectSchema = createSelectSchema(patients);
export const patientInsertSchema = createInsertSchema(patients);
```

### Frontend Types (`client/src/types/database.ts`)

```typescript
// Re-export types and Zod schemas from the backend
export type {
  Patient,
  NewPatient,
  User,
  NewUser, // ... all other types
} from "../../../api/src/database/types";

export {
  patientSelectSchema,
  patientInsertSchema, // ... all other Zod schemas
} from "../../../api/src/database/types";
```

### Benefits of Drizzle Integration

1. **Single Source of Truth**: Database schema is the authoritative source
2. **Automatic Updates**: Types and schemas update automatically when schema changes
3. **Type Safety**: Full TypeScript support with exact database types
4. **Auto-Generated Validation**: Zod schemas automatically generated from Drizzle schemas
5. **No Manual Maintenance**: No need to manually sync interfaces or validation schemas
6. **Insert vs Select Types**: Separate types for insert and select operations
7. **Runtime Validation**: Zod schemas provide runtime validation for all inputs

## Next Steps

1. Add more routers for other entities (appointments, medical records, etc.)
2. Implement real-time subscriptions if needed
3. Add more complex queries with filtering and pagination
4. Implement optimistic updates for better UX
5. Create more shared type utilities for common operations
