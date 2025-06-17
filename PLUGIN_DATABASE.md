# Plugin Database and File Persistence

## Overview

This document explains how plugin file persistence works in the Pegasus web application. **All plugin file retrieval is now handled exclusively from MongoDB with automatic refresh capabilities.**

## MongoDB Integration

**Plugin file retrieval is now exclusively handled by MongoDB.** The application fetches plugin files directly from your MongoDB database with the following structure:

```javascript
{
  _id: "dGVzdHVzZXI6R3JlZXRlcjoy",
  userId: "testuser",
  pluginName: "Greeter",
  description: "A Minecraft plugin named Greeter",
  minecraftVersion: "1.20",
  dependencies: [],
  files: [
    {
      path: "src/main/java/Main.java",
      content: "...",
      type: "java"
    }
  ],
  metadata: {
    totalFiles: 8,
    totalSize: 194280,
    diskPath: "E:\\Codespace\\pegasus\\generated\\testuser\\Greeter"
  },
  createdAt: "2025-06-17T18:06:08.224Z",
  updatedAt: "2025-06-17T18:06:08.224Z",
  isActive: true,
  lastSyncedAt: "2025-06-17T18:06:08.224Z"
}
```

### Auto-Refresh System

The application includes an automatic refresh system that:

- **Refreshes every 2 minutes** when enabled
- **Manual toggle** in the UI to start/stop auto-refresh
- **Visual indicators** showing refresh status and last refresh time
- **Smart caching** to prevent unnecessary requests

### MongoDB Endpoints

The application handles plugin file management through MongoDB integration:

- **`POST /api/plugin/files`** - Retrieves plugin files directly from MongoDB
- **`GET /api/plugins/list`** - Lists all plugins for a user from MongoDB
- **`POST /api/plugins/sync`** - Returns current plugin files from MongoDB

### File Retrieval Process

1. **Plugin Generation**: When a plugin is generated, it's saved directly to MongoDB
2. **File Retrieval**: Frontend calls `/api/plugin/files` which queries MongoDB
3. **Auto-Refresh**: System automatically refreshes files every 2 minutes if enabled
4. **Real-time Updates**: UI shows refresh status and last update time

## Frontend Responsibility

The frontend is responsible for:

- **User Interface**: Providing forms and interfaces for plugin generation
- **MongoDB Integration**: Connecting directly to MongoDB for file retrieval
- **File Display**: Showing plugin files in the Monaco editor and file explorer
- **Auto-Refresh**: Managing automatic file refresh every 2 minutes
- **User Experience**: Managing loading states, error handling, and notifications

### Frontend Handles

- ✅ **File Retrieval**: Fetching plugin files directly from MongoDB
- ✅ **Auto-Refresh**: Automatically refreshing files every 2 minutes
- ✅ **File Display**: Displaying files in the Monaco editor and file explorer
- ✅ **MongoDB Queries**: Direct MongoDB connection for plugin data
- ✅ **Refresh Controls**: UI controls for manual refresh and auto-refresh toggle

## API Flow

```
Frontend (Plugin Generator)
    ↓ POST /plugin/generate (to backend)
Backend API (Generates Plugin & Saves to MongoDB)
    ↓ Returns generation result
Frontend (Displays result)
    ↓ Requests files via /api/plugin/files
MongoDB (Returns files)
    ↓ Files displayed
Frontend (Displays files in Monaco Editor)
    ↓ Auto-refresh every 2 minutes
MongoDB (Updated files if any)
```

## File Management Strategy

The frontend implements MongoDB-based storage with auto-refresh:

1. **Direct MongoDB Access**: All files are fetched directly from MongoDB
2. **Auto-Refresh System**: Files refresh automatically every 2 minutes when enabled
3. **Manual Controls**: Users can manually refresh or toggle auto-refresh
4. **Real-time Status**: UI shows last refresh time and refresh status
5. **Smart Caching**: Prevents unnecessary requests within the same session

## Code Changes Made

### Added MongoDB Integration

- Modified `/api/plugin/files` endpoint to query MongoDB directly using MongoClient
- Added `/api/plugins/list` endpoint for listing all user plugins from MongoDB
- Updated file retrieval to use MongoDB document structure with metadata
- Added auto-refresh functionality in `VSCodeLayout.tsx` component

### Added Auto-Refresh System

- Implemented 2-minute auto-refresh interval in `VSCodeLayout.tsx`
- Added UI controls for starting/stopping auto-refresh
- Added visual indicators showing last refresh time and status
- Integrated smart caching to prevent unnecessary requests

### Updated Hook System

- Enhanced `usePluginGenerator.ts` with auto-refresh capabilities
- Added `startAutoRefresh`, `stopAutoRefresh` functions
- Implemented refresh tracking with `lastRefresh` state
- Added event system for refresh notifications

## Benefits

1. **Direct MongoDB Access**: Eliminates intermediate layers for better performance
2. **Real-time Updates**: Auto-refresh ensures files are always current
3. **User Control**: Manual toggle for auto-refresh based on user preference
4. **Visual Feedback**: Clear indicators of refresh status and timing
5. **Scalable Architecture**: Direct database access supports large file sets

## Environment Configuration

MongoDB connection is configured via environment variables:

- **`MONGODB_URI`**: Direct MongoDB connection string
- **Collection**: Uses 'plugins' collection by default
- **Auto-refresh**: 2-minute interval (120000ms)
- **File Types**: Supports all file types with proper language detection

## Migration Notes

This change represents a migration to a MongoDB-based file system with auto-refresh capabilities. The frontend now connects directly to MongoDB for all file operations, while maintaining automatic refresh functionality to ensure files stay current.

Key improvements include real-time file synchronization, user-controlled auto-refresh, and direct database access for optimal performance.
