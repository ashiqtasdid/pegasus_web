#!/bin/bash

# Pegasus Frontend VPS Deployment Script
# This script deploys only the frontend since the backend is already running

echo "🚀 [PEGASUS] Frontend VPS Deployment Started"
echo "=============================================="

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=3001
VPS_IP="37.114.41.124"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
print_info "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi
print_status "Docker is running"

# Check if backend is running on port 3001
print_info "Checking if backend is running on port $BACKEND_PORT..."
if docker ps | grep -q ":$BACKEND_PORT->"; then
    print_status "Backend is running on port $BACKEND_PORT"
else
    print_warning "Backend not detected on port $BACKEND_PORT. Make sure it's running."
fi

# Setup production environment variables
print_info "Setting up production environment variables..."
if [ -f ".env.local" ]; then
    print_info "Backing up current .env.local to .env.local.backup"
    cp .env.local .env.local.backup
fi

if [ -f ".env.production" ]; then
    print_info "Copying production environment variables..."
    cp .env.production .env.local
    print_status "Production environment variables configured"
    
    # Verify critical environment variables
    echo "✅ Environment Configuration:"
    echo "   NODE_ENV: $(grep NODE_ENV .env.local | cut -d'=' -f2)"
    echo "   NEXT_PUBLIC_API_BASE_URL: $(grep NEXT_PUBLIC_API_BASE_URL .env.local | cut -d'=' -f2)"
    echo "   EXTERNAL_API_URL: $(grep EXTERNAL_API_URL .env.local | cut -d'=' -f2)"
else
    print_warning ".env.production not found. Using existing .env.local"
fi

# Stop existing frontend container
print_info "Stopping existing frontend container..."
docker stop pegasus-frontend 2>/dev/null || print_warning "No existing frontend container found"
docker rm pegasus-frontend 2>/dev/null || print_warning "No existing frontend container to remove"

# Build and deploy frontend
print_info "Building frontend Docker image..."
if ! docker-compose build frontend; then
    print_error "Failed to build frontend image"
    exit 1
fi
print_status "Frontend image built successfully"

print_info "Starting frontend container..."
if ! docker-compose up -d frontend; then
    print_error "Failed to start frontend container"
    exit 1
fi
print_status "Frontend container started"

# Wait a moment for container to start
sleep 5

# Check if frontend is running
print_info "Checking frontend status..."
if docker ps | grep -q "pegasus-frontend"; then
    print_status "Frontend is running successfully"
    
    # Show running containers
    print_info "Current running containers:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "==============================================="
    echo "🌐 Frontend URL: http://$VPS_IP:$FRONTEND_PORT"
    echo "🔧 Backend URL: http://$VPS_IP:$BACKEND_PORT"
    echo "🔍 Auth URL: http://$VPS_IP:$FRONTEND_PORT/auth"
    echo "📊 Token Usage API: http://$VPS_IP:$FRONTEND_PORT/api/user/token-usage"
    echo ""
    echo "📋 Quick commands:"
    echo "  View logs: docker logs pegasus-frontend -f"
    echo "  Stop: docker stop pegasus-frontend"
    echo "  Restart: docker restart pegasus-frontend"
    echo ""
    echo "🔧 API Architecture:"
    echo "  Frontend serves proxy routes that forward to backend"
    echo "  Frontend: http://$VPS_IP:$FRONTEND_PORT/api/* → Backend: http://$VPS_IP:$BACKEND_PORT/*"
    echo "==============================================="
else
    print_error "Frontend failed to start properly"
    print_info "Checking logs..."
    docker logs pegasus-frontend
    exit 1
fi
