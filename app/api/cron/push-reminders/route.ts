import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendWebPush } from '@/lib/push';

export const runtime = 'nodejs';

interface SubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  timezone: string;
  enabled: boolean;
  morning_hour: number;
  evening_hour: number;
  last_morning_sent_at: string | null;
  last_evening_sent_at: string | null;
}

function getLocalDateHour(date: Date, timezone: string): { dayKey: string; hour: number } {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const year = parts.find((p) => p.type === 'year')?.value || '1970';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const day = parts.find((p) => p.type === 'day')?.value || '01';
  const hour = Number(parts.find((p) => p.type === 'hour')?.value || '0');
  return { dayKey: `${year}-${month}-${day}`, hour };
}

function isSameLocalDay(iso: string | null, timezone: string, now: Date): boolean {
  if (!iso) return false;
  const a = getLocalDateHour(new Date(iso), timezone).dayKey;
  const b = getLocalDateHour(now, timezone).dayKey;
  return a === b;
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (secret && token !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  const now = new Date();
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id,user_id,endpoint,p256dh,auth,timezone,enabled,morning_hour,evening_hour,last_morning_sent_at,last_evening_sent_at')
    .eq('enabled', true)
    .limit(300);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let removed = 0;

  for (const raw of (data || []) as SubscriptionRow[]) {
    const row = raw;
    const timezone = row.timezone || 'Asia/Tokyo';
    const local = getLocalDateHour(now, timezone);
    const dueMorning = local.hour === row.morning_hour && !isSameLocalDay(row.last_morning_sent_at, timezone, now);
    const dueEvening = local.hour === row.evening_hour && !isSameLocalDay(row.last_evening_sent_at, timezone, now);

    if (!dueMorning && !dueEvening) continue;

    const payload = dueEvening
      ? { title: 'Verbalize', body: 'まだ間に合います。3分だけ言語化して締めましょう。', url: '/' }
      : { title: 'Verbalize', body: '今日の1本を書いて、思考のエンジンを起動しましょう。', url: '/' };

    const result = await sendWebPush(
      {
        endpoint: row.endpoint,
        keys: { p256dh: row.p256dh, auth: row.auth },
      },
      payload
    );

    if (!result.ok) {
      if (result.statusCode === 404 || result.statusCode === 410) {
        await supabase.from('push_subscriptions').delete().eq('id', row.id);
        removed += 1;
      }
      continue;
    }

    const update: Record<string, string> = {};
    if (dueMorning) update.last_morning_sent_at = now.toISOString();
    if (dueEvening) update.last_evening_sent_at = now.toISOString();
    if (Object.keys(update).length > 0) {
      await supabase.from('push_subscriptions').update(update).eq('id', row.id);
    }
    sent += 1;
  }

  return NextResponse.json({ sent, removed });
}
