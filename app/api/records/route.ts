import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const client = supabase;
  if (!isSupabaseConfigured() || !client) {
    return NextResponse.json({ error: 'Database configuration missing. Please check your .env.local' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const entryId = searchParams.get('entryId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (entryId) {
    const { data, error } = await client
      .from('entries')
      .select('*')
      .eq('id', entryId)
      .eq('user_id', userId)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  const { data, error } = await client
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

type ErrorWithMessageAndStack = {
  message?: string;
  stack?: string;
};

export async function POST(request: NextRequest) {
  const client = supabase;
  if (!isSupabaseConfigured() || !client) {
    return NextResponse.json({ error: 'Database configuration missing. Please check your .env.local' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { 
      userId, 
      promptId, 
      promptTitle, 
      category, 
      content, 
      tags,
      imageUrl,
      contextText
    } = body;

    if (!userId || !content) {
      return NextResponse.json({ error: 'User ID and content are required' }, { status: 400 });
    }

    const { data, error } = await client
      .from('entries')
      .insert({
        user_id: userId,
        prompt_id: promptId || null,
        prompt_title: promptTitle || null,
        category: category || 'general',
        content: content,
        tags: tags || [],
        image_url: imageUrl || null,
        context_text: contextText || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase INSERT error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      // Return a structured error for the frontend
      return NextResponse.json({ 
        error: error.message, 
        code: error.code,
        details: error.details 
      }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const safeError = error as ErrorWithMessageAndStack;
    console.error('API Records POST error:', error);
    return NextResponse.json({ 
      error: safeError.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'development' ? safeError.stack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const client = supabase;
  if (!isSupabaseConfigured() || !client) {
    return NextResponse.json({ error: 'Database configuration missing. Please check your .env.local' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = searchParams.get('userId');

  if (!id || !userId) {
    return NextResponse.json({ error: 'ID and user ID are required' }, { status: 400 });
  }

  const { error } = await client
    .from('entries')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
