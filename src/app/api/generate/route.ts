import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.APPFORGE_BACKEND_URL || '';

async function proxyToBackend(path: string, options?: RequestInit) {
  if (!BACKEND_URL) {
    return NextResponse.json({ success: false, message: 'Backend not configured' }, { status: 503 });
  }
  const response = await fetch(`${BACKEND_URL}${path}`, options);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyToBackend('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function GET() {
  return proxyToBackend('/api/generate');
}
