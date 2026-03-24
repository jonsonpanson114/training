import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { userId?: string };
  const userId = body.userId?.trim();
  if (!userId) {
    return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
