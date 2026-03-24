import webpush, { PushSubscription } from 'web-push';

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || 'mailto:notify@example.com';

let configured = false;

export function isPushConfigured(): boolean {
  return Boolean(publicKey && privateKey);
}

function ensureConfigured(): void {
  if (configured) return;
  if (!publicKey || !privateKey) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export function getVapidPublicKey(): string | null {
  return publicKey || null;
}

export async function sendWebPush(
  subscription: PushSubscription,
  payload: PushPayload
): Promise<{ ok: boolean; statusCode?: number; error?: string }> {
  ensureConfigured();
  if (!isPushConfigured()) {
    return { ok: false, error: 'VAPID keys are not configured.' };
  }
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true };
  } catch (error: unknown) {
    const maybe = error as { statusCode?: number; message?: string };
    return {
      ok: false,
      statusCode: maybe.statusCode,
      error: maybe.message || 'Failed to send push notification.',
    };
  }
}
