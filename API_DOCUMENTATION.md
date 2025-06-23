# Pegasus Minecraft Plugin Generator API Documentation

## Overview

The Pegasus API provides comprehensive endpoints for generating, compiling, and managing Minecraft plugins using AI-powered code generation. All API calls that use AI services include robust token usage tracking and error handling.

## Architecture

**Frontend (Next.js Web App):**
- **Development**: `http://localhost:3000`
- **Production**: `http://37.114.41.124:3000`

**External API Server (Plugin Generation Backend):**
- **Development**: `http://localhost:3001`
- **Production**: `http://37.114.41.124:3001`

## Base URL
```
http://localhost:3001/api
```

**Production:**
```
http://37.114.41.124:3001/api
```

## Authentication
Currently, the API does not require authentication. User identification is handled through `userId` parameters.

## Token Usage Tracking

All endpoints that interact with AI services (OpenRouter API) automatically track token usage per user. Token usage information is returned in the response and stored in the database for each user.

### Token Usage Response Format
```json
{
  "tokenUsage": {
    "promptTokens": 150,
    "completionTokens": 500,
    "totalTokens": 650,
    "requestCount": 5,
    "tokensUsedThisRequest": 650
  }
}
```

---

## Table of Contents

1. [Core Application Endpoints](#core-application-endpoints)
2. [Plugin Generation Endpoints](#plugin-generation-endpoints)
3. [Plugin Compilation Endpoints](#plugin-compilation-endpoints)
4. [Plugin Management Endpoints](#plugin-management-endpoints)
5. [Plugin Download Endpoints](#plugin-download-endpoints)
6. [Chat System Endpoints](#chat-system-endpoints)
7. [Chat Plugin Management Endpoints](#chat-plugin-management-endpoints)
8. [Plugin File Management Endpoints](#plugin-file-management-endpoints)
9. [Database Integration Endpoints](#database-integration-endpoints-mongodb)
10. [Token Usage Endpoints](#token-usage-endpoints)
11. [Error Handling](#error-handling)
12. [Development and Testing](#development-and-testing)

---

## Core Application Endpoints

### 1. Application Root
**GET** `/`

Redirects to the main web application.

**Response:** 302 Redirect to `/app`

---

### 2. Web Application UI
**GET** `/app`

Serves the main web application interface.

**Response:** HTML file (index.html)

---

### 3. Health Check (Detailed)
**GET** `/health`

Returns detailed health information including uptime, memory usage, and system information.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-23T10:30:00Z",
  "uptime": {
    "seconds": 3661,
    "human": "1h 1m 1s"
  },
  "memory": {
    "used": 45.2,
    "total": 128.0,
    "external": 12.1
  },
  "version": "v18.17.0",
  "platform": "linux",
  "pid": 12345
}
```

---

### 4. Health Check (Simple)
**GET** `/health/simple`

Returns basic health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-23T10:30:00Z"
}
```

---

## Plugin Generation Endpoints

### 5. Generate Plugin (Primary Endpoint)
**POST** `/plugin/generate`

Generates a complete Minecraft plugin with optional auto-compilation and returns token usage.

**Request Body:**
```json
{
  "prompt": "Create a plugin that adds magic spells with custom effects",
  "userId": "user123",
  "name": "MagicSpells",
  "autoCompile": true,
  "complexity": 7
}
```

**Parameters:**
- `prompt` (required): Description of the plugin to generate
- `userId` (required): User identifier for tracking
- `name` (optional): Plugin name (auto-generated if not provided)
- `autoCompile` (optional, default: true): Whether to compile after generation
- `complexity` (optional, default: 5, range: 1-10): Plugin complexity level

**Response:**
```json
{
  "result": "Plugin generated and compiled successfully!",
  "tokenUsage": {
    "promptTokens": 150,
    "completionTokens": 500,
    "totalTokens": 650,
    "requestCount": 5,
    "tokensUsedThisRequest": 650
  }
}
```

---

### 6. Generate Code Only (AI Service)
**POST** `/ai/generate-code`

Generates plugin code without compilation and returns token usage if userId is provided.

**Request Body:**
```json
{
  "prompt": "Create a teleportation command with cooldown",
  "pluginName": "TeleportPlugin",
  "userId": "user123"
}
```

**Parameters:**
- `prompt` (required): Code generation prompt
- `pluginName` (optional, default: "CustomPlugin"): Name for the plugin
- `userId` (optional): User ID for token tracking

**Response:**
```json
{
  "enhancedPrompt": "Enhanced prompt with Minecraft plugin context...",
  "pluginProject": {
    "name": "TeleportPlugin",
    "files": [
      {
        "path": "src/main/java/com/teleport/Main.java",
        "content": "// Generated Java code..."
      }
    ],
    "dependencies": ["org.bukkit:bukkit:1.20-R0.1-SNAPSHOT"],
    "metadata": {
      "version": "1.0.0",
      "author": "Pegasus AI",
      "apiVersion": "1.20"
    }
  },
  "tokenUsage": {
    "promptTokens": 100,
    "completionTokens": 300,
    "totalTokens": 400,
    "requestCount": 3,
    "tokensUsedThisRequest": 400
  }
}
```

---

### 7. Generate and Compile Plugin
**POST** `/plugin/generate-and-compile`

Alternative endpoint for plugin generation with compilation.

**Request Body:**
```json
{
  "prompt": "Create a custom shop plugin",
  "userId": "user123",
  "name": "ShopPlugin",
  "compile": true,
  "complexity": 6
}
```

**Response:**
```json
{
  "result": "Plugin generated and compiled successfully!"
}
```

---

### 8. Generate Plugin Only (No Compilation)
**POST** `/plugin/generate-only`

Generates plugin code without attempting compilation.

**Request Body:**
```json
{
  "prompt": "Create a custom economy plugin",
  "userId": "user123",
  "name": "EconomyPlugin",
  "complexity": 8
}
```

**Response:**
```json
{
  "result": "Plugin generated successfully (no compilation attempted)"
}
```

---

## Plugin Compilation Endpoints

### 9. Compile Plugin (Simple)
**POST** `/plugin/compile-simple`

Compiles an existing plugin project.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compilation successful",
  "jarPath": "/path/to/plugin.jar",
  "errors": [],
  "buildTime": 5.2
}
```

---

### 10. Compile Plugin by Path
**POST** `/plugin/compile-path`

Compiles a plugin using a specific project path.

**Request Body:**
```json
{
  "projectPath": "/path/to/plugin/project"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Compilation successful",
  "jarPath": "/path/to/plugin.jar"
}
```

---

### 11. Compile with Auto-Fix
**POST** `/plugin/compile`

Compiles a plugin with automatic error fixing.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin",
  "maxFixAttempts": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plugin compiled successfully after 2 auto-fix attempts",
  "compilationResult": {
    "success": true,
    "jarPath": "/path/to/plugin.jar"
  },
  "fixAttempted": true,
  "fixIterations": 2,
  "fixOperationsApplied": 3,
  "totalAttempts": 3
}
```

---

### 12. Recompile with Auto-Fix
**POST** `/plugin/recompile`

Recompiles an existing plugin with automatic error fixing.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin",
  "maxFixAttempts": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plugin recompiled successfully after auto-fix",
  "fixAttempted": true,
  "fixIterations": 1,
  "totalAttempts": 2
}
```

---

## Plugin Management Endpoints

### 13. Get Plugin Status
**POST** `/plugin/status`

Checks the compilation status and JAR availability of a plugin.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "hasTarget": true,
  "hasJar": true,
  "jarFiles": ["MyPlugin-1.0.jar"],
  "lastModified": "2025-06-23T10:30:00Z"
}
```

---

### 14. Clean Plugin Project
**POST** `/plugin/clean`

Cleans the build artifacts of a plugin project.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Project cleaned successfully"
}
```

---

### 15. Fix Plugin Errors
**POST** `/plugin/fix-errors`

Attempts to automatically fix compilation errors in a plugin.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin",
  "maxIterations": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Errors fixed successfully",
  "fixAttempted": true,
  "iterations": 3,
  "operationsApplied": 5
}
```

---

### 16. Read Plugin from Disk
**POST** `/plugin/read`

Reads plugin project information from disk.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "projectExists": true,
  "pluginProject": {
    "name": "MyPlugin",
    "files": [
      {
        "path": "src/main/java/com/myplugin/Main.java",
        "content": "// Java code content..."
      }
    ],
    "dependencies": ["org.bukkit:bukkit:1.20-R0.1-SNAPSHOT"],
    "metadata": {
      "version": "1.0.0",
      "author": "Generated",
      "apiVersion": "1.20"
    }
  }
}
```

---

### 17. Check Plugin Exists
**POST** `/plugin/check-exists`

Checks if a plugin project exists on disk.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "exists": true,
  "hasCompiledJar": true,
  "projectPath": "/path/to/plugin",
  "lastModified": "2025-06-23T10:30:00Z"
}
```

---

## Plugin Download Endpoints

### 18. Download Plugin JAR
**GET** `/plugin/download/:userId/:pluginName`

Downloads the compiled JAR file for a plugin.

**Parameters:**
- `userId`: User identifier
- `pluginName`: Name of the plugin

**Response:** Binary JAR file download

**Example:**
```bash
curl -O http://localhost:3001/api/plugin/download/user123/MyPlugin
```

---

### 19. Get Download Information
**GET** `/plugin/download-info/:userId/:pluginName`

Gets information about downloadable plugin JAR.

**Parameters:**
- `userId`: User identifier
- `pluginName`: Name of the plugin

**Response:**
```json
{
  "available": true,
  "jarFile": "MyPlugin-1.0.jar",
  "fileSize": 245760,
  "lastModified": "2025-06-23T10:30:00Z",
  "downloadUrl": "/plugin/download/user123/MyPlugin"
}
```

---

## Chat System Endpoints

### 20. Process Chat Message (Primary Chat Endpoint)
**POST** `/chat/message`

Processes chat messages with AI intent analysis and returns token usage.

**Request Body:**
```json
{
  "message": "Help me create a plugin for custom enchantments",
  "username": "player123",
  "pluginName": "MyPlugin"
}
```

**Parameters:**
- `message` (required): Chat message text
- `username` (required): Username for tracking
- `pluginName` (optional): Associated plugin name

**Response:**
```json
{
  "success": true,
  "response": "I'll help you create a custom enchantments plugin...",
  "intent": "plugin_help",
  "actions": ["provide_guidance"],
  "pluginName": "MyPlugin",
  "tokenUsage": {
    "promptTokens": 50,
    "completionTokens": 200,
    "totalTokens": 250,
    "requestCount": 1,
    "tokensUsedThisRequest": 250
  }
}
``` 

---

### 21. Get Chat History
**POST** `/chat/history`

Retrieves chat history for a user.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin",
  "limit": 50,
  "offset": 0,
  "startDate": "2025-01-01",
  "endDate": "2025-06-23"
}
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "message": "Help with my plugin",
      "response": "I can help you...",
      "timestamp": "2025-06-23T10:30:00Z"
    }
  ],
  "total": 25,
  "hasMore": false
}
```

---

### 22. Get Chat History Statistics
**POST** `/chat/history/stats`

Gets statistics about chat history for a user.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalMessages": 50,
    "avgResponseTime": 1.2,
    "mostActiveDay": "2025-06-23",
    "commonIntents": ["plugin_help", "code_generation"]
  }
}
```

---

### 23. Delete Chat History
**POST** `/chat/history/delete`

Deletes chat history for a user.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "success": true,
  "deletedCount": 25,
  "message": "Deleted 25 chat history entries"
}
```

---

## Chat Plugin Management Endpoints

### 24. Check User Has Plugin
**POST** `/chat/check-user-plugin`

Checks if a user has access to a specific plugin.

**Request Body:**
```json
{
  "pluginName": "MyPlugin",
  "username": "player123"
}
```

**Response:**
```json
{
  "success": true,
  "hasPlugin": true,
  "pluginName": "MyPlugin",
  "username": "player123",
  "message": "User player123 has plugin MyPlugin"
}
```

---

### 25. Get User Plugins
**POST** `/chat/get-user-plugins`

Gets list of plugins associated with a user.

**Request Body:**
```json
{
  "username": "player123"
}
```

**Response:**
```json
{
  "success": true,
  "username": "player123",
  "plugins": ["MagicSpells", "TeleportPlugin", "EconomyPlugin"],
  "count": 3
}
```

---

### 26. Add Plugin to User
**POST** `/chat/add-user-plugin`

Associates a plugin with a user.

**Request Body:**
```json
{
  "pluginName": "NewPlugin",
  "username": "player123"
}
```

**Response:**
```json
{
  "success": true,
  "pluginName": "NewPlugin",
  "username": "player123",
  "message": "Plugin NewPlugin added to user player123"
}
```

---

### 27. Remove Plugin from User
**POST** `/chat/remove-user-plugin`

Removes plugin association from a user.

**Request Body:**
```json
{
  "pluginName": "OldPlugin",
  "username": "player123"
}
```

**Response:**
```json
{
  "success": true,
  "pluginName": "OldPlugin",
  "username": "player123",
  "message": "Plugin OldPlugin removed from user player123"
}
```

---

## Plugin File Management Endpoints

### 28. Get Plugin Files
**POST** `/plugin/files`

Retrieves plugin files for Monaco Editor or code viewing.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "success": true,
  "files": {
    "src/main/java/com/myplugin/Main.java": "// Java code content...",
    "src/main/resources/plugin.yml": "name: MyPlugin\nversion: 1.0...",
    "pom.xml": "<?xml version=\"1.0\"?>..."
  }
}
```

---

### 29. Clear Plugin Files Cache
**POST** `/plugin/clear-cache`

Clears the plugin files cache.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cache cleared for plugin \"MyPlugin\" by user \"user123\""
}
```

---

### 30. Get Cache Statistics
**GET** `/plugin/cache-stats`

Gets statistics about the plugin files cache.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalEntries": 15,
    "cacheKeys": ["user123:MyPlugin", "user456:AnotherPlugin"],
    "cacheSize": 15
  }
}
```

---

## Database Integration Endpoints (MongoDB)

### 31. Get Plugin from Database
**POST** `/plugin/db/get`

Retrieves a plugin from MongoDB.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "success": true,
  "plugin": {
    "_id": "plugin_id_123",
    "userId": "user123",
    "pluginName": "MyPlugin",
    "description": "A custom Minecraft plugin",
    "minecraftVersion": "1.20",
    "dependencies": [],
    "metadata": {
      "author": "Pegasus AI",
      "version": "1.0.0"
    },
    "totalFiles": 5,
    "totalSize": 15360,
    "createdAt": "2025-06-23T10:00:00Z",
    "updatedAt": "2025-06-23T10:30:00Z"
  },
  "files": [
    {
      "path": "src/main/java/com/myplugin/Main.java",
      "content": "// Java code...",
      "size": 2048
    }
  ]
}
```

---

### 32. List User Plugins from Database
**POST** `/plugin/db/list`

Gets all plugins for a user from MongoDB.

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "plugins": [
    {
      "_id": "plugin_id_123",
      "userId": "user123",
      "pluginName": "MyPlugin",
      "totalFiles": 5,
      "totalSize": 15360,
      "createdAt": "2025-06-23T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

### 33. Sync Plugin with Database
**POST** `/plugin/db/sync`

Synchronizes a plugin from disk to MongoDB.

**Request Body:**
```json
{
  "userId": "user123",
  "pluginName": "MyPlugin",
  "description": "A custom plugin",
  "minecraftVersion": "1.20"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Plugin \"MyPlugin\" synced with database",
  "plugin": {
    "_id": "plugin_id_123",
    "userId": "user123",
    "pluginName": "MyPlugin",
    "totalFiles": 5,
    "totalSize": 15360,
    "lastSyncedAt": "2025-06-23T10:30:00Z"
  }
}
```

---

### 34. Get Database Statistics
**GET** `/plugin/db/stats`

Gets MongoDB database statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "activePlugins": 50,
    "totalUsers": 10,
    "totalFiles": 250,
    "totalSize": 1048576,
    "lastSyncAt": "2025-06-23T10:30:00Z"
  }
}
```

---

### 35. Sync All Plugins with Database
**POST** `/plugin/db/sync-all`

Bulk synchronizes all plugins with MongoDB.

**Request Body:**
```json
{
  "userId": "user123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk sync completed: 5 plugins synced",
  "syncedCount": 5,
  "errorCount": 0
}
```

---

## Token Usage Endpoints

### 36. Get User Token Usage
**GET** `/user/:userId/token-usage`

Retrieves comprehensive token usage statistics for a specific user.

**Parameters:**
- `userId`: User identifier

**Response:**
```json
{
  "userId": "user123",
  "totalTokens": 5000,
  "promptTokens": 2000,
  "completionTokens": 3000,
  "requestCount": 10,
  "dailyUsage": [
    {
      "date": "2025-06-23",
      "promptTokens": 100,
      "completionTokens": 150,
      "totalTokens": 250,
      "requestCount": 2
    }
  ],
  "monthlyUsage": [
    {
      "month": "2025-06",
      "promptTokens": 2000,
      "completionTokens": 3000,
      "totalTokens": 5000,
      "requestCount": 10
    }
  ],
  "lastRequestAt": "2025-06-23T10:30:00Z"
}
```

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

### HTTP Status Codes
- **200 OK**: Request successful
- **400 Bad Request**: Invalid request parameters
- **404 Not Found**: Resource not found (plugin, user, etc.)
- **500 Internal Server Error**: Server error or AI service error

### Error Response Format
```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-06-23T10:30:00Z"
}
```

### Common Error Types
- **INVALID_REQUEST**: Missing or invalid request parameters
- **PLUGIN_NOT_FOUND**: Requested plugin does not exist
- **COMPILATION_FAILED**: Plugin compilation errors
- **AI_SERVICE_ERROR**: OpenRouter API or AI service errors
- **TOKEN_LIMIT_EXCEEDED**: User has exceeded token limits
- **DATABASE_ERROR**: MongoDB or database connection errors

---

## Rate Limiting and Usage

- Currently, no rate limiting is implemented at the API level
- Token usage is tracked per user to monitor AI API consumption
- Consider implementing rate limiting based on token usage in production
- All AI interactions are logged for monitoring and debugging

---

## Performance and Caching

- Plugin files are cached in memory for faster access
- Cache can be cleared using `/plugin/clear-cache` endpoint
- Compilation results are stored on disk for reuse
- Database queries are optimized for common access patterns

---

## Token Usage Integration Details

- **Automatic Tracking**: Every OpenRouter API call is automatically tracked
- **Real-time Updates**: Token usage is updated immediately in the database
- **Granular Tracking**: Separate tracking for prompt tokens, completion tokens, and request counts
- **Historical Data**: Daily and monthly usage breakdowns are automatically calculated
- **User Queries**: Users can query their token usage via dedicated endpoints
- **Response Integration**: All AI-powered endpoints return current token usage in the response

For more detailed information about token usage tracking implementation, see [TOKEN_TRACKING.md](./TOKEN_TRACKING.md).

---

## Development and Testing

### Testing Endpoints

Use tools like Postman, curl, or any HTTP client to test endpoints:

```bash
# Health check
curl -X GET http://localhost:3001/api/health

# Generate plugin with token tracking
curl -X POST http://localhost:3001/api/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple teleport plugin",
    "userId": "test123",
    "name": "TeleportTest",
    "complexity": 5
  }'

# Get user token usage
curl -X GET http://localhost:3001/api/user/test123/token-usage

# Process chat message
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me create a magic plugin",
    "username": "test123"
  }'

# Generate code only
curl -X POST http://localhost:3001/api/ai/generate-code \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple command plugin",
    "pluginName": "CommandPlugin",
    "userId": "test123"
  }'

# Compile plugin
curl -X POST http://localhost:3001/api/plugin/compile-simple \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test123",
    "pluginName": "TeleportTest"
  }'
```

### Environment Configuration

Ensure proper environment variables are set:

```bash
# Required environment variables
OPENROUTER_API_KEY=your_openrouter_api_key_here
MONGODB_URI=mongodb://localhost:27017/pegasus
PORT=3001

# Optional environment variables
NODE_ENV=development
LOG_LEVEL=info
```

### API Testing with Different Tools

#### Postman Collection
Import the following JSON structure into Postman for easy testing:

```json
{
  "info": {
    "name": "Pegasus API",
    "description": "Complete API collection for Pegasus Plugin Generator"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/health"
      }
    },
    {
      "name": "Generate Plugin",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/plugin/generate",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt\": \"Create a teleport plugin\",\n  \"userId\": \"test123\",\n  \"complexity\": 5\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001/api"
    }
  ]
}
```

#### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Generate a plugin
async function generatePlugin() {
  try {
    const response = await apiClient.post('/plugin/generate', {
      prompt: 'Create a simple teleport plugin',
      userId: 'test123',
      complexity: 5
    });
    
    console.log('Plugin generated:', response.data);
    console.log('Tokens used:', response.data.tokenUsage.tokensUsedThisRequest);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

generatePlugin();
```

#### Python Example

```python
import requests
import json

base_url = 'http://localhost:3001/api'

def generate_plugin():
    data = {
        'prompt': 'Create a simple teleport plugin',
        'userId': 'test123',
        'complexity': 5
    }
    
    response = requests.post(f'{base_url}/plugin/generate', json=data)
    
    if response.status_code == 200:
        result = response.json()
        print(f"Plugin generated: {result['result']}")
        print(f"Tokens used: {result['tokenUsage']['tokensUsedThisRequest']}")
    else:
        print(f"Error: {response.text}")

generate_plugin()
```

For complete setup instructions and additional configuration options, see the main README.md file.
