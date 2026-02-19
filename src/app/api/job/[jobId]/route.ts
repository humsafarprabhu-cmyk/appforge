import { NextRequest, NextResponse } from 'next/server';
import { use } from 'react';

const BACKEND_URL = process.env.APPFORGE_BACKEND_URL || '';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await context.params;
  
  if (!BACKEND_URL) {
    return NextResponse.json({ success: false, message: 'Backend not configured' }, { status: 503 });
  }

  const response = await fetch(`${BACKEND_URL}/api/job/${jobId}`);
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
