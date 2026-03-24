import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (!isSupabaseConfigured() || !supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  // Get date range for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('entries')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Group by date
  const activityMap: Record<string, number> = {};
  data.forEach((entry: { created_at: string }) => {
    const date = entry.created_at.split('T')[0];
    activityMap[date] = (activityMap[date] || 0) + 1;
  });

  const summary = Object.entries(activityMap).map(([date, count]) => ({
    date,
    count
  }));

  return NextResponse.json({ summary });
}
