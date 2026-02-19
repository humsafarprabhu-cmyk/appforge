import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300; // 5 min for Pro, 60s for Hobby (will just timeout gracefully)

// Proxy to our local Claude-powered API server via Cloudflare Tunnel
// This lets us change the tunnel URL without redeploying the frontend
const BACKEND_URL = process.env.APPFORGE_BACKEND_URL || '';

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { success: false, message: 'Backend API not configured. Set APPFORGE_BACKEND_URL env var.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    // For onboarding (non-streaming JSON response), proxy normally
    if (body.mode === 'onboarding') {
      const response = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    // For generation (SSE streaming), pipe the response through
    const response = await fetch(`${BACKEND_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { success: false, message: `Backend error: ${error}` },
        { status: response.status }
      );
    }

    // Stream SSE through
    const stream = response.body;
    if (!stream) {
      return NextResponse.json({ success: false, message: 'No stream from backend' }, { status: 500 });
    }

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[AppForge Proxy] Error:', error.message);
    return NextResponse.json(
      { success: false, message: `Proxy error: ${error.message}` },
      { status: 502 }
    );
  }
}

export async function GET() {
  if (!BACKEND_URL) {
    return NextResponse.json({ message: 'AppForge API Proxy — Backend not configured', status: 'disconnected' });
  }
  try {
    const response = await fetch(`${BACKEND_URL}/api/generate`);
    const data = await response.json();
    return NextResponse.json({ ...data, proxy: true, backend: 'connected' });
  } catch {
    return NextResponse.json({ message: 'AppForge API Proxy — Backend unreachable', status: 'error' });
  }
}
