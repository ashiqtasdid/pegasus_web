# Pegasus Development Setup

## Port Configuration

- **Frontend (Next.js)**: http://localhost:3001
- **Backend API**: http://localhost:3000

## Quick Start

1. **Start Backend API** (in your backend directory):
   ```bash
   # Your backend command here
   npm start
   # or
   node server.js
   # or whatever command starts your API on port 3000
   ```

2. **Start Frontend** (in this directory):
   ```bash
   npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:3001
   - API: http://localhost:3000

## Environment Configuration

The frontend is configured to connect to the backend API at `http://localhost:3000` via the `.env.local` file.

To change the API URL, edit `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Development Notes

- Frontend runs on port 3001 to avoid conflicts with backend on port 3000
- API calls are automatically routed to the backend
- Hot reload is enabled for both development and production builds

## Production Deployment

For production, update the `.env.local` file with your production API URL:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
```
