#!/bin/bash

# Setup script for environment variables
# This script helps you create a .env file with the necessary environment variables

echo "🔧 Setting up environment variables for DeusRex API..."

# Check if .env file already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file with default values
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://localhost:5432/deusrex

# Clerk Configuration
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here

# Superadmin Configuration
SUPERADMIN_PASSWORD=SuperAdmin123!@#

# Application Configuration
PORT=3501
NODE_ENV=development
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY with your actual Clerk keys"
echo "2. Update DATABASE_URL if your database is not running on localhost:5432"
echo "3. Optionally change SUPERADMIN_PASSWORD to your preferred password"
echo ""
echo "🔑 The superadmin password is currently set to: SuperAdmin123!@#"
echo "   You can change this in the .env file or remove it to generate a random password each time."
