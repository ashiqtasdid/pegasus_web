import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookies = request.cookies.getAll();
  
  return NextResponse.json({
    message: 'Cookie test endpoint',
    cookies: cookies.map(c => ({
      name: c.name,
      value: c.value.substring(0, 20) + '...',
      fullValue: c.value
    })),
    headers: Object.fromEntries(request.headers.entries()),
    url: request.url,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token;
    
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 400 });
    }
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'Cookie set via test endpoint',
      token: token.substring(0, 20) + '...'
    });
    
    // Set the cookie with various configurations
    const cookieConfigs = [
      `better-auth.session_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=moonlitservers.com; Max-Age=604800`,
      `better-auth.session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Domain=.moonlitservers.com; Max-Age=604800`,
      `session_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`,
    ];
    
    cookieConfigs.forEach(config => {
      response.headers.append('Set-Cookie', config);
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to set cookie',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
