import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.redirect(new URL('/app', 'http://localhost:3000'));
}
