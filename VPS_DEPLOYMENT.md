# VPS Deployment Guide for Pegasus Frontend

## Current Setup
- **Backend**: Already running on port 3001 (container: pegasus_pegasus_1)
- **Frontend**: Will be deployed on port 3000

## Prerequisites on VPS
1. Docker and Docker Compose installed
2. Git installed
3. Your backend already running on port 3001

## Deployment Steps

### 1. Clone/Update Repository on VPS
```bash
# If first time
git clone https://github.com/yourusername/pegasus_web.git
cd pegasus_web

# If updating
cd pegasus_web
git pull origin main
```

### 2. Create Environment File
```bash
# Copy the production environment file
cp .env.production .env.production.local

# Edit if needed
nano .env.production
```

### 3. Deploy Frontend
```bash
# Make deployment script executable
chmod +x deploy-frontend.sh

# Run deployment
./deploy-frontend.sh
```

### 4. Alternative Manual Deployment
If you prefer manual deployment:

```bash
# Stop existing frontend (if any)
docker stop pegasus-frontend 2>/dev/null
docker rm pegasus-frontend 2>/dev/null

# Build and start
docker-compose build frontend
docker-compose up -d frontend

# Check status
docker ps
docker logs pegasus-frontend -f
```

## Verification

After deployment, check:

1. **Frontend**: http://37.114.41.124:3000
2. **Auth**: http://37.114.41.124:3000/auth
3. **Backend API**: http://37.114.41.124:3001 (already running)

## Troubleshooting

### Check Container Status
```bash
docker ps
docker logs pegasus-frontend -f
```

### Check Network Connectivity
```bash
# Test if frontend can reach backend
docker exec pegasus-frontend curl -I http://37.114.41.124:3001
```

### Restart Services
```bash
# Restart frontend only
docker restart pegasus-frontend

# Or rebuild and restart
docker-compose down frontend
docker-compose up -d --build frontend
```

### Check Ports
```bash
# Check what's running on ports
netstat -tlnp | grep -E ':(3000|3001)'
```

## File Structure on VPS
```
~/pegasus_web/
├── .env.production          # Environment variables
├── docker-compose.yml       # Frontend-only compose file
├── Dockerfile              # Frontend Docker config
├── deploy-frontend.sh       # Deployment script
├── package.json
├── src/
└── ...
```

## Important Notes

1. **Backend Connection**: Frontend connects to backend via http://37.114.41.124:3001
2. **Auth Endpoints**: Served by frontend on port 3000 (/api/auth/*)
3. **CORS**: Configured to allow requests between ports 3000 and 3001
4. **Environment**: Uses .env.production for production variables

## Monitoring

### View Logs
```bash
# Frontend logs
docker logs pegasus-frontend -f

# Backend logs (existing container)
docker logs pegasus_pegasus_1 -f

# All containers
docker-compose logs -f
```

### Resource Usage
```bash
docker stats
```
