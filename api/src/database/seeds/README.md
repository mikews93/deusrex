# Database Seeds

This directory contains seed data for populating the database with initial data for development and testing purposes.

## What's Included

### Users

- **admin@deusrex.com** (password: `admin123`) - System Administrator with admin role
- **manager@deusrex.com** (password: `manager123`) - Business Manager with manager role
- **user@deusrex.com** (password: `user123`) - Regular User with user role

### Clients (6 sample clients)

- John Smith (Acme Corporation)
- Sarah Johnson (TechStart Inc)
- Michael Brown (GlobalTech Solutions)
- Emily Davis (Creative Agency LLC)
- David Wilson (Wilson Consulting Group)
- Lisa Anderson (Anderson Retail Chain)

### Products (8 sample products)

- Premium Laptop (\$1,299.99)
- Wireless Mouse (\$49.99)
- Mechanical Keyboard (\$149.99)
- 4K Monitor (\$399.99)
- USB-C Hub (\$79.99)
- Webcam HD (\$89.99)
- Gaming Headset (\$129.99)
- External SSD (\$199.99)

### Services (10 sample services)

- Website Development (\$2,500.00)
- Mobile App Development (\$5,000.00)
- SEO Optimization (\$800.00)
- Content Creation (\$500.00)
- IT Consulting (\$150.00)
- Data Analysis (\$1,200.00)
- Cloud Migration (\$3,000.00)
- Security Audit (\$2,000.00)
- Training Session (\$300.00)
- Maintenance Support (\$100.00)

## How to Run

### Prerequisites

1. Make sure your database is running and accessible
2. Set the `DATABASE_URL` environment variable or it will default to `postgresql://localhost:5432/deusrex`
3. Install dependencies: `npm install`

### Running the Seeds

```bash
# Run all seeds (recommended)
npm run db:seed

# Run individual entity seeds
npm run db:seed:users
npm run db:seed:clients
npm run db:seed:products
npm run db:seed:services

# Run test seed (minimal data)
npm run db:seed:test

# Or directly with ts-node
npx ts-node src/database/seeds/seed.ts
```

### Running Individual Seed Functions

You can also import and run individual seed functions:

```typescript
import { seedDatabase } from "./src/database/seeds/seed";

// Run all seeds
await seedDatabase();

// Or run individual functions
import { seedUsers } from "./src/database/seeds/users.seed";
import { seedClients } from "./src/database/seeds/clients.seed";
import { seedProducts } from "./src/database/seeds/products.seed";
import { seedServices } from "./src/database/seeds/services.seed";
```

## Notes

- The seed script is idempotent - it won't create duplicates if run multiple times
- Passwords are hashed using bcrypt with 10 salt rounds
- All entities are marked as active by default
- The script includes error handling and will continue even if some records already exist
- Service durations are specified in minutes

## Customization

To add more seed data or modify existing data:

1. Edit the arrays in the respective seed functions (`seedUsers`, `seedClients`, `seedProducts`, `seedServices`)
2. Follow the same structure as the existing data
3. Run the seed script again

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string (defaults to `postgresql://localhost:5432/deusrex`)
