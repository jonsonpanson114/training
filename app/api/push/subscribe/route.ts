import { NextResponse } from 'next/server';
import { gasSubscribe, isGasPushConfigured } from '@/lib/gas-push-store';

export const runtime = 'nodejs';

interface SubscribeBody {
  settings?: {
    enabled?: boolean;
    morningHour?: number;
    eveningHour?: number;
  };
  subscription?: {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
}

export async function POST(request: Request) {
  if (!isGasPushConfigured()) {
    return NextResponse.json(
      { error: 'GAS push storage is not configured. Set GAS_URL and GAS_AUTH_TOKEN.' },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as SubscribeBody;
  const endpoint = body.subscription?.endpoint?.trim();
  const p256dh = body.subscription?.keys?.p256dh?.trim();
  const auth = body.subscription?.keys?.auth?.trim();
  const enabled = Boolean(body.settings?.enabled);
  const morningHour = Math.min(23, Math.max(0, Math.floor(body.settings?.morningHour ?? 8)));
  const eveningHour = Math.min(23, Math.max(0, Math.floor(body.settings?.eveningHour ?? 21)));

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'Invalid subscription payload.' }, { status: 400 });
  }

  const result = await gasSubscribe(
    {
      endpoint,
      keys: { p256dh, auth },
    },
    {
      enabled,
      morningHour,
      eveningHour,
    }
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Failed to save subscription.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
