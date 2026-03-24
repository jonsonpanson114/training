import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const runtime = 'nodejs';

interface SubscribeBody {
  userId?: string;
  timezone?: string;
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
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as SubscribeBody;
  const userId = body.userId?.trim();
  const endpoint = body.subscription?.endpoint?.trim();
  const p256dh = body.subscription?.keys?.p256dh?.trim();
  const auth = body.subscription?.keys?.auth?.trim();
  const timezone = body.timezone || 'Asia/Tokyo';
  const enabled = Boolean(body.settings?.enabled);
  const morningHour = Math.min(23, Math.max(0, Math.floor(body.settings?.morningHour ?? 8)));
  const eveningHour = Math.min(23, Math.max(0, Math.floor(body.settings?.eveningHour ?? 21)));

  if (!userId || !endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'Invalid subscription payload.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
        timezone,
        enabled,
        morning_hour: morningHour,
        evening_hour: eveningHour,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,endpoint' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
