#!/bin/bash

# Pegasus Web Deployment Script

set -e

echo "🚀 Starting Pegasus Web Deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    echo "📝 Please copy .env.production.template to .env.production and fill in your production values"
    exit 1
fi

# Load environment variables
export $(cat .env.production | xargs)

echo "🔧 Building Docker images..."

# Build the frontend image
docker build -t pegasus-web:latest .

echo "🐳 Starting services with Docker Compose..."

# Stop any existing containers
docker-compose down

# Start the services
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Deployment successful!"
    echo "🌐 Frontend is running on: http://localhost:3001"
    echo "🔧 Backend should be running on: http://localhost:3000"
    echo ""
    echo "📊 Service status:"
    docker-compose ps
else
    echo "❌ Deployment failed! Check the logs:"
    docker-compose logs
    exit 1
fi

echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Update: ./deploy.sh"
