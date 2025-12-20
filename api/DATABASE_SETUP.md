# Database Setup Guide

This guide will help you set up the PostgreSQL database for the DeusRex API.

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js/Bun** for running the application

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE deusrex;

# Create user (optional)
CREATE USER deusrex_user WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE deusrex TO deusrex_user;

# Exit psql
\q
```

### 2. Update Environment Variables

Update your `.env` file with your database credentials:

```env
PORT=3501
DATABASE_URL=postgresql://username:password@localhost:5432/deusrex
```

Replace `username`, `password` with your actual PostgreSQL credentials.

### 3. Run Database Migrations

```bash
# Generate migration (already done)
bun run db:generate

# Push schema to database (for development)
bun run db:push

# Or run migrations (for production)
bun run db:migrate
```

### 4. Start the Application

```bash
bun run start:dev
```

## Database Schema

The application includes the following tables:

- **users**: User accounts with email, name, password, role, and active status
- **clients**: Client information with name, email, phone, address, and company
- **products**: Product catalog with name, description, SKU, price, cost, stock, and category
- **services**: Service offerings with name, description, price, duration, and category
- **sales**: Sales transactions with client, user, date, amount, status, and payment method
- **sale_items**: Individual items in sales (products or services with quantities and prices)

## Available Database Commands

- `bun run db:generate` - Generate migration files from schema changes
- `bun run db:push` - Push schema changes directly to database (development)
- `bun run db:migrate` - Run pending migrations (production)
- `bun run db:studio` - Open Drizzle Studio for database management

## API Endpoints

Once the database is set up, you can access the API documentation at:
**http://localhost:3501/v1/docs**

### Available Endpoints:

#### Users

- `POST /users` - Create a user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Clients

- `POST /clients` - Create a client
- `GET /clients` - Get all clients
- `GET /clients/:id` - Get client by ID
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

#### Products

- `POST /products` - Create a product
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

#### Services

- `POST /services` - Create a service
- `GET /services` - Get all services
- `GET /services/:id` - Get service by ID
- `PUT /services/:id` - Update service
- `DELETE /services/:id` - Delete service

#### Sales

- `POST /sales` - Create a sale
- `GET /sales` - Get all sales
- `GET /sales/:id` - Get sale by ID
- `PUT /sales/:id` - Update sale
- `DELETE /sales/:id` - Delete sale
- `GET /sales/:saleId/items` - Get sale items

## Business Logic

This API supports a complete business management system:

1. **User Management**: Staff accounts with roles and permissions
2. **Client Management**: Customer information and contact details
3. **Product Catalog**: Inventory management with pricing and stock tracking
4. **Service Catalog**: Service offerings with pricing and duration
5. **Sales Management**: Complete sales process with items and payment tracking

## Troubleshooting

### Connection Issues

- Ensure PostgreSQL is running
- Check your DATABASE_URL format
- Verify database and user exist
- Check firewall settings

### Migration Issues

- Make sure you're connected to the correct database
- Check for syntax errors in schema files
- Ensure all dependencies are installed
