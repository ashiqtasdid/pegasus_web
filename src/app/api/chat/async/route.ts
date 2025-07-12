import { NextRequest, NextResponse } from 'next/server';

// In-memory store for chat requests (in production, use Redis or database)
const chatRequests = new Map<string, {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  username: string;
  pluginName: string | null;
  startTime: number;
  result?: any;
  error?: string;
}>();

// Start async chat processing
export async function POST(req: NextRequest) {
  try {
    const { message, username, pluginName } = await req.json();
    
    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Generate unique request ID
    const requestId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('🚀 Starting async chat request:', {
      requestId,
      message: message.substring(0, 100) + '...',
      username,
      pluginName
    });

    // Store request in pending state
    chatRequests.set(requestId, {
      id: requestId,
      status: 'pending',
      message,
      username,
      pluginName,
      startTime: Date.now()
    });

    // Process chat asynchronously (don't await)
    processChat(requestId, message, username, pluginName).catch(error => {
      console.error('❌ Async chat processing error:', error);
      const request = chatRequests.get(requestId);
      if (request) {
        request.status = 'error';
        request.error = error instanceof Error ? error.message : 'Unknown error occurred';
      }
    });

    // Return immediately with request ID
    return NextResponse.json({
      success: true,
      requestId,
      message: 'Chat request started. Use the requestId to check status.'
    });

  } catch (error) {
    console.error('❌ Error starting async chat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start chat request' },
      { status: 500 }
    );
  }
}

async function processChat(requestId: string, message: string, username: string, pluginName: string | null) {
  const request = chatRequests.get(requestId);
  if (!request) return;

  try {
    request.status = 'processing';
    console.log('🔄 Processing chat request:', requestId);

    const apiBaseUrl = process.env.API_BASE_URL || 'https://api.moonlitservers.com';
    const chatApiUrl = `${apiBaseUrl}/llm/chat/message`;

    console.log('🔵 Calling external chat API:', chatApiUrl);

    const response = await fetch(chatApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        username,
        pluginName
      }),
      // Use longer timeout for backend processing
      signal: AbortSignal.timeout(600000) // 10 minutes for backend
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Chat processing completed:', requestId);

    // Update request with result
    request.status = 'completed';
    request.result = data;

  } catch (error) {
    console.error('❌ Chat processing failed:', requestId, error);
    request.status = 'error';
    request.error = error instanceof Error ? error.message : 'Unknown error occurred';
  }
}

// Clean up old requests (optional cleanup job)
setInterval(() => {
  const now = Date.now();
  const maxAge = 30 * 60 * 1000; // 30 minutes
  
  for (const [id, request] of chatRequests.entries()) {
    if (now - request.startTime > maxAge) {
      chatRequests.delete(id);
      console.log('🧹 Cleaned up old chat request:', id);
    }
  }
}, 5 * 60 * 1000); // Run cleanup every 5 minutes
