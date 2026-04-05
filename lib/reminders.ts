export interface ReminderSettings {
  enabled: boolean;
  morningHour: number;
  eveningHour: number;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  morningHour: 8,
  eveningHour: 21,
};

const STORAGE_KEY = 'verbalize_reminder_settings';

function clampHour(hour: number): number {
  if (Number.isNaN(hour)) return 8;
  return Math.min(23, Math.max(0, Math.floor(hour)));
}

export function loadReminderSettings(): ReminderSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: Boolean(parsed.enabled),
      morningHour: clampHour(parsed.morningHour ?? DEFAULT_SETTINGS.morningHour),
      eveningHour: clampHour(parsed.eveningHour ?? DEFAULT_SETTINGS.eveningHour),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveReminderSettings(settings: ReminderSettings): ReminderSettings {
  const normalized: ReminderSettings = {
    enabled: settings.enabled,
    morningHour: clampHour(settings.morningHour),
    eveningHour: clampHour(settings.eveningHour),
  };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export async function requestReminderPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.requestPermission();
}

function hasSentToday(slot: 'morning' | 'evening', dayKey: string): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(`verbalize_reminder_sent_${slot}_${dayKey}`) === '1';
}

function markSentToday(slot: 'morning' | 'evening', dayKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`verbalize_reminder_sent_${slot}_${dayKey}`, '1');
}

function dayKeyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function canNotify(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
}

function fireReminder(slot: 'morning' | 'evening', message: string): void {
  if (!canNotify()) return;
  const nowKey = dayKeyOf(new Date());
  if (hasSentToday(slot, nowKey)) return;
  const notification = new Notification('言語化道場 (Verbalize)', {
    body: message,
    tag: `verbalize-${slot}-${nowKey}`,
  });
  notification.onclick = () => {
    window.focus();
  };
  markSentToday(slot, nowKey);
}

export function sendMissedReminderOnOpen(settings: ReminderSettings, todayDone: boolean): void {
  if (!settings.enabled || todayDone || !canNotify()) return;
  const now = new Date();
  const morning = new Date(now);
  morning.setHours(settings.morningHour, 0, 0, 0);
  const evening = new Date(now);
  evening.setHours(settings.eveningHour, 0, 0, 0);

  if (now >= evening) {
    fireReminder('evening', '今日のトレーニング、まだなら今がチャンスです。1日を言葉で締めくくりましょう。');
    return;
  }
  if (now >= morning) {
    fireReminder('morning', '今日の1本を書いて、思考のエンジンを起動しましょう。言葉が世界を作ります。');
  }
}

export function scheduleSessionReminders(settings: ReminderSettings, todayDone: boolean): () => void {
  if (!settings.enabled || todayDone || typeof window === 'undefined') return () => undefined;
  if (!canNotify()) return () => undefined;

  const timers: number[] = [];
  const now = new Date();
  const dayKey = dayKeyOf(now);

  const scheduleOne = (slot: 'morning' | 'evening', hour: number, message: string) => {
    const target = new Date(now);
    target.setHours(hour, 0, 0, 0);
    const delay = target.getTime() - now.getTime();
    if (delay <= 0) return;
    if (hasSentToday(slot, dayKey)) return;
    const id = window.setTimeout(() => {
      fireReminder(slot, message);
    }, delay);
    timers.push(id);
  };

  scheduleOne('morning', settings.morningHour, '今日の1本を書いて、思考のエンジンを起動しましょう。');
  scheduleOne('evening', settings.eveningHour, 'まだ間に合います。今日の思考を言葉にして、1日を完結させましょう。');

  return () => {
    timers.forEach((id) => clearTimeout(id));
  };
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch {
    return null;
  }
}

export async function getPushSubscription(): Promise<PushSubscription | null> {
  const registration = await registerServiceWorker();
  if (!registration) return null;
  return registration.pushManager.getSubscription();
}

export async function subscribePush(userId: string, settings: ReminderSettings): Promise<{ ok: boolean; message: string }> {
  if (!('PushManager' in window)) {
    return { ok: false, message: 'Push APIが利用できない環境です。' };
  }
  const registration = await registerServiceWorker();
  if (!registration) return { ok: false, message: 'Service Worker登録に失敗しました。' };

  const permission = await requestReminderPermission();
  if (permission !== 'granted') {
    return { ok: false, message: `通知許可が必要です（現在: ${permission}）。` };
  }

  const keyResponse = await fetch('/api/push/public-key');
  if (!keyResponse.ok) return { ok: false, message: '公開鍵の取得に失敗しました。' };
  const keyData = (await keyResponse.json()) as { publicKey?: string };
  if (!keyData.publicKey) return { ok: false, message: '公開鍵が未設定です。' };

  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(keyData.publicKey) as BufferSource,
    }));

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo';
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      timezone,
      settings,
      subscription: subscription.toJSON(),
    }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, message: err.error || '購読保存に失敗しました。' };
  }
  return { ok: true, message: '通知の購読を有効化しました。' };
}

export async function unsubscribePush(userId: string): Promise<{ ok: boolean; message: string }> {
  const subscription = await getPushSubscription();
  if (subscription) {
    await subscription.unsubscribe().catch(() => undefined);
  }
  const res = await fetch('/api/push/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) return { ok: false, message: '通知の解除に失敗しました。' };
  return { ok: true, message: '通知を解除しました。' };
}

export async function sendPushTest(userId: string): Promise<{ ok: boolean; message: string }> {
  const res = await fetch('/api/push/send-test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
  if (!res.ok) return { ok: false, message: data.error || 'テスト送信に失敗しました。' };
  return { ok: true, message: data.message || 'テスト通知を送信しました。' };
}
