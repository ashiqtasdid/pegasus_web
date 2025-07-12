import { NextRequest, NextResponse } from 'next/server';

// Import the chat requests map (in production, this would be a shared data store)
// For now, we'll recreate the interface - this should be in a shared module
interface ChatRequest {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  username: string;
  pluginName: string | null;
  startTime: number;
  result?: any;
  error?: string;
}

// Note: In production, this should be shared with the async route
// For now, we'll use a workaround by importing the map from the module
let chatRequestsStore: Map<string, ChatRequest>;

// We need to access the same store as the async route
// This is a limitation of the current architecture - in production, use Redis/DB
try {
  // Try to import the store from the async route module
  const asyncModule = require('../async/route.ts');
  chatRequestsStore = asyncModule.chatRequests;
} catch {
  // Fallback: create a new map (requests won't be found)
  chatRequestsStore = new Map();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    
    if (!requestId) {
      return NextResponse.json(
        { success: false, error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Since we can't easily share the Map between route files,
    // let's implement a different approach using the original API with shorter timeouts
    
    console.log('🔍 Checking chat status for request:', requestId);

    // For now, return a "not implemented" response that suggests using the direct API
    return NextResponse.json({
      success: false,
      error: 'Status checking not available. Please use direct chat API.',
      suggestion: 'Use /api/chat/message with shorter timeout and retry mechanism'
    });

  } catch (error) {
    console.error('❌ Error checking chat status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check request status' },
      { status: 500 }
    );
  }
}
