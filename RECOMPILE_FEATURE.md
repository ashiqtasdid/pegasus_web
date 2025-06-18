# Web Editor Recompile Feature Documentation

## 📋 Overview

The web editor now includes a **Recompile Plugin** feature that allows users to manually recompile their Minecraft plugins directly from the VSCode-style editor interface.

## 🎯 Feature Location

The recompile button is located in the **top toolbar** of the web editor, alongside other plugin management controls:

- **Icon:** 🔨 Hammer icon
- **Position:** Between the "Refresh Files" and "Auto-refresh toggle" buttons
- **Visibility:** Only visible when a plugin is loaded in the editor

## 🔧 How It Works

### User Interface
1. **Button Appearance:** Ghost button with hammer icon
2. **Tooltip:** "Recompile Plugin" on hover
3. **States:**
   - **Normal:** Ready to use
   - **Disabled:** During loading or when already recompiling
   - **Loading:** Animated pulse effect during compilation

### Backend Integration
- **API Endpoint:** `POST /api/plugin/recompile`
- **Backend Route:** `POST /plugin/recompile` (as documented in ENDPOINT_CHANGE_COMPLETE.md)
- **Parameters:**
  - `userId`: Authenticated user ID
  - `pluginName`: Name of the plugin to recompile
  - `maxFixAttempts`: Maximum auto-fix attempts (default: 5)

## 🚀 Usage Instructions

### For Users:
1. **Open a plugin** in the web editor (`/dashboard/editor?plugin=<pluginId>`)
2. **Locate the hammer icon** in the top toolbar
3. **Click the recompile button** to start compilation
4. **Wait for completion** - the button will show loading state
5. **Check notifications** for success/error messages
6. **View chat messages** for detailed compilation results

### For Developers:
```typescript
// The recompile functionality is implemented in:
// - usePluginGenerator hook: recompilePlugin function
// - VSCodeLayout component: handleRecompilePlugin function
// - API route: /api/plugin/recompile

const { recompilePlugin, isLoading } = usePluginGenerator();

// Usage
await recompilePlugin(userId, pluginName, maxFixAttempts);
```

## 📊 Success/Error Handling

### Success Flow:
1. ✅ **Button clicked** → Loading state activated
2. ✅ **API call made** → Backend receives recompile request  
3. ✅ **Compilation succeeds** → Success notification shown
4. ✅ **Chat message added** → Detailed success information
5. ✅ **Files refreshed** → Editor shows any updated files

### Error Flow:
1. ❌ **Compilation fails** → Error notification shown
2. ❌ **Chat message added** → Detailed error information with compilation errors
3. ❌ **Loading state cleared** → Button returns to normal state

## 🔄 Integration with Existing Features

### Works With:
- **File Sync:** Automatically refreshes files after successful recompilation
- **Chat System:** Adds detailed success/error messages to chat
- **Notification System:** Shows toast notifications for quick feedback
- **Plugin Loading:** Respects existing loading states and prevents concurrent operations

### Auto-fix Support:
- Uses the same auto-fix system as plugin generation
- Up to 5 automatic fix attempts for compilation errors
- Detailed reporting of fix attempts in chat messages

## 💡 Implementation Details

### Key Components:
1. **usePluginGenerator Hook** (`src/hooks/usePluginGenerator.ts`)
   - Added `recompilePlugin` function
   - Handles API communication and chat integration

2. **VSCodeLayout Component** (`src/components/VSCodeLayout.tsx`)
   - Added `handleRecompilePlugin` function
   - Added recompile button UI
   - Integration with existing loading states

3. **API Route** (`src/app/api/plugin/recompile/route.ts`)
   - Forwards requests to backend
   - Handles authentication and error cases
   - 2-minute timeout for compilation

### Dependencies:
- **Backend API:** Must have `/plugin/recompile` endpoint available
- **Authentication:** Uses same auth system as other plugin operations
- **Icons:** Uses Lucide React `Hammer` icon

## 🎉 Benefits

- **Quick Recompilation:** No need to regenerate entire plugin
- **Error Fixing:** Automatic attempt to fix common compilation errors
- **Integrated Workflow:** Seamlessly works with existing editor features
- **Real-time Feedback:** Immediate notifications and detailed chat messages
- **Development Efficiency:** Faster iteration cycle for plugin development

## 📝 Usage Example

```typescript
// User clicks recompile button →
// handleRecompilePlugin() is called →
// recompilePlugin(userId, pluginName, 5) is executed →
// API call to /api/plugin/recompile →
// Backend processes with auto-fix →
// Success/error feedback shown →
// Files refreshed automatically
```

This feature significantly enhances the plugin development workflow by providing a quick and reliable way to recompile plugins without leaving the editor interface.
