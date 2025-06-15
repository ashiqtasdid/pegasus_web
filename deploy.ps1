# Pegasus Web Deployment Script (PowerShell)

Write-Host "🚀 Starting Pegasus Web Deployment..." -ForegroundColor Green

# Check if .env.production exists
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ .env.production file not found!" -ForegroundColor Red
    Write-Host "📝 Please copy .env.production.template to .env.production and fill in your production values" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔧 Building Docker images..." -ForegroundColor Blue

# Build the frontend image
docker build -t pegasus-web:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🐳 Starting services with Docker Compose..." -ForegroundColor Blue

# Stop any existing containers
docker-compose down

# Start the services
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker Compose failed!" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check if services are running
$services = docker-compose ps
if ($services -match "Up") {
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Frontend is running on: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "🔧 Backend should be running on: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Service status:" -ForegroundColor Blue
    docker-compose ps
} else {
    Write-Host "❌ Deployment failed! Check the logs:" -ForegroundColor Red
    docker-compose logs
    exit 1
}

Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Blue
Write-Host "  View logs: docker-compose logs -f" -ForegroundColor White
Write-Host "  Stop services: docker-compose down" -ForegroundColor White
Write-Host "  Restart: docker-compose restart" -ForegroundColor White
Write-Host "  Update: .\deploy.ps1" -ForegroundColor White
