import { NextResponse } from 'next/server';
import { sendWebPush } from '@/lib/push';
import { gasGetSubscriptions, isGasPushConfigured } from '@/lib/gas-push-store';

export const runtime = 'nodejs';

export async function POST() {
  if (!isGasPushConfigured()) {
    return NextResponse.json(
      { error: 'GAS push storage is not configured. Set GAS_URL and GAS_AUTH_TOKEN.' },
      { status: 503 }
    );
  }

  const lookup = await gasGetSubscriptions();
  if (!lookup.ok) {
    return NextResponse.json({ error: lookup.error || 'Failed to fetch subscriptions.' }, { status: 500 });
  }
  const subscriptions = lookup.subscriptions || [];
  if (subscriptions.length === 0) {
    return NextResponse.json({ error: 'No active subscription found.' }, { status: 404 });
  }

  const target = subscriptions[0];
  const result = await sendWebPush(target, {
    title: 'Verbalize',
    body: 'テスト通知です。毎日の3分トレーニングを続けましょう。',
    url: '/',
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error || 'Push send failed.' }, { status: 500 });
  }
  return NextResponse.json({ message: 'テスト通知を送信しました。' });
}
