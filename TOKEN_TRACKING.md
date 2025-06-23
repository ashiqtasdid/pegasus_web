# Token Tracking Implementation

This document describes the token tracking implementation that tracks OpenRouter API token usage per user across all AI-powered endpoints.

## Features

### Token Tracking
- **Per-user tracking**: Each user has a single database entry that accumulates token usage over time
- **Real-time updates**: Token usage is tracked after every API request to OpenRouter
- **Comprehensive metrics**: Tracks prompt tokens, completion tokens, total tokens, and request count
- **Session tracking**: Recent API sessions are stored with detailed information
- **Integrated responses**: All AI endpoints now return token usage information

### Database Schema
The `UserTokenUsage` collection stores:
- `userId`: Unique identifier for the user
- `totalPromptTokens`: Total prompt tokens used by the user
- `totalCompletionTokens`: Total completion tokens used by the user  
- `totalTokens`: Total tokens used (prompt + completion)
- `requestCount`: Number of API requests made
- `firstRequestAt`: Timestamp of first API request
- `lastRequestAt`: Timestamp of most recent API request
- `recentSessions`: Array of recent API sessions with detailed info
- `dailyUsage`: Daily aggregated usage statistics
- `monthlyUsage`: Monthly aggregated usage statistics

### API Endpoints

#### Get User Token Usage
```http
GET /user/:userId/token-usage
```
Returns comprehensive token usage statistics for a user.

**Response:**
```json
{
  "userId": "user123",
  "totalTokens": 15750,
  "promptTokens": 8500,
  "completionTokens": 7250,
  "requestCount": 42,
  "dailyUsage": [...],
  "monthlyUsage": [...],
  "lastRequestAt": "2025-06-23T10:30:00.000Z"
}
```

#### Generate Plugin (Enhanced)
```http
POST /plugin/generate
```
Generates a plugin and returns the result along with token usage information.

**Request Body:**
```json
{
  "prompt": "Create a plugin that...",
  "userId": "user123",
  "name": "MyPlugin",
  "autoCompile": true,
  "complexity": 7
}
```

**Response:**
```json
{
  "result": "Plugin generation result...",
  "tokenUsage": {
    "promptTokens": 8500,
    "completionTokens": 7250,
    "totalTokens": 15750,
    "requestCount": 42,
    "tokensUsedThisRequest": 450
  }
}
```

#### Generate Code Only (Enhanced)
```http
POST /ai/generate-code
```
Generates plugin code and optionally tracks token usage if userId is provided.

**Request Body:**
```json
{
  "prompt": "Create a teleportation system",
  "pluginName": "TeleportPlugin",
  "userId": "user123"
}
```

**Response:**
```json
{
  "enhancedPrompt": "Enhanced prompt...",
  "pluginProject": { ... },
  "tokenUsage": {
    "promptTokens": 8500,
    "completionTokens": 7250,
    "totalTokens": 15750,
    "requestCount": 42,
    "tokensUsedThisRequest": 320
  }
}
```

#### Chat System (Enhanced)
```http
POST /chat/message
```
Processes chat messages and returns AI responses with token usage tracking.

**Request Body:**
```json
{
  "message": "How do I add a command to my plugin?",
  "username": "user123",
  "pluginName": "MyPlugin"
}
```

**Response:**
```json
{
  "success": true,
  "type": "info",
  "message": "AI response...",
  "username": "user123",
  "pluginName": "MyPlugin",
  "tokenUsage": {
    "promptTokens": 8500,
    "completionTokens": 7250,
    "totalTokens": 15750,
    "requestCount": 42,
    "tokensUsedThisRequest": 85
  }
}
```

## Implementation Details

### Token Tracking Service
The `TokenTrackingService` provides:
- `trackTokenUsage()`: Records token usage for a user
- `getUserTokenUsage()`: Retrieves user's token usage statistics
- Automatic aggregation of daily and monthly statistics
- Upsert operations to maintain single entry per user

### AI Service Integration
The `AiService` now:
- Accepts optional `userId` parameter in `generatePluginCode()` and `enhancePrompt()`
- Automatically tracks token usage after successful OpenRouter API calls
- Extracts token usage from OpenRouter response (`usage.prompt_tokens`, `usage.completion_tokens`, `usage.total_tokens`)
- Handles both primary and fallback model calls

### Chat Service Integration
The `ChatService` now:
- Tracks token usage for all AI operations (intent analysis, info queries, modification queries)
- Uses different operation types for different chat functions
- Integrates seamlessly with the chat endpoint to return token usage

### OpenRouter Response Format
Token usage is extracted from the OpenRouter API response:
```json
{
  "choices": [...],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 300,
    "total_tokens": 450
  }
}
```

## Usage Flow

1. **User makes API request** with `userId` parameter (required for plugin generation, optional for code-only generation, username for chat)
2. **System captures initial token count** from user's database entry
3. **AI Service/Chat Service processes request** and calls OpenRouter API
4. **Token usage extracted** from OpenRouter response
5. **Database updated** with new token counts for the user
6. **Response returned** with both the result and token usage information (including tokens used in this specific request)

## Integration Points

### Plugin Generation
- `/plugin/generate` - Always returns token usage
- `/plugin/generate-and-compile` - Tracks tokens when userId provided
- `/plugin/generate-only` - Tracks tokens when userId provided

### Code Generation
- `/ai/generate-code` - Optional token tracking with userId parameter

### Chat System
- `/chat/message` - Always tracks tokens using username as userId
- Supports intent analysis, info queries, and modification queries
- Each chat operation type is tracked separately

### Error Handling

- Token tracking failures do not interrupt the main AI generation or chat flow
- Comprehensive logging for debugging token tracking issues
- Graceful fallbacks when token tracking service is unavailable
- All endpoints continue to work even if token tracking fails

## Performance Considerations

- Single database update per API request
- Efficient upsert operations using MongoDB operators
- Indexed userId field for fast lookups
- Minimal overhead on AI generation and chat pipelines
- Before/after token counting to calculate per-request usage
