# Test Suite Documentation

## Overview

This test suite provides comprehensive coverage for all API endpoints with proper authentication mocking and error handling.

## 🧪 Test Coverage

### ✅ Completed Tests

| Controller  | Endpoints Tested    | Test Count |
| ----------- | ------------------- | ---------- |
| **Clients** | All CRUD operations | 11 tests   |
| **Users**   | All CRUD operations | 11 tests   |
| **App**     | Basic functionality | 2 tests    |

### 🔄 Pending Tests

| Controller   | Status          | Priority |
| ------------ | --------------- | -------- |
| **Products** | Basic test only | High     |
| **Services** | Basic test only | High     |
| **Sales**    | Basic test only | High     |

## 🏗️ Test Structure

### Controller Test Pattern

Each controller test follows this structure:

```typescript
describe("ControllerName", () => {
  let controller: ControllerName;
  let service: ServiceName;

  // Mock data
  const mockEntity = {
    /* entity data */
  };
  const mockCreateDto = {
    /* create DTO */
  };
  const mockUpdateDto = {
    /* update DTO */
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ControllerName],
      providers: [
        {
          provide: ServiceName,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        // DatabaseService mock
      ],
    })
      .overrideGuard(ClerkGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard) // If needed
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ControllerName>(ControllerName);
    service = module.get<ServiceName>(ServiceName);
  });

  // Test cases for each endpoint
  describe("create", () => {
    it("should create a new entity", async () => {
      // Test implementation
    });

    it("should handle service errors", async () => {
      // Error handling test
    });
  });

  // Similar for findAll, findOne, update, remove
});
```

## 🔐 Authentication Testing

### Guard Mocking

All tests mock the authentication guards to run independently:

```typescript
.overrideGuard(ClerkGuard)
.useValue({ canActivate: () => true })
.overrideGuard(RolesGuard)
.useValue({ canActivate: () => true })
```

### User Context Testing

For endpoints that use `@CurrentUser()`, tests include user context:

```typescript
const result = await controller.create(dto, { email: "test@example.com" });
```

## 📊 Test Categories

### 1. Happy Path Tests

- ✅ Successful creation
- ✅ Successful retrieval
- ✅ Successful updates
- ✅ Successful deletion

### 2. Error Handling Tests

- ✅ Service errors
- ✅ Not found scenarios
- ✅ Validation errors

### 3. Edge Cases

- ✅ Empty results
- ✅ Invalid IDs
- ✅ Missing data

## 🚀 Running Tests

### All Tests

```bash
bun test
```

### Specific Controller

```bash
bun test test/modules/clients/clients.controller.spec.ts
```

### With Coverage

```bash
bun test:cov
```

### Watch Mode

```bash
bun test:watch
```

## 📝 Adding New Tests

### 1. Create Test File

```bash
touch test/modules/[entity]/[entity].controller.spec.ts
```

### 2. Import Dependencies

```typescript
import { Test, TestingModule } from "@nestjs/testing";
import { EntityController } from "@modules/[entity]/[entity].controller";
import { EntityService } from "@modules/[entity]/[entity].service";
import { DatabaseService } from "@database/database.service";
import { ClerkGuard } from "@common/auth";
import { CreateEntityDto } from "@modules/[entity]/dto/create-[entity].dto";
import { UpdateEntityDto } from "@modules/[entity]/dto/update-[entity].dto";
```

### 3. Define Mock Data

```typescript
const mockEntity = {
  id: 1,
  // ... entity properties
};

const mockCreateDto: CreateEntityDto = {
  // ... create DTO properties
};

const mockUpdateDto: UpdateEntityDto = {
  // ... update DTO properties
};
```

### 4. Set Up Test Module

```typescript
beforeEach(async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [EntityController],
    providers: [
      {
        provide: EntityService,
        useValue: {
          create: jest.fn(),
          findAll: jest.fn(),
          findOne: jest.fn(),
          update: jest.fn(),
          remove: jest.fn(),
        },
      },
      // DatabaseService mock
    ],
  })
    .overrideGuard(ClerkGuard)
    .useValue({ canActivate: () => true })
    .compile();

  controller = module.get<EntityController>(EntityController);
  service = module.get<EntityService>(EntityService);
});
```

### 5. Add Test Cases

Follow the pattern from existing tests for each CRUD operation.

## 🎯 Best Practices

### 1. Mock Service Methods

Always mock service methods to isolate controller logic:

```typescript
jest.spyOn(service, "create").mockResolvedValue(mockEntity);
```

### 2. Test Error Scenarios

Include error handling tests:

```typescript
jest.spyOn(service, "create").mockRejectedValue(new Error("Database error"));
await expect(controller.create(dto)).rejects.toThrow("Database error");
```

### 3. Verify Service Calls

Ensure controllers call services with correct parameters:

```typescript
expect(service.create).toHaveBeenCalledWith(mockCreateDto);
```

### 4. Test Return Values

Verify controllers return expected data:

```typescript
expect(result).toEqual(mockEntity);
```

## 🔍 Debugging Tests

### 1. Run Single Test

```bash
bun test --testNamePattern="should create a new client"
```

### 2. Verbose Output

```bash
bun test --verbose
```

### 3. Debug Mode

```bash
bun test:debug
```

## 📈 Coverage Goals

- **Controller Methods**: 100%
- **Error Handling**: 100%
- **Edge Cases**: 90%+
- **Integration**: E2E tests

## 🚨 Common Issues

### 1. Type Errors

- Check DTO types match service expectations
- Use `as any` for complex mock scenarios
- Verify return types match service methods

### 2. Guard Errors

- Ensure all guards are mocked
- Check guard import paths
- Verify guard override syntax

### 3. Service Mock Errors

- Mock all service methods used by controller
- Check method signatures match
- Verify return types

## 📚 Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Testing Best Practices](https://www.typescriptlang.org/docs/handbook/testing.html)
