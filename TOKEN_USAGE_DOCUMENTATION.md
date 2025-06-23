# Token Tracking and User Usage Documentation

## Overview

The Pegasus Plugin Generator implements a comprehensive token tracking system that monitors and records AI API usage for every user. This system provides detailed analytics, usage patterns, and helps with cost management and user behavior analysis.

## Architecture

### Core Components

1. **TokenTrackingService** - Main service for recording and retrieving token usage
2. **UserTokenUsage Schema** - MongoDB schema for storing user token data
3. **Integration Layer** - Automatic tracking in AI and Chat services
4. **API Endpoints** - REST endpoints for querying usage statistics

### Data Flow

```
API Request → AI Service → OpenRouter API → Token Response → TokenTrackingService → MongoDB
                                                                      ↓
User Query ← API Response ← Token Usage Aggregation ← Database Query ←
```

---

## Token Tracking Service

### Core Functionality

The `TokenTrackingService` provides the following capabilities:

#### 1. **Token Usage Recording**
- Automatic tracking of all OpenRouter API calls
- Real-time updates to user token totals
- Session-based tracking with metadata
- Daily and monthly usage aggregation

#### 2. **Usage Analytics**
- Historical usage patterns
- Daily/monthly breakdowns
- Request count tracking
- Top user analytics

#### 3. **Data Management**
- Automatic cleanup of old sessions
- Efficient upsert operations
- Optimized aggregation queries

---

## Data Structure

### UserTokenUsage Schema

```typescript
{
  userId: string;                    // Unique user identifier
  totalPromptTokens: number;         // Total prompt tokens used
  totalCompletionTokens: number;     // Total completion tokens used
  totalTokens: number;               // Total tokens (prompt + completion)
  requestCount: number;              // Total number of requests made
  firstRequestAt: Date;              // First API request timestamp
  lastRequestAt: Date;               // Most recent API request timestamp
  
  // Daily usage breakdown
  dailyUsage: {
    [date: string]: {               // Format: YYYY-MM-DD
      date: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      requestCount: number;
    }
  };
  
  // Monthly usage breakdown
  monthlyUsage: {
    [month: string]: {              // Format: YYYY-MM
      month: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      requestCount: number;
    }
  };
  
  // Recent session tracking
  recentSessions: [{
    requestId: string;              // Unique request identifier
    timestamp: Date;                // Request timestamp
    operation: string;              // Operation type (generate, chat, etc.)
    model: string;                  // AI model used
    promptTokens: number;           // Tokens in prompt
    completionTokens: number;       // Tokens in completion
    totalTokens: number;            // Total tokens for request
    pluginName?: string;            // Associated plugin name
    complexity?: number;            // Plugin complexity level
  }];
}
```

### Session Record Structure

Each API request creates a session record with the following data:

```typescript
{
  requestId: string;        // Unique identifier for the request
  timestamp: Date;          // When the request was made
  operation: string;        // Type of operation (e.g., "plugin_generation", "chat")
  model: string;           // AI model used (e.g., "gpt-4", "claude-3")
  promptTokens: number;    // Tokens consumed by the prompt
  completionTokens: number; // Tokens generated in the response
  totalTokens: number;     // Total tokens for this request
  pluginName?: string;     // Plugin name if applicable
  complexity?: number;     // Plugin complexity level if applicable
}
```

---

## Service Methods

### 1. trackTokenUsage()

Records token usage for a user request.

```typescript
async trackTokenUsage(request: TokenTrackingRequest): Promise<UserTokenUsageDocument>

interface TokenTrackingRequest {
  userId: string;
  requestId: string;
  operation: string;
  model: string;
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  pluginName?: string;
  complexity?: number;
}
```

**Features:**
- Atomic upsert operation (creates user if doesn't exist)
- Incremental updates to totals
- Automatic daily/monthly aggregation
- Session record storage (last 50 sessions)
- Error handling and logging

**Example Usage:**
```typescript
await tokenTrackingService.trackTokenUsage({
  userId: "user123",
  requestId: "req_abc123",
  operation: "plugin_generation",
  model: "gpt-4",
  tokenUsage: {
    promptTokens: 150,
    completionTokens: 500,
    totalTokens: 650
  },
  pluginName: "TeleportPlugin",
  complexity: 5
});
```

### 2. getUserTokenUsage()

Retrieves complete token usage statistics for a user.

```typescript
async getUserTokenUsage(userId: string): Promise<UserTokenUsageDocument | null>
```

**Returns:**
- Complete user token usage record
- Daily and monthly breakdowns
- Recent session history
- null if user has no usage

### 3. getMultipleUsersTokenUsage()

Retrieves token usage for multiple users (bulk operation).

```typescript
async getMultipleUsersTokenUsage(userIds: string[]): Promise<UserTokenUsageDocument[]>
```

**Use Cases:**
- Admin dashboards
- Bulk user analysis
- Comparative usage reports

### 4. getDailyUsage()

Gets daily usage statistics for a user over a specified period.

```typescript
async getDailyUsage(userId: string, days: number = 30): Promise<any[]>
```

**Features:**
- Configurable time period (default 30 days)
- Sorted by most recent first
- Includes per-day breakdowns

### 5. getTopTokenUsers()

Retrieves top token consumers (admin function).

```typescript
async getTopTokenUsers(limit: number = 10): Promise<UserTokenUsageDocument[]>
```

**Use Cases:**
- Identifying heavy users
- Usage pattern analysis
- Cost monitoring

### 6. cleanupOldSessions()

Maintenance function to clean up old session records.

```typescript
async cleanupOldSessions(daysToKeep: number = 30): Promise<void>
```

**Features:**
- Configurable retention period
- Bulk cleanup operation
- Maintains performance by limiting session history

---

## Integration Points

### 1. AI Service Integration

The AI service automatically tracks token usage for all operations:

```typescript
// In AiService
const result = await this.openrouterClient.generatePluginCode(enhancedPrompt);

// Automatic token tracking
if (userId && result.tokenUsage) {
  await this.tokenTrackingService.trackTokenUsage({
    userId,
    requestId: generateRequestId(),
    operation: 'code_generation',
    model: 'gpt-4',
    tokenUsage: result.tokenUsage,
    pluginName
  });
}
```

### 2. Chat Service Integration

The chat service tracks token usage using username as userId:

```typescript
// In ChatService
const response = await this.openrouterClient.generateChatResponse(prompt);

// Track tokens using username
await this.tokenTrackingService.trackTokenUsage({
  userId: username,
  requestId: generateRequestId(),
  operation: 'chat',
  model: 'gpt-4',
  tokenUsage: response.tokenUsage,
  pluginName
});
```

### 3. Controller Integration

Controllers return token usage in API responses:

```typescript
// Get final token usage
const finalUsage = await this.tokenTrackingService.getUserTokenUsage(userId);
const tokensUsedThisRequest = finalTokens - initialTokens;

return {
  result: "Plugin generated successfully!",
  tokenUsage: {
    promptTokens: finalUsage?.totalPromptTokens || 0,
    completionTokens: finalUsage?.totalCompletionTokens || 0,
    totalTokens: finalTokens,
    requestCount: finalUsage?.requestCount || 0,
    tokensUsedThisRequest
  }
};
```

---

## API Endpoints

### Get User Token Usage
**GET** `/user/:userId/token-usage`

Retrieves comprehensive token usage statistics for a user.

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

### Token Usage in API Responses

All AI-powered endpoints include token usage in their responses:

```json
{
  "result": "Plugin generated successfully!",
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

## Usage Patterns and Analytics

### Daily Usage Tracking

The system automatically tracks daily usage patterns:

```typescript
// Daily usage structure
dailyUsage: {
  "2025-06-23": {
    date: "2025-06-23",
    promptTokens: 250,
    completionTokens: 750,
    totalTokens: 1000,
    requestCount: 3
  },
  "2025-06-22": {
    date: "2025-06-22",
    promptTokens: 180,
    completionTokens: 520,
    totalTokens: 700,
    requestCount: 2
  }
}
```

### Monthly Aggregation

Monthly totals are automatically calculated:

```typescript
// Monthly usage structure
monthlyUsage: {
  "2025-06": {
    month: "2025-06",
    promptTokens: 2000,
    completionTokens: 3000,
    totalTokens: 5000,
    requestCount: 15
  },
  "2025-05": {
    month: "2025-05",
    promptTokens: 1500,
    completionTokens: 2200,
    totalTokens: 3700,
    requestCount: 12
  }
}
```

### Session History

Recent sessions provide detailed operation history:

```typescript
recentSessions: [
  {
    requestId: "req_abc123",
    timestamp: "2025-06-23T10:30:00Z",
    operation: "plugin_generation",
    model: "gpt-4",
    promptTokens: 150,
    completionTokens: 500,
    totalTokens: 650,
    pluginName: "TeleportPlugin",
    complexity: 5
  }
]
```

---

## Performance Considerations

### Database Optimization

1. **Indexing:**
   ```javascript
   // Recommended indexes
   db.usertokenusages.createIndex({ "userId": 1 })
   db.usertokenusages.createIndex({ "totalTokens": -1 })
   db.usertokenusages.createIndex({ "lastRequestAt": -1 })
   ```

2. **Upsert Operations:**
   - Single atomic operation for updates
   - Efficient handling of new users
   - Prevents race conditions

3. **Session Cleanup:**
   - Automatic limiting to last 50 sessions
   - Periodic cleanup of old records
   - Maintains database performance

### Memory Efficiency

1. **Aggregation Pipeline:**
   - MongoDB aggregation for complex queries
   - Server-side calculations
   - Reduced data transfer

2. **Selective Querying:**
   - Only fetch required fields
   - Limit result sets appropriately
   - Use projection where possible

---

## Error Handling

### Service-Level Error Handling

```typescript
try {
  const updatedUser = await this.userTokenUsageModel.findOneAndUpdate(/* ... */);
  console.log(`✅ Token Tracking: Updated user ${userId}`);
  return updatedUser;
} catch (error) {
  console.error(`❌ Token Tracking: Failed to update user ${userId}:`, error);
  throw error;
}
```

### Integration Error Handling

```typescript
// In AI Service
try {
  if (userId && result.tokenUsage) {
    await this.tokenTrackingService.trackTokenUsage(/* ... */);
  }
} catch (error) {
  // Log error but don't fail the main operation
  console.error('Token tracking failed:', error);
}
```

### API Error Responses

```json
// Token usage endpoint error
{
  "success": false,
  "error": "Failed to fetch token usage: User not found",
  "code": "TOKEN_USAGE_ERROR",
  "timestamp": "2025-06-23T10:30:00Z"
}
```

---

## Monitoring and Alerting

### Logging

The service provides comprehensive logging:

```typescript
// Successful operations
console.log(`📊 Token Tracking: Recording usage for user ${userId} - ${tokenUsage.totalTokens} tokens`);
console.log(`✅ Token Tracking: Updated user ${userId} - Total: ${updatedUser.totalTokens} tokens`);

// Query operations
console.log(`📈 Token Tracking: Retrieved usage for user ${userId} - ${usage.totalTokens} total tokens`);
console.log(`📅 Token Tracking: Retrieved ${sortedDays.length} days of usage for user ${userId}`);

// Error conditions
console.error(`❌ Token Tracking: Failed to update user ${userId}:`, error);
```

### Metrics to Monitor

1. **Usage Metrics:**
   - Total tokens consumed per day/month
   - Average tokens per request
   - Request count trends
   - User growth patterns

2. **Performance Metrics:**
   - Database response times
   - Upsert operation latency
   - Error rates

3. **Cost Metrics:**
   - Token costs by user
   - Daily/monthly spending
   - Top consumers

---

## Security Considerations

### Data Privacy

1. **User Identification:**
   - No personally identifiable information stored
   - Only user IDs are tracked
   - Session data is anonymized

2. **Access Control:**
   - User can only access their own data
   - Admin endpoints require proper authorization
   - Rate limiting on query endpoints

### Data Retention

1. **Session Cleanup:**
   - Automatic cleanup of old sessions
   - Configurable retention periods
   - GDPR compliance considerations

2. **User Data Deletion:**
   ```typescript
   // Method to delete user data (for GDPR compliance)
   async deleteUserData(userId: string): Promise<void> {
     await this.userTokenUsageModel.deleteOne({ userId });
   }
   ```

---

## Usage Examples

### Basic Integration

```typescript
// In your service
constructor(
  private readonly tokenTrackingService: TokenTrackingService,
) {}

// Track token usage
await this.tokenTrackingService.trackTokenUsage({
  userId: "user123",
  requestId: "unique-request-id",
  operation: "plugin_generation",
  model: "gpt-4",
  tokenUsage: {
    promptTokens: 100,
    completionTokens: 200,
    totalTokens: 300
  },
  pluginName: "MyPlugin",
  complexity: 5
});

// Get user usage
const usage = await this.tokenTrackingService.getUserTokenUsage("user123");
```

### Admin Analytics

```typescript
// Get top users
const topUsers = await this.tokenTrackingService.getTopTokenUsers(10);

// Get daily usage for a user
const dailyUsage = await this.tokenTrackingService.getDailyUsage("user123", 30);

// Cleanup old sessions
await this.tokenTrackingService.cleanupOldSessions(30);
```

### API Response Integration

```typescript
// Before operation
const initialUsage = await this.tokenTrackingService.getUserTokenUsage(userId);
const initialTokens = initialUsage?.totalTokens || 0;

// Perform AI operation
const result = await this.aiService.generatePlugin(/* ... */);

// After operation
const finalUsage = await this.tokenTrackingService.getUserTokenUsage(userId);
const finalTokens = finalUsage?.totalTokens || 0;
const tokensUsedThisRequest = finalTokens - initialTokens;

// Return with token usage
return {
  result: result.data,
  tokenUsage: {
    promptTokens: finalUsage?.totalPromptTokens || 0,
    completionTokens: finalUsage?.totalCompletionTokens || 0,
    totalTokens: finalTokens,
    requestCount: finalUsage?.requestCount || 0,
    tokensUsedThisRequest
  }
};
```

---

## Testing

### Unit Tests

```typescript
describe('TokenTrackingService', () => {
  it('should track token usage correctly', async () => {
    const request = {
      userId: 'test-user',
      requestId: 'test-request',
      operation: 'test',
      model: 'gpt-4',
      tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    };

    const result = await service.trackTokenUsage(request);
    expect(result.totalTokens).toBe(30);
    expect(result.requestCount).toBe(1);
  });
});
```

### Integration Tests

```bash
# Test token tracking endpoint
curl -X POST http://localhost:3001/plugin/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test", "userId": "test-user"}' | jq '.tokenUsage'

# Verify token usage was recorded
curl -X GET http://localhost:3001/user/test-user/token-usage | jq '.totalTokens'
```

---

## Troubleshooting

### Common Issues

1. **Missing Token Usage in Response:**
   - Check if userId is provided
   - Verify AI service integration
   - Check for service errors in logs

2. **Incorrect Token Counts:**
   - Verify OpenRouter API response format
   - Check aggregation logic
   - Review upsert operations

3. **Performance Issues:**
   - Check database indexes
   - Monitor query performance
   - Consider session cleanup

### Debug Commands

```bash
# Check MongoDB for user data
db.usertokenusages.findOne({userId: "test-user"})

# View recent sessions
db.usertokenusages.findOne({userId: "test-user"}, {recentSessions: 1})

# Check aggregation performance
db.usertokenusages.explain().find({userId: "test-user"})
```

This comprehensive documentation provides everything needed to understand, implement, and maintain the token tracking system in the Pegasus Plugin Generator.
