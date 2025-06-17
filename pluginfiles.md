# Plugin Files API Routes Documentation

## Overview

This document provides comprehensive documentation for all API routes related to plugin file operations in the Pegasus system. These routes enable reading, caching, and managing plugin files for Monaco Editor integration.

## Base URL

```
http://localhost:3000
```

---

## Plugin Files Routes

### 1. Get Plugin Files

**Endpoint:** `POST /plugin/files`

**Description:** Retrieves all files from a user's plugin in Monaco Editor-compatible format with intelligent caching.

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "userId": "string",
  "pluginName": "string"
}
```

**Parameters:**
- `userId` (required): The unique identifier of the user who owns the plugin
- `pluginName` (required): The name of the plugin to retrieve files from

**Success Response (200):**
```json
{
  "success": true,
  "files": {
    "src/main/java/com/example/plugin/MainPlugin.java": "package com.example.plugin;\n\npublic class MainPlugin {\n  // code content\n}",
    "src/main/resources/plugin.yml": "name: ExamplePlugin\nversion: 1.0.0\nmain: com.example.plugin.MainPlugin",
    "pom.xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<project>...</project>",
    "README.md": "# Plugin Documentation\n\nThis plugin..."
  }
}
```

**Error Responses:**

*400 Bad Request - Missing userId:*
```json
{
  "success": false,
  "error": "userId is required and must be a non-empty string"
}
```

*400 Bad Request - Missing pluginName:*
```json
{
  "success": false,
  "error": "pluginName is required and must be a non-empty string"
}
```

*404 Not Found - Plugin doesn't exist:*
```json
{
  "success": false,
  "error": "Plugin \"PluginName\" not found for user \"userId\""
}
```

*500 Internal Server Error:*
```json
{
  "success": false,
  "error": "Failed to read plugin files: [specific error message]"
}
```

**Example Usage:**
```bash
curl -X POST http://localhost:3000/plugin/files \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "684f19962ac039c3142b1172",
    "pluginName": "SayHiOnJoin"
  }'
```

**JavaScript Example:**
```javascript
async function getPluginFiles(userId, pluginName) {
  const response = await fetch('/plugin/files', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ userId, pluginName })
  });
  
  const data = await response.json();
  
  if (data.success) {
    return data.files;
  } else {
    throw new Error(data.error);
  }
}
```

---

### 2. Clear Plugin Files Cache

**Endpoint:** `POST /plugin/clear-cache`

**Description:** Clears the plugin files cache for specific plugins, users, or the entire cache.

**Method:** `POST`

**Content-Type:** `application/json`

**Request Body Options:**

*Clear cache for specific plugin:*
```json
{
  "userId": "string",
  "pluginName": "string"
}
```

*Clear cache for all plugins by user:*
```json
{
  "userId": "string"
}
```

*Clear entire cache:*
```json
{}
```

**Success Responses:**

*Specific plugin cleared:*
```json
{
  "success": true,
  "message": "Cache cleared for plugin \"PluginName\" by user \"userId\""
}
```

*User plugins cleared:*
```json
{
  "success": true,
  "message": "Cache cleared for all plugins by user \"userId\""
}
```

*Entire cache cleared:*
```json
{
  "success": true,
  "message": "Entire plugin files cache cleared"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to clear cache"
}
```

**Example Usage:**

*Clear specific plugin cache:*
```bash
curl -X POST http://localhost:3000/plugin/clear-cache \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "684f19962ac039c3142b1172",
    "pluginName": "SayHiOnJoin"
  }'
```

*Clear all caches:*
```bash
curl -X POST http://localhost:3000/plugin/clear-cache \
  -H "Content-Type: application/json" \
  -d '{}'
```

**JavaScript Example:**
```javascript
async function clearCache(userId = null, pluginName = null) {
  const body = {};
  if (userId) body.userId = userId;
  if (pluginName) body.pluginName = pluginName;
  
  const response = await fetch('/plugin/clear-cache', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  
  return response.json();
}
```

---

### 3. Get Cache Statistics

**Endpoint:** `GET /plugin/cache-stats`

**Description:** Returns statistics about the current plugin files cache state.

**Method:** `GET`

**Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "stats": {
    "totalEntries": 3,
    "cacheKeys": [
      "684f19962ac039c3142b1172:SayHiOnJoin",
      "684f19962ac039c3142b1172:TestPlugin",
      "user456:AnotherPlugin"
    ],
    "cacheSize": 3
  }
}
```

**Response Fields:**
- `totalEntries`: Number of cached plugin entries
- `cacheKeys`: Array of cache keys in format "userId:pluginName"
- `cacheSize`: Same as totalEntries (for compatibility)

**Error Response:**
```json
{
  "success": false,
  "error": "Failed to get cache stats"
}
```

**Example Usage:**
```bash
curl http://localhost:3000/plugin/cache-stats
```

**JavaScript Example:**
```javascript
async function getCacheStats() {
  const response = await fetch('/plugin/cache-stats');
  const data = await response.json();
  
  if (data.success) {
    console.log(`Cache has ${data.stats.totalEntries} entries`);
    return data.stats;
  } else {
    throw new Error(data.error);
  }
}
```

---

## Health Check Routes

### 4. Detailed Health Check

**Endpoint:** `GET /health`

**Description:** Returns comprehensive system health information including uptime, memory usage, and system details.

**Method:** `GET`

**Parameters:** None

**Success Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-06-17T10:30:45.123Z",
  "uptime": {
    "seconds": 3600,
    "human": "1h 0m 0s"
  },
  "memory": {
    "used": 45.67,
    "total": 67.89,
    "external": 12.34
  },
  "version": "v18.16.0",
  "platform": "win32",
  "pid": 12345
}
```

**Response Fields:**
- `status`: Always "healthy" if server is responding
- `timestamp`: Current server time in ISO format
- `uptime.seconds`: Server uptime in seconds
- `uptime.human`: Human-readable uptime (e.g., "1h 30m 45s")
- `memory.used`: Heap memory used in MB
- `memory.total`: Total heap memory in MB
- `memory.external`: External memory in MB
- `version`: Node.js version
- `platform`: Operating system platform
- `pid`: Process ID

**Example Usage:**
```bash
curl http://localhost:3000/health
```

---

### 5. Simple Health Check

**Endpoint:** `GET /health/simple`

**Description:** Returns minimal health status for basic availability checking.

**Method:** `GET`

**Parameters:** None

**Success Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-06-17T10:30:45.123Z"
}
```

**Example Usage:**
```bash
curl http://localhost:3000/health/simple
```

**JavaScript Example:**
```javascript
async function checkAPIHealth() {
  try {
    const response = await fetch('/health/simple');
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    return false;
  }
}
```

---

## File Types Supported

The plugin files API returns the following file types:

| Extension | Type | Language | Description |
|-----------|------|----------|-------------|
| `.java` | Source | java | Java source code files |
| `.xml` | Config | xml | Maven POM files, configuration |
| `.yml`, `.yaml` | Config | yaml | Plugin configuration files |
| `.json` | Data | json | JSON configuration and data files |
| `.properties` | Config | properties | Java properties files |
| `.md` | Documentation | markdown | Markdown documentation |
| `.txt` | Text | text | Plain text files |

---

## Caching Behavior

### Cache Strategy

The plugin files API implements intelligent caching with the following features:

1. **Modification Time Tracking**: Files are cached with their last modification time
2. **Automatic Validation**: Cache is validated against file system before serving
3. **TTL Protection**: Cache entries expire after 5 minutes regardless of modification status
4. **Auto-Invalidation**: Cache is cleared automatically when plugins are modified

### Cache Keys

Cache keys follow the format: `userId:pluginName`

Examples:
- `684f19962ac039c3142b1172:SayHiOnJoin`
- `user123:TestPlugin`
- `developer456:MyAwesomePlugin`

### Performance Benefits

- **Faster Response Times**: Cached requests return instantly
- **Reduced I/O**: Less file system operations
- **Better User Experience**: Monaco Editor loads faster
- **Server Efficiency**: Lower CPU and disk usage

---

## Error Handling

### Common HTTP Status Codes

| Status Code | Description | Common Causes |
|-------------|-------------|---------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Missing or invalid parameters |
| 404 | Not Found | Plugin or user doesn't exist |
| 500 | Internal Server Error | Server-side errors, file system issues |

### Error Response Format

All error responses follow this format:
```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

### Troubleshooting Guide

**Plugin Not Found Errors:**
1. Verify the userId and pluginName are correct
2. Check if the plugin directory exists in `generated/{userId}/{pluginName}`
3. Ensure the plugin was successfully generated

**Cache Issues:**
1. Clear the cache using `/plugin/clear-cache`
2. Check cache stats with `/plugin/cache-stats`
3. Restart the server if cache appears corrupted

**Performance Issues:**
1. Monitor cache hit ratio
2. Clear cache for large plugins
3. Check server memory usage with `/health`

---

## Rate Limiting

Currently, there are no rate limits implemented on these endpoints. Consider implementing rate limiting for production use:

- Plugin files endpoint: 100 requests per minute per IP
- Cache operations: 50 requests per minute per IP
- Health checks: 300 requests per minute per IP

---

## Security Considerations

### Input Validation

- All string parameters are trimmed and validated
- Path traversal attacks are prevented
- Only text files are returned (binary files excluded)

### Authentication

Currently, no authentication is required. For production deployment, consider:
- API key authentication
- User session validation
- Role-based access control

### Best Practices

1. **Validate Input**: Always validate userId and pluginName on client side
2. **Handle Errors**: Implement proper error handling for all API calls
3. **Cache Management**: Monitor cache usage and clear when appropriate
4. **Health Monitoring**: Use health endpoints for monitoring and alerting

---

## Integration Examples

### Monaco Editor Integration

```javascript
class PluginFileEditor {
  constructor(editorContainer) {
    this.editor = monaco.editor.create(editorContainer, {
      theme: 'vs-dark',
      automaticLayout: true
    });
    this.models = new Map();
  }
  
  async loadPlugin(userId, pluginName) {
    try {
      // Get plugin files
      const files = await this.getPluginFiles(userId, pluginName);
      
      // Create Monaco models for each file
      for (const [filePath, content] of Object.entries(files)) {
        const language = this.getLanguageFromPath(filePath);
        const uri = monaco.Uri.parse(`file:///${filePath}`);
        const model = monaco.editor.createModel(content, language, uri);
        this.models.set(filePath, model);
      }
      
      // Set the first file as active
      const firstFile = Object.keys(files)[0];
      if (firstFile) {
        this.openFile(firstFile);
      }
      
    } catch (error) {
      console.error('Failed to load plugin:', error);
    }
  }
  
  async getPluginFiles(userId, pluginName) {
    const response = await fetch('/plugin/files', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pluginName })
    });
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.files;
  }
  
  openFile(filePath) {
    const model = this.models.get(filePath);
    if (model) {
      this.editor.setModel(model);
    }
  }
  
  getLanguageFromPath(filePath) {
    if (filePath.endsWith('.java')) return 'java';
    if (filePath.endsWith('.xml')) return 'xml';
    if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) return 'yaml';
    if (filePath.endsWith('.json')) return 'json';
    if (filePath.endsWith('.md')) return 'markdown';
    return 'text';
  }
}
```

### Cache Management Utility

```javascript
class CacheManager {
  static async getStats() {
    const response = await fetch('/plugin/cache-stats');
    return response.json();
  }
  
  static async clearPluginCache(userId, pluginName) {
    const response = await fetch('/plugin/clear-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pluginName })
    });
    return response.json();
  }
  
  static async clearUserCache(userId) {
    const response = await fetch('/plugin/clear-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return response.json();
  }
  
  static async clearAllCache() {
    const response = await fetch('/plugin/clear-cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    return response.json();
  }
}
```

---

## Version Information

- **API Version**: 1.0
- **Last Updated**: June 17, 2025
- **Compatibility**: Node.js 18+, NestJS 9+
- **Dependencies**: fs-extra, path

---

## Support

For issues or questions regarding these API routes:

1. Check the server logs for detailed error information
2. Use the health endpoints to verify system status
3. Monitor cache statistics for performance insights
4. Refer to the troubleshooting guide for common issues

---

## Changelog

### Version 1.0 (June 17, 2025)
- Initial release of plugin files API
- Added caching mechanism with modification time tracking
- Implemented health check endpoints
- Added comprehensive error handling
- Monaco Editor integration support
