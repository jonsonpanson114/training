import { NextResponse } from 'next/server';
import type { PushSubscription } from 'web-push';
import { sendWebPush } from '@/lib/push';
import { gasGetSubscriptions } from '@/lib/gas-push-store';

export const runtime = 'nodejs';

function normalizeSubscription(input: unknown): PushSubscription | null {
  if (!input) return null;
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as PushSubscription;
    } catch {
      return null;
    }
  }
  if (typeof input === 'object') return input as PushSubscription;
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    auth_token?: string;
    title?: string;
    body?: string;
    subscription?: unknown;
  };

  const gasToken = process.env.GAS_AUTH_TOKEN;
  if (gasToken && body.auth_token !== gasToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const title = (body.title || 'Verbalize').toString();
  const message = (body.body || '今日の3分トレーニングを始めましょう。').toString();

  const direct = normalizeSubscription(body.subscription);
  const targets: PushSubscription[] = [];
  if (direct) {
    targets.push(direct);
  } else {
    const list = await gasGetSubscriptions();
    if (!list.ok) {
      return NextResponse.json({ error: list.error || 'Failed to fetch subscriptions from GAS.' }, { status: 500 });
    }
    targets.push(...(list.subscriptions || []));
  }

  if (targets.length === 0) {
    return NextResponse.json({ ok: true, message: 'No subscriptions found.' });
  }

  const results = await Promise.all(
    targets.map((sub) =>
      sendWebPush(sub, {
        title,
        body: message,
        url: '/',
      })
    )
  );

  const success = results.filter((r) => r.ok).length;
  const failed = results.length - success;
  return NextResponse.json({ ok: true, sent: success, failed });
}
