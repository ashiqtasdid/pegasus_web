# Pegasus API Route Testing Guide

## Overview

This guide provides comprehensive testing examples for all 36 API routes in the Pegasus Minecraft Plugin Generator. Each route includes detailed request/response examples, error scenarios, and testing commands.

## Base Configuration

```bash
# Base URL - Next.js App with API Routes
BASE_URL="http://localhost:3000"

# Environment Variables Required
OPENROUTER_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017/pegasus
PORT=3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

---

## 1. Core Application Routes

### 1.1 Application Root
**GET** `/`

```bash
# Test Command
curl -X GET $BASE_URL/

# Expected Response
# 302 Redirect to /app
```

### 1.2 Web Application UI
**GET** `/app`

```bash
# Test Command
curl -X GET $BASE_URL/app

# Expected Response
# HTML content of index.html
```

### 1.3 Health Check (Detailed)
**GET** `/health`

```bash
# Test Command
curl -X GET $BASE_URL/health | jq .

# Expected Response
{
  "status": "healthy",
  "timestamp": "2025-06-23T15:43:29.031Z",
  "uptime": {
    "seconds": 993,
    "human": "16m 33s"
  },
  "memory": {
    "used": 32.44,
    "total": 34.95,
    "external": 20.83
  },
  "version": "v22.16.0",
  "platform": "linux",
  "pid": 20298
}
```

### 1.4 Health Check (Simple)
**GET** `/health/simple`

```bash
# Test Command
curl -X GET $BASE_URL/health/simple | jq .

# Expected Response
{
  "status": "ok",
  "timestamp": "2025-06-23T15:43:12.109Z"
}
```

---

## 2. Plugin Generation Routes

### 2.1 Generate Plugin (Primary Endpoint)
**POST** `/plugin/generate`

```bash
# Basic Test
curl -X POST $BASE_URL/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple teleport command plugin",
    "userId": "test-user-123",
    "name": "TeleportTest",
    "autoCompile": true,
    "complexity": 5
  }' \
  --max-time 300 | jq .

# Complex Plugin Test
curl -X POST $BASE_URL/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create an advanced economy plugin with shops, currency, and trading",
    "userId": "test-user-456",
    "name": "EconomyPro",
    "autoCompile": true,
    "complexity": 9
  }' \
  --max-time 300 | jq .

# Expected Response
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

# Error Cases
# Missing userId
curl -X POST $BASE_URL/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a test plugin"
  }' | jq .

# Invalid complexity (out of range 1-10)
curl -X POST $BASE_URL/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a test plugin",
    "userId": "test",
    "complexity": 15
  }' | jq .
```

### 2.2 Generate Code Only (AI Service)
**POST** `/ai/generate-code`

```bash
# With Token Tracking
curl -X POST $BASE_URL/ai/generate-code \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a command that gives players special items",
    "pluginName": "ItemGiver",
    "userId": "test-user-123"
  }' \
  --max-time 180 | jq .

# Without Token Tracking
curl -X POST $BASE_URL/ai/generate-code \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple chat formatter",
    "pluginName": "ChatFormatter"
  }' \
  --max-time 180 | jq .

# Expected Response (with userId)
{
  "enhancedPrompt": "Enhanced prompt with Minecraft plugin context...",
  "pluginProject": {
    "name": "ItemGiver",
    "files": [
      {
        "path": "src/main/java/com/itemgiver/Main.java",
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

### 2.3 Generate and Compile Plugin
**POST** `/plugin/generate-and-compile`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/generate-and-compile \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a custom shop plugin with GUI",
    "userId": "test-user-123",
    "name": "ShopGUI",
    "compile": true,
    "complexity": 7
  }' \
  --max-time 300 | jq .

# Expected Response
{
  "result": "Plugin generated and compiled successfully!"
}
```

### 2.4 Generate Plugin Only (No Compilation)
**POST** `/plugin/generate-only`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/generate-only \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a custom enchantment plugin",
    "userId": "test-user-123",
    "name": "CustomEnchants",
    "complexity": 6
  }' \
  --max-time 300 | jq .

# Expected Response
{
  "result": "Plugin generated successfully (no compilation attempted)"
}
```

---

## 3. Plugin Compilation Routes

### 3.1 Compile Plugin (Simple)
**POST** `/plugin/compile-simple`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/compile-simple \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Success Response
{
  "success": true,
  "message": "Compilation successful",
  "jarPath": "/path/to/plugin.jar",
  "errors": [],
  "buildTime": 5.2
}

# Expected Error Response
{
  "success": false,
  "error": "Plugin not found",
  "timestamp": "2025-06-23T15:43:29.031Z"
}
```

### 3.2 Compile Plugin by Path
**POST** `/plugin/compile-path`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/compile-path \
  -H "Content-Type: application/json" \
  -d '{
    "projectPath": "/home/scar/codespace/pegasus/generated/test-user-123/TeleportTest"
  }' | jq .

# Expected Response
{
  "success": true,
  "message": "Compilation successful",
  "jarPath": "/path/to/plugin.jar"
}
```

### 3.3 Compile with Auto-Fix
**POST** `/plugin/compile`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/compile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest",
    "maxFixAttempts": 5
  }' | jq .

# Expected Response
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

### 3.4 Recompile with Auto-Fix
**POST** `/plugin/recompile`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/recompile \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest",
    "maxFixAttempts": 5
  }' | jq .

# Expected Response
{
  "success": true,
  "message": "Plugin recompiled successfully after auto-fix",
  "fixAttempted": true,
  "fixIterations": 1,
  "totalAttempts": 2
}
```

---

## 4. Plugin Management Routes

### 4.1 Get Plugin Status
**POST** `/plugin/status`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/status \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
{
  "hasTarget": true,
  "hasJar": true,
  "jarFiles": ["TeleportTest-1.0.jar"],
  "lastModified": "2025-06-23T10:30:00Z"
}
```

### 4.2 Clean Plugin Project
**POST** `/plugin/clean`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/clean \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
{
  "success": true,
  "message": "Project cleaned successfully"
}
```

### 4.3 Fix Plugin Errors
**POST** `/plugin/fix-errors`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/fix-errors \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest",
    "maxIterations": 5
  }' | jq .

# Expected Response
{
  "success": true,
  "message": "Errors fixed successfully",
  "fixAttempted": true,
  "iterations": 3,
  "operationsApplied": 5
}
```

### 4.4 Read Plugin from Disk
**POST** `/plugin/read`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/read \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
{
  "projectExists": true,
  "pluginProject": {
    "name": "TeleportTest",
    "files": [
      {
        "path": "src/main/java/com/teleporttest/Main.java",
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

### 4.5 Check Plugin Exists
**POST** `/plugin/check-exists`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/check-exists \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
{
  "exists": true,
  "hasCompiledJar": true,
  "projectPath": "/path/to/plugin",
  "lastModified": "2025-06-23T10:30:00Z"
}
```

---

## 5. Plugin Download Routes

### 5.1 Download Plugin JAR
**GET** `/plugin/download/:userId/:pluginName`

```bash
# Test Command
curl -O $BASE_URL/plugin/download/test-user-123/TeleportTest

# Test with wget
wget $BASE_URL/plugin/download/test-user-123/TeleportTest

# Check if file was downloaded
ls -la TeleportTest*
```

### 5.2 Get Download Information
**GET** `/plugin/download-info/:userId/:pluginName`

```bash
# Test Command
curl -X GET $BASE_URL/plugin/download-info/test-user-123/TeleportTest | jq .

# Expected Response
{
  "available": true,
  "jarFile": "TeleportTest-1.0.jar",
  "fileSize": 245760,
  "lastModified": "2025-06-23T10:30:00Z",
  "downloadUrl": "/plugin/download/test-user-123/TeleportTest"
}
```

---

## 6. Chat System Routes

### 6.1 Process Chat Message (Primary Chat Endpoint)
**POST** `/chat/message`

```bash
# Basic Chat Test
curl -X POST $BASE_URL/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me create a plugin for custom enchantments",
    "username": "player123",
    "pluginName": "TeleportTest"
  }' \
  --max-time 120 | jq .

# Chat without Plugin Context
curl -X POST $BASE_URL/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What can you help me with?",
    "username": "player123"
  }' \
  --max-time 120 | jq .

# Expected Response
{
  "success": true,
  "response": "I'll help you create a custom enchantments plugin...",
  "intent": "plugin_help",
  "actions": ["provide_guidance"],
  "pluginName": "TeleportTest",
  "tokenUsage": {
    "promptTokens": 50,
    "completionTokens": 200,
    "totalTokens": 250,
    "requestCount": 1,
    "tokensUsedThisRequest": 250
  }
}

# Error Cases
# Missing message
curl -X POST $BASE_URL/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player123"
  }' | jq .

# Missing username
curl -X POST $BASE_URL/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Help me"
  }' | jq .
```

### 6.2 Get Chat History
**POST** `/chat/history`

```bash
# Basic History Request
curl -X POST $BASE_URL/chat/history \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player123",
    "limit": 10
  }' | jq .

# Filtered History Request
curl -X POST $BASE_URL/chat/history \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player123",
    "pluginName": "TeleportTest",
    "limit": 50,
    "offset": 0,
    "startDate": "2025-01-01",
    "endDate": "2025-06-23"
  }' | jq .

# Expected Response
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

### 6.3 Get Chat History Statistics
**POST** `/chat/history/stats`

```bash
# Test Command
curl -X POST $BASE_URL/chat/history/stats \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
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

### 6.4 Delete Chat History
**POST** `/chat/history/delete`

```bash
# Delete All History for User
curl -X POST $BASE_URL/chat/history/delete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player123"
  }' | jq .

# Delete History for Specific Plugin
curl -X POST $BASE_URL/chat/history/delete \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "player123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
{
  "success": true,
  "deletedCount": 25,
  "message": "Deleted 25 chat history entries"
}
```

---

## 7. Chat Plugin Management Routes

### 7.1 Check User Has Plugin
**POST** `/chat/check-user-plugin`

```bash
# Test Command
curl -X POST $BASE_URL/chat/check-user-plugin \
  -H "Content-Type: application/json" \
  -d '{
    "pluginName": "TeleportTest",
    "username": "player123"
  }' | jq .

# Expected Response
{
  "success": true,
  "hasPlugin": true,
  "pluginName": "TeleportTest",
  "username": "player123",
  "message": "User player123 has plugin TeleportTest"
}
```

### 7.2 Get User Plugins
**POST** `/chat/get-user-plugins`

```bash
# Test Command
curl -X POST $BASE_URL/chat/get-user-plugins \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player123"
  }' | jq .

# Expected Response
{
  "success": true,
  "username": "player123",
  "plugins": ["TeleportTest", "EconomyPro", "CustomEnchants"],
  "count": 3
}
```

### 7.3 Add Plugin to User
**POST** `/chat/add-user-plugin`

```bash
# Test Command
curl -X POST $BASE_URL/chat/add-user-plugin \
  -H "Content-Type: application/json" \
  -d '{
    "pluginName": "NewPlugin",
    "username": "player123"
  }' | jq .

# Expected Response
{
  "success": true,
  "pluginName": "NewPlugin",
  "username": "player123",
  "message": "Plugin NewPlugin added to user player123"
}
```

### 7.4 Remove Plugin from User
**POST** `/chat/remove-user-plugin`

```bash
# Test Command
curl -X POST $BASE_URL/chat/remove-user-plugin \
  -H "Content-Type: application/json" \
  -d '{
    "pluginName": "OldPlugin",
    "username": "player123"
  }' | jq .

# Expected Response
{
  "success": true,
  "pluginName": "OldPlugin",
  "username": "player123",
  "message": "Plugin OldPlugin removed from user player123"
}
```

---

## 8. Plugin File Management Routes

### 8.1 Get Plugin Files
**POST** `/plugin/files`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
{
  "success": true,
  "files": {
    "src/main/java/com/teleporttest/Main.java": "// Java code content...",
    "src/main/resources/plugin.yml": "name: TeleportTest\nversion: 1.0...",
    "pom.xml": "<?xml version=\"1.0\"?>..."
  }
}
```

### 8.2 Clear Plugin Files Cache
**POST** `/plugin/clear-cache`

```bash
# Clear Specific Plugin Cache
curl -X POST $BASE_URL/plugin/clear-cache \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
{
  "success": true,
  "message": "Cache cleared for plugin \"TeleportTest\" by user \"test-user-123\""
}
```

### 8.3 Get Cache Statistics
**GET** `/plugin/cache-stats`

```bash
# Test Command
curl -X GET $BASE_URL/plugin/cache-stats | jq .

# Expected Response
{
  "success": true,
  "stats": {
    "totalEntries": 15,
    "cacheKeys": ["test-user-123:TeleportTest", "user456:AnotherPlugin"],
    "cacheSize": 15
  }
}
```

---

## 9. Database Integration Routes (MongoDB)

### 9.1 Get Plugin from Database
**POST** `/plugin/db/get`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/db/get \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest"
  }' | jq .

# Expected Response
{
  "success": true,
  "plugin": {
    "_id": "plugin_id_123",
    "userId": "test-user-123",
    "pluginName": "TeleportTest",
    "description": "A teleport command plugin",
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
      "path": "src/main/java/com/teleporttest/Main.java",
      "content": "// Java code...",
      "size": 2048
    }
  ]
}
```

### 9.2 List User Plugins from Database
**POST** `/plugin/db/list`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/db/list \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123"
  }' | jq .

# Expected Response
{
  "success": true,
  "plugins": [
    {
      "_id": "plugin_id_123",
      "userId": "test-user-123",
      "pluginName": "TeleportTest",
      "totalFiles": 5,
      "totalSize": 15360,
      "createdAt": "2025-06-23T10:00:00Z"
    }
  ],
  "count": 1
}
```

### 9.3 Sync Plugin with Database
**POST** `/plugin/db/sync`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/db/sync \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "pluginName": "TeleportTest",
    "description": "A teleport command plugin",
    "minecraftVersion": "1.20"
  }' | jq .

# Expected Response
{
  "success": true,
  "message": "Plugin \"TeleportTest\" synced with database",
  "plugin": {
    "_id": "plugin_id_123",
    "userId": "test-user-123",
    "pluginName": "TeleportTest",
    "totalFiles": 5,
    "totalSize": 15360,
    "lastSyncedAt": "2025-06-23T10:30:00Z"
  }
}
```

### 9.4 Get Database Statistics
**GET** `/plugin/db/stats`

```bash
# Test Command
curl -X GET $BASE_URL/plugin/db/stats | jq .

# Expected Response
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

### 9.5 Sync All Plugins with Database
**POST** `/plugin/db/sync-all`

```bash
# Test Command
curl -X POST $BASE_URL/plugin/db/sync-all \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123"
  }' | jq .

# Expected Response
{
  "success": true,
  "message": "Bulk sync completed: 5 plugins synced",
  "syncedCount": 5,
  "errorCount": 0
}
```

---

## 10. Token Usage Routes

### 10.1 Get User Token Usage
**GET** `/user/:userId/token-usage`

```bash
# Test Command
curl -X GET $BASE_URL/user/test-user-123/token-usage | jq .

# Expected Response
{
  "userId": "test-user-123",
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

## Testing Scripts

### Complete API Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "=== Pegasus API Test Suite ==="

# 1. Health Checks
echo "Testing health endpoints..."
curl -s $BASE_URL/health/simple | jq .
curl -s $BASE_URL/health | jq '.status'

# 2. Plugin Generation (Small test)
echo "Testing plugin generation..."
curl -X POST $BASE_URL/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a simple hello world command",
    "userId": "test-suite-user",
    "name": "HelloTest",
    "complexity": 3
  }' \
  --max-time 180 | jq '.result'

# 3. Plugin Status
echo "Testing plugin status..."
curl -X POST $BASE_URL/plugin/status \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-suite-user",
    "pluginName": "HelloTest"
  }' | jq '.hasTarget'

# 4. Cache Stats
echo "Testing cache stats..."
curl -s $BASE_URL/plugin/cache-stats | jq '.success'

# 5. Token Usage
echo "Testing token usage..."
curl -s $BASE_URL/user/test-suite-user/token-usage | jq '.totalTokens'

echo "=== Test Suite Complete ==="
```

### Performance Test Script

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "=== Performance Test ==="

# Test response times
for i in {1..5}; do
  echo "Test $i:"
  time curl -s $BASE_URL/health/simple > /dev/null
done

# Test concurrent requests
echo "Testing concurrent health checks..."
for i in {1..10}; do
  curl -s $BASE_URL/health/simple &
done
wait

echo "=== Performance Test Complete ==="
```

---

## Error Handling Examples

### Common Error Responses

```json
// Missing required parameter
{
  "success": false,
  "error": "userId is required",
  "code": "INVALID_REQUEST",
  "timestamp": "2025-06-23T10:30:00Z"
}

// Plugin not found
{
  "success": false,
  "error": "Plugin not found",
  "code": "PLUGIN_NOT_FOUND",
  "timestamp": "2025-06-23T10:30:00Z"
}

// AI service error
{
  "success": false,
  "error": "OpenRouter API error: Rate limit exceeded",
  "code": "AI_SERVICE_ERROR",
  "timestamp": "2025-06-23T10:30:00Z"
}

// Database error
{
  "success": false,
  "error": "Failed to connect to MongoDB",
  "code": "DATABASE_ERROR",
  "timestamp": "2025-06-23T10:30:00Z"
}
```

---

## Environment Setup for Testing

### Required Environment Variables

```bash
# .env file
OPENROUTER_API_KEY=your_openrouter_api_key_here
MONGODB_URI=mongodb://localhost:27017/pegasus
PORT=3001
NODE_ENV=development

# Optional
LOG_LEVEL=info
MAX_RETRIES=3
TIMEOUT_MS=30000
```

### Dependencies

```bash
# Install required tools for testing
sudo apt-get install -y curl jq wget

# Or on macOS
brew install curl jq wget
```

---

## Monitoring and Logging

### View Application Logs

```bash
# View real-time logs
tail -f /var/log/pegasus/app.log

# Or if running with npm/node
npm run start 2>&1 | tee app.log
```

### Check System Resources

```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check running processes
ps aux | grep node
```

This comprehensive testing guide covers all 36 API routes with detailed examples, error scenarios, and testing scripts for thorough validation of the Pegasus API.
