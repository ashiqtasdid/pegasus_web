#!/bin/bash

# Pegasus Frontend Deployment Script
# Single script to deploy frontend Docker container
# Assumes external backend is already running on port 3001

set -e

# Configuration
FRONTEND_PORT=3000
BACKEND_PORT=3001
VPS_IP="37.114.41.124"
CONTAINER_NAME="pegasus-frontend"
IMAGE_NAME="pegasus-frontend:latest"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "🚀 [PEGASUS] Frontend Deployment Started"
echo "========================================="

# Check if Docker is running
print_info "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi
print_status "Docker is running"

# Check if external backend is reachable
print_info "Checking external backend on port $BACKEND_PORT..."
if curl -s --connect-timeout 5 http://localhost:$BACKEND_PORT/health > /dev/null 2>&1; then
    print_status "External backend is reachable on port $BACKEND_PORT"
elif curl -s --connect-timeout 5 http://$VPS_IP:$BACKEND_PORT/health > /dev/null 2>&1; then
    print_status "External backend is reachable on $VPS_IP:$BACKEND_PORT"
else
    print_warning "Cannot reach external backend. Frontend will still deploy but may not function properly."
    print_warning "Make sure your backend is running on port $BACKEND_PORT"
fi

# Stop and remove existing container
print_info "Stopping existing frontend container..."
docker stop $CONTAINER_NAME 2>/dev/null || print_info "No existing container to stop"
docker rm $CONTAINER_NAME 2>/dev/null || print_info "No existing container to remove"

# Remove old image to ensure fresh build
print_info "Removing old Docker image..."
docker rmi $IMAGE_NAME 2>/dev/null || print_info "No existing image to remove"

# Build the Docker image
print_info "Building frontend Docker image..."
if ! docker build -t $IMAGE_NAME .; then
    print_error "Failed to build Docker image"
    exit 1
fi
print_status "Docker image built successfully"

# Run the container
print_info "Starting frontend container..."
if ! docker run -d \
    --name $CONTAINER_NAME \
    -p $FRONTEND_PORT:$FRONTEND_PORT \
    --env-file .env.production \
    -e NODE_ENV=production \
    -e PORT=$FRONTEND_PORT \
    -e HOSTNAME=0.0.0.0 \
    -e BACKEND_URL=http://$VPS_IP:$BACKEND_PORT \
    -e NEXT_PUBLIC_API_BASE_URL=http://$VPS_IP:$BACKEND_PORT \
    --restart unless-stopped \
    $IMAGE_NAME; then
    print_error "Failed to start frontend container"
    exit 1
fi
print_status "Frontend container started successfully"

# Wait for container to be ready
print_info "Waiting for frontend to be ready..."
for i in {1..60}; do
    if curl -s http://localhost:$FRONTEND_PORT > /dev/null 2>&1; then
        print_status "Frontend is ready and responding"
        break
    fi
    if [ $i -eq 60 ]; then
        print_error "Frontend failed to start within 60 seconds"
        print_info "Container logs:"
        docker logs $CONTAINER_NAME --tail 20
        exit 1
    fi
    sleep 2
done

# Test frontend health
print_info "Testing frontend health endpoint..."
if curl -s http://localhost:$FRONTEND_PORT/api/health > /dev/null 2>&1; then
    print_status "Frontend health check passed"
else
    print_warning "Frontend health check failed (may be normal if endpoint doesn't exist)"
fi

# Test backend connectivity through frontend
print_info "Testing frontend-to-backend connectivity..."
response=$(curl -s http://localhost:$FRONTEND_PORT/api/test-backend 2>/dev/null || echo "")
if echo "$response" | grep -q "success.*true" 2>/dev/null; then
    print_status "Frontend can successfully reach backend"
elif echo "$response" | grep -q "error" 2>/dev/null; then
    print_warning "Frontend-to-backend test returned an error:"
    echo "$response" | head -c 200
else
    print_warning "Could not test frontend-to-backend connectivity"
fi

# Show container status
print_info "Container status:"
docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

# Show logs (last 10 lines)
print_info "Recent container logs:"
docker logs $CONTAINER_NAME --tail 10

echo ""
echo "🎉 Frontend Deployment Completed!"
echo "================================="
echo "🌐 Frontend URL: http://$VPS_IP:$FRONTEND_PORT"
echo "🏠 Local URL: http://localhost:$FRONTEND_PORT"
echo "🔧 Expected Backend: http://$VPS_IP:$BACKEND_PORT"
echo "🧪 Connectivity Test: http://$VPS_IP:$FRONTEND_PORT/api/test-backend"
echo ""
echo "📋 Management Commands:"
echo "  View logs: docker logs $CONTAINER_NAME -f"
echo "  Stop: docker stop $CONTAINER_NAME"
echo "  Start: docker start $CONTAINER_NAME"
echo "  Restart: docker restart $CONTAINER_NAME"
echo "  Remove: docker rm -f $CONTAINER_NAME"
echo "  Redeploy: ./deploy.sh"
echo ""
echo "🔧 Architecture:"
echo "  ✅ Frontend: Docker container on port $FRONTEND_PORT"
echo "  🔗 Backend: External service on port $BACKEND_PORT"
echo "  📡 Connection: Frontend → http://$VPS_IP:$BACKEND_PORT"
echo "================================="
