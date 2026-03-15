import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const client = supabase;
  if (!isSupabaseConfigured() || !client) {
    return NextResponse.json({ error: 'Database configuration missing' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const entryId = searchParams.get('entryId');

  if (entryId) {
    const { data, error } = await client
      .from('entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const { data, error } = await client
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const client = supabase;
  if (!isSupabaseConfigured() || !client) {
    return NextResponse.json({ error: 'Database configuration missing' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { 
      userId, 
      promptId, 
      promptTitle, 
      category, 
      content, 
      tags 
    } = body;

    if (!userId || !content) {
      return NextResponse.json({ error: 'User ID and content are required' }, { status: 400 });
    }

    const { data, error } = await client
      .from('entries')
      .insert({
        user_id: userId,
        prompt_id: promptId || null,
        category: category || 'general',
        content: content,
        tags: tags || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase INSERT error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API Records POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const client = supabase;
  if (!isSupabaseConfigured() || !client) {
    return NextResponse.json({ error: 'Database configuration missing' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const { error } = await client
    .from('entries')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
