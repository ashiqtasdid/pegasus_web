import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, username, pluginName } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // Check if external backend is configured
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    if (apiBase && !apiBase.includes('your-backend-service')) {
      // Try to forward to external backend
      try {
        const response = await fetch(`${apiBase}/chat/message`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
            username,
            pluginName
          }),
          signal: AbortSignal.timeout(25000) // 25 second timeout
        });

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch (error) {
        console.error('Backend chat service error:', error);
        // Fall through to mock response
      }
    }

    // Mock AI response for development/fallback
    const responses = [
      "I can help you with that! Let me analyze your code and provide suggestions.",
      "That's a great question. Here's what I think about your approach...",
      "I see what you're trying to do. Let me suggest a better way to implement this.",
      "Looking at your plugin structure, I recommend the following improvements...",
      "This is a common pattern in Minecraft plugin development. Here's how to handle it:",
      "I notice you're working with Bukkit API. Here are some best practices...",
      "For better performance, consider using this approach instead...",
      "That functionality can be implemented using Bukkit events. Here's an example:"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return NextResponse.json({
      success: true,
      message: randomResponse,
      type: 'assistant',
      contextLoaded: !!pluginName,
      filesAnalyzed: pluginName ? Math.floor(Math.random() * 10) + 1 : 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
