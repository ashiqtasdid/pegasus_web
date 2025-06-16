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

# Load environment variables (filter out comments and empty lines)
set -a  # automatically export all variables
source <(grep -v '^#' .env.production | grep -v '^$')
set +a  # stop automatically exporting

echo "🔧 Building Docker images..."

# Build the frontend image
docker build -t pegasus-web:latest .

echo "🐳 Starting services with Docker Compose..."

# Stop any existing containers
docker-compose down 2>/dev/null || true

# Check if user wants frontend-only deployment
if [ "$1" == "--frontend-only" ]; then
    echo "📱 Deploying frontend only..."
    docker-compose -f docker-compose.frontend-only.yml up -d
else
    echo "🔧 Deploying with backend placeholder..."
    echo "💡 Use '--frontend-only' flag if you don't need the backend service"
    docker-compose up -d
fi

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Frontend is running on: http://localhost:3000"
    if [ "$1" != "--frontend-only" ]; then
        echo "🔧 Backend placeholder is running on: http://localhost:3000"
    fi
    echo ""
    echo "📊 Service status:"
    if [ "$1" == "--frontend-only" ]; then
        docker-compose -f docker-compose.frontend-only.yml ps
    else
        docker-compose ps
    fi
else
    echo "❌ Deployment failed! Check the logs:"
    if [ "$1" == "--frontend-only" ]; then
        docker-compose -f docker-compose.frontend-only.yml logs
    else
        docker-compose logs
    fi
    exit 1
fi

echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Frontend-only: ./deploy.sh --frontend-only"
