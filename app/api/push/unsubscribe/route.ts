import { NextResponse } from 'next/server';
import { isGasPushConfigured } from '@/lib/gas-push-store';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isGasPushConfigured()) {
    return NextResponse.json(
      { error: 'GAS push storage is not configured. Set GAS_URL and GAS_AUTH_TOKEN.' },
      { status: 503 }
    );
  }

  await request.json().catch(() => ({}));
  return NextResponse.json({
    success: true,
    message: 'Local unsubscribe completed. GAS sheet entry remains and will be overwritten on next subscribe.',
  });
}
