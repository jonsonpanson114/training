import type { PushSubscription } from 'web-push';

interface GasResponse {
  ok?: boolean;
  success?: boolean;
  error?: string;
  message?: string;
  subscriptions?: string[];
}

export interface GasNotificationSettings {
  enabled: boolean;
  morningHour: number;
  eveningHour: number;
}

const gasUrl = process.env.GAS_URL || process.env.NEXT_PUBLIC_GAS_URL || '';
const gasAuthToken = process.env.GAS_AUTH_TOKEN || '';
const gasAppName = process.env.GAS_APP_NAME || 'verbalize';

async function callGas(action: string, payload: Record<string, unknown>): Promise<GasResponse> {
  if (!gasUrl || !gasAuthToken) {
    return { ok: false, error: 'GAS is not configured. Set GAS_URL and GAS_AUTH_TOKEN.' };
  }
  const response = await fetch(gasUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: gasAuthToken,
      app_name: gasAppName,
      action,
      ...payload,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as GasResponse;
  if (!response.ok) {
    return { ...body, ok: false, error: body.error || body.message || `GAS request failed (${response.status}).` };
  }
  return body;
}

export function isGasPushConfigured(): boolean {
  return Boolean(gasUrl && gasAuthToken);
}

export async function gasSubscribe(
  subscription: PushSubscription,
  settings: GasNotificationSettings
): Promise<{ ok: boolean; error?: string }> {
  const result = await callGas('subscribe', {
    subscription: JSON.stringify(subscription),
    settings: {
      morningEnabled: settings.enabled,
      eveningEnabled: settings.enabled,
      morningHour: settings.morningHour,
      morningMinute: 0,
      eveningHour: settings.eveningHour,
      eveningMinute: 0,
    },
  });
  const ok = result.ok !== false && result.success !== false;
  return ok ? { ok: true } : { ok: false, error: result.error || result.message || 'Failed to save subscription in GAS.' };
}

export async function gasGetSubscriptions(): Promise<{ ok: boolean; error?: string; subscriptions?: PushSubscription[] }> {
  const result = await callGas('getSubscriptions', {});
  const ok = result.ok !== false && result.success !== false;
  if (!ok) {
    return { ok: false, error: result.error || result.message || 'Failed to fetch subscriptions from GAS.' };
  }
  const raw = Array.isArray(result.subscriptions) ? result.subscriptions : [];
  const subscriptions = raw
    .map((item) => {
      try {
        return JSON.parse(item) as PushSubscription;
      } catch {
        return null;
      }
    })
    .filter((v): v is PushSubscription => Boolean(v));
  return { ok: true, subscriptions };
}
