import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendWebPush } from '@/lib/push';

export const runtime = 'nodejs';

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  enabled: boolean;
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  const userId = body.userId?.trim();
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('id,user_id,endpoint,p256dh,auth,enabled')
    .eq('user_id', userId)
    .eq('enabled', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 });

  const row = data as PushSubscriptionRow;
  const result = await sendWebPush(
    {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth },
    },
    {
      title: 'Verbalize',
      body: 'テスト通知です。毎日の3分トレーニングを続けましょう。',
      url: '/',
    }
  );

  if (!result.ok) {
    if (result.statusCode === 404 || result.statusCode === 410) {
      await supabase.from('push_subscriptions').delete().eq('id', row.id);
    }
    return NextResponse.json({ error: result.error || 'Push send failed.' }, { status: 500 });
  }
  return NextResponse.json({ message: 'テスト通知を送信しました。' });
}
