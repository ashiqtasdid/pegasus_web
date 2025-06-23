#!/bin/bash

# Production Deployment Script for Pegasus Web
# This script ensures environment variables are properly configured for production

echo "🚀 Starting Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root."
    exit 1
fi

# Backup current .env.local if it exists
if [ -f ".env.local" ]; then
    echo "📦 Backing up current .env.local to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Copy production environment variables
echo "🔧 Setting up production environment variables..."
cp .env.production .env.local

# Verify environment variables
echo "✅ Verifying environment configuration..."
echo "NODE_ENV: $(grep NODE_ENV .env.local)"
echo "NEXT_PUBLIC_API_BASE_URL: $(grep NEXT_PUBLIC_API_BASE_URL .env.local)"
echo "EXTERNAL_API_URL: $(grep EXTERNAL_API_URL .env.local)"

# Build the application
echo "🏗️  Building production application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

# Start the application
echo "🌐 Starting production server on port 3000..."
echo "📡 Make sure the external API is running on port 3001"
echo "🔗 Production URLs:"
echo "   - Frontend: http://37.114.41.124:3000"
echo "   - External API: http://37.114.41.124:3001"
echo ""

npm start
