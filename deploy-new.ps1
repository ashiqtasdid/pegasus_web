# Pegasus Frontend Deployment Script (PowerShell)
# Single script to deploy frontend Docker container
# Assumes external backend is already running on port 3001

param(
    [string]$VpsIp = "37.114.41.124",
    [int]$FrontendPort = 3000,
    [int]$BackendPort = 3001
)

$ErrorActionPreference = "Stop"

# Configuration
$ContainerName = "pegasus-frontend"
$ImageName = "pegasus-frontend:latest"

# Colors for output
function Write-Success { param($Message) Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }

Write-Host "🚀 [PEGASUS] Frontend Deployment Started" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check if Docker is running
Write-Info "Checking Docker status..."
try {
    docker info | Out-Null
    Write-Success "Docker is running"
} catch {
    Write-Error "Docker is not running. Please start Docker first."
    exit 1
}

# Check if external backend is reachable
Write-Info "Checking external backend on port $BackendPort..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$BackendPort/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Success "External backend is reachable on port $BackendPort"
    }
} catch {
    try {
        $response = Invoke-WebRequest -Uri "http://${VpsIp}:$BackendPort/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "External backend is reachable on ${VpsIp}:$BackendPort"
        }
    } catch {
        Write-Warning "Cannot reach external backend. Frontend will still deploy but may not function properly."
        Write-Warning "Make sure your backend is running on port $BackendPort"
    }
}

# Stop and remove existing container
Write-Info "Stopping existing frontend container..."
try {
    docker stop $ContainerName 2>$null
    Write-Info "Stopped existing container"
} catch {
    Write-Info "No existing container to stop"
}

try {
    docker rm $ContainerName 2>$null
    Write-Info "Removed existing container"
} catch {
    Write-Info "No existing container to remove"
}

# Remove old image to ensure fresh build
Write-Info "Removing old Docker image..."
try {
    docker rmi $ImageName 2>$null
    Write-Info "Removed old image"
} catch {
    Write-Info "No existing image to remove"
}

# Build the Docker image
Write-Info "Building frontend Docker image..."
try {
    docker build -t $ImageName .
    Write-Success "Docker image built successfully"
} catch {
    Write-Error "Failed to build Docker image"
    exit 1
}

# Run the container
Write-Info "Starting frontend container..."
try {
    docker run -d `
        --name $ContainerName `
        -p "${FrontendPort}:${FrontendPort}" `
        --env-file .env.production `
        -e NODE_ENV=production `
        -e PORT=$FrontendPort `
        -e HOSTNAME=0.0.0.0 `
        -e BACKEND_URL="http://${VpsIp}:$BackendPort" `
        -e NEXT_PUBLIC_API_BASE_URL="http://${VpsIp}:$BackendPort" `
        --restart unless-stopped `
        $ImageName
    Write-Success "Frontend container started successfully"
} catch {
    Write-Error "Failed to start frontend container"
    exit 1
}

# Wait for container to be ready
Write-Info "Waiting for frontend to be ready..."
$ready = $false
for ($i = 1; $i -le 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "Frontend is ready and responding"
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $ready) {
    Write-Error "Frontend failed to start within 60 seconds"
    Write-Info "Container logs:"
    docker logs $ContainerName --tail 20
    exit 1
}

# Test frontend health
Write-Info "Testing frontend health endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Success "Frontend health check passed"
    }
} catch {
    Write-Warning "Frontend health check failed (may be normal if endpoint doesn't exist)"
}

# Test backend connectivity through frontend
Write-Info "Testing frontend-to-backend connectivity..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort/api/test-backend" -TimeoutSec 10 -ErrorAction SilentlyContinue
    $content = $response.Content | ConvertFrom-Json
    if ($content.success -eq $true) {
        Write-Success "Frontend can successfully reach backend"
    } else {
        Write-Warning "Frontend-to-backend test returned an error:"
        Write-Host ($content | ConvertTo-Json -Compress).Substring(0, [Math]::Min(200, ($content | ConvertTo-Json -Compress).Length))
    }
} catch {
    Write-Warning "Could not test frontend-to-backend connectivity"
}

# Show container status
Write-Info "Container status:"
docker ps --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}\t{{.Status}}"

# Show logs (last 10 lines)
Write-Info "Recent container logs:"
docker logs $ContainerName --tail 10

Write-Host ""
Write-Host "🎉 Frontend Deployment Completed!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "🌐 Frontend URL: http://${VpsIp}:$FrontendPort"
Write-Host "🏠 Local URL: http://localhost:$FrontendPort"
Write-Host "🔧 Expected Backend: http://${VpsIp}:$BackendPort"
Write-Host "🧪 Connectivity Test: http://${VpsIp}:$FrontendPort/api/test-backend"
Write-Host ""
Write-Host "📋 Management Commands:"
Write-Host "  View logs: docker logs $ContainerName -f"
Write-Host "  Stop: docker stop $ContainerName"
Write-Host "  Start: docker start $ContainerName"
Write-Host "  Restart: docker restart $ContainerName"
Write-Host "  Remove: docker rm -f $ContainerName"
Write-Host "  Redeploy: .\deploy.ps1"
Write-Host ""
Write-Host "🔧 Architecture:"
Write-Host "  ✅ Frontend: Docker container on port $FrontendPort"
Write-Host "  🔗 Backend: External service on port $BackendPort"
Write-Host "  📡 Connection: Frontend → http://${VpsIp}:$BackendPort"
Write-Host "=================================" -ForegroundColor Green
