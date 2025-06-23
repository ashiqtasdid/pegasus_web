# Port Configuration Summary

## ✅ CONFIRMED ARCHITECTURE

### Frontend (Next.js Web Application)
- **Port**: 3000
- **Development URL**: http://localhost:3000
- **Production URL**: http://37.114.41.124:3000
- **Purpose**: Serves the web UI, authentication, and proxies API calls

### External API Server (Plugin Generation Backend)
- **Port**: 3001
- **Development URL**: http://localhost:3001
- **Production URL**: http://37.114.41.124:3001
- **Purpose**: Handles plugin generation, compilation, and management

## Configuration Files Status

### ✅ `.env.local`
- `PORT=3000` (Frontend)
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api` (Frontend uses Next.js proxy routes)
- `EXTERNAL_API_URL=http://localhost:3001` (Next.js routes forward to external API)
- `NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000` (Auth on frontend)

### ✅ `package.json`
- `"dev": "next dev --turbopack -p 3000"`
- `"start": "next start -p 3000"`

### ✅ `next.config.ts`
- Allows origins for both ports 3000 and 3001
- Environment variables correctly exposed

### ✅ Authentication Configuration
- `src/lib/auth.ts`: Points to port 3000 for auth endpoints
- `src/lib/auth-client.ts`: Points to port 3000 for auth API

### ✅ API Documentation
- Base URL correctly set to `http://localhost:3001/api`
- All examples use the external API server on port 3001

## Testing Results

✅ **Frontend Started Successfully**
- Next.js running on http://localhost:3000
- Turbopack compilation successful
- No startup errors

## API Endpoints

The frontend on port 3000 provides proxy routes that forward to the external server on port 3001:
- Plugin Generation: `http://localhost:3000/api/plugin/generate` → `http://localhost:3001/plugin/generate`
- Token Usage: `http://localhost:3000/api/user/token-usage` → `http://localhost:3001/user/{userId}/token-usage`
- Chat Messages: `http://localhost:3000/api/chat/message` → `http://localhost:3001/chat/message`
- All other documented endpoints follow the same pattern: `http://localhost:3000/api/*` → `http://localhost:3001/*`

## Production Deployment

For production, the same proxy architecture applies:
- Frontend: `http://37.114.41.124:3000` (serves web UI and API proxy routes)
- External API: `http://37.114.41.124:3001` (plugin generation backend)
- Frontend proxy routes forward to: `http://37.114.41.124:3001`
- Environment variables are configured in `.env.production` for production URLs

## ✅ Production Environment Variables

### `.env.production`
- `NEXT_PUBLIC_API_BASE_URL=http://37.114.41.124:3000/api` (Frontend proxy routes)
- `EXTERNAL_API_URL=http://37.114.41.124:3001` (Next.js routes forward to external API)
- All other production URLs use `37.114.41.124` instead of `localhost`

All configurations are now properly aligned with this architecture.
