# Next.js API Route Testing Guide

## Overview

This guide provides comprehensive testing examples for the actual API routes implemented in the Pegasus Next.js application. The frontend runs on port 3000 and includes these API routes.

## Base Configuration

```bash
# Base URL for Next.js API routes
BASE_URL="http://localhost:3000"
API_BASE_URL="http://localhost:3000/api"

# Environment Variables Required
MONGODB_URI=mongodb+srv://ashiqtasdid5:19158417EfS@node1.gorjpgk.mongodb.net/?retryWrites=true&w=majority&appName=node1
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
PORT=3000
```

---

## Actual Next.js API Routes

Based on the file structure, here are the **actual** API routes available:

### 1. Authentication Routes
**POST** `/api/auth/[...all]`
- Handles all Better Auth endpoints (sign-in, sign-up, etc.)

### 2. Plugin Management Routes

#### 2.1 Generate Plugin
**POST** `/api/plugin/generate`

```bash
curl -X POST $API_BASE_URL/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple teleport command plugin",
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .
```

#### 2.2 Get Plugin Files
**POST** `/api/plugin/files`

```bash
curl -X POST $API_BASE_URL/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .
```

#### 2.3 Read Plugin
**POST** `/api/plugin/read`

```bash
curl -X POST $API_BASE_URL/plugin/read \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .
```

#### 2.4 Recompile Plugin
**POST** `/api/plugin/recompile`

```bash
curl -X POST $API_BASE_URL/plugin/recompile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .
```

#### 2.5 Download Plugin JAR
**GET** `/api/plugin/download/[userId]/[pluginName]`

```bash
curl -O $API_BASE_URL/plugin/download/test-user-123/TeleportTest
```

#### 2.6 Get Download Information
**GET** `/api/plugin/download-info/[userId]/[pluginName]`

```bash
curl -X GET $API_BASE_URL/plugin/download-info/test-user-123/TeleportTest | jq .
```

### 3. Plugins Collection Routes

#### 3.1 List All Plugins
**GET** `/api/plugins`

```bash
curl -X GET $API_BASE_URL/plugins | jq .
```

#### 3.2 Create Plugin Entry
**POST** `/api/plugins`

```bash
curl -X POST $API_BASE_URL/plugins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestPlugin",
    "description": "A test plugin"
  }' | jq .
```

#### 3.3 Get Specific Plugin
**GET** `/api/plugins/[id]`

```bash
curl -X GET $API_BASE_URL/plugins/plugin-id-123 | jq .
```

#### 3.4 Update Plugin
**PUT** `/api/plugins/[id]`

```bash
curl -X PUT $API_BASE_URL/plugins/plugin-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description"
  }' | jq .
```

#### 3.5 Delete Plugin
**DELETE** `/api/plugins/[id]`

```bash
curl -X DELETE $API_BASE_URL/plugins/plugin-id-123 | jq .
```

#### 3.6 List User Plugins
**GET** `/api/plugins/list`

```bash
curl -X GET $API_BASE_URL/plugins/list | jq .
```

#### 3.7 Sync Plugins
**POST** `/api/plugins/sync`

```bash
curl -X POST $API_BASE_URL/plugins/sync \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

#### 3.8 Get Plugin Statistics
**GET** `/api/plugins/stats`

```bash
curl -X GET $API_BASE_URL/plugins/stats | jq .
```

### 4. Chat System Routes

#### 4.1 Process Chat Message
**POST** `/api/chat/message`

```bash
curl -X POST $API_BASE_URL/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me create a plugin",
    "username": "testuser"
  }' | jq .
```

### 5. User Management Routes

#### 5.1 Get User Token Usage
**GET** `/api/user/token-usage`

```bash
curl -X GET $API_BASE_URL/user/token-usage | jq .
```

#### 5.2 Get User Profile
**GET** `/api/user/profile`

```bash
curl -X GET $API_BASE_URL/user/profile | jq .
```

#### 5.3 Update User Profile
**PUT** `/api/user/profile`

```bash
curl -X PUT $API_BASE_URL/user/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }' | jq .
```

#### 5.4 Change Password
**POST** `/api/user/change-password`

```bash
curl -X POST $API_BASE_URL/user/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpass",
    "newPassword": "newpass"
  }' | jq .
```

#### 5.5 Get User Settings
**GET** `/api/user/settings`

```bash
curl -X GET $API_BASE_URL/user/settings | jq .
```

#### 5.6 Update User Settings
**PUT** `/api/user/settings`

```bash
curl -X PUT $API_BASE_URL/user/settings \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "notifications": true
  }' | jq .
```

### 6. Backend Testing Route

#### 6.1 Test Backend Connection
**GET** `/api/test-backend`

```bash
curl -X GET $API_BASE_URL/test-backend | jq .
```

---

## Key Differences from External API

The Next.js API routes (**port 3000**) are different from the external API server routes (**port 3001**) mentioned in the original testing guide:

### Next.js Routes (Port 3000):
- Focused on frontend integration
- Authentication-aware
- User profile management
- Plugin collection management
- Chat integration

### External API Routes (Port 3001):
- 36 comprehensive routes for plugin generation
- Advanced compilation and management
- Token usage tracking
- Database operations
- File management

---

## Architecture Confirmation

**✅ CORRECT SETUP:**

1. **Frontend (Next.js)** - Port 3000:
   - Serves web UI
   - Handles authentication
   - Provides API routes for user management
   - Makes calls to external API for plugin generation

2. **External API Server** - Port 3001:
   - Handles complex plugin generation
   - Compilation and build processes
   - Token usage tracking
   - File management operations

---

## Testing Script for Next.js Routes

```bash
#!/bin/bash

API_BASE_URL="http://localhost:3000/api"

echo "=== Next.js API Routes Test ==="

# Test backend connection
echo "Testing backend connection..."
curl -s $API_BASE_URL/test-backend | jq .

# Test plugin generation
echo "Testing plugin generation..."
curl -X POST $API_BASE_URL/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple test plugin",
    "userId": "test-user",
    "pluginName": "TestPlugin"
  }' | jq .

# Test plugins list
echo "Testing plugins list..."
curl -s $API_BASE_URL/plugins | jq .

# Test plugins stats
echo "Testing plugin stats..."
curl -s $API_BASE_URL/plugins/stats | jq .

# Test user token usage
echo "Testing user token usage..."
curl -s $API_BASE_URL/user/token-usage | jq .

echo "=== Test Complete ==="
```

This guide reflects the **actual** API routes implemented in your Next.js application, which are different from the external API server routes documented in the original testing guide.
