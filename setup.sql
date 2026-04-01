-- ==========================================
-- Verbalize Supabase Database Setup Script
-- ==========================================
-- Run this in your Supabase SQL Editor to set up the required tables and policies.

-- 1. Main Training Records Table
CREATE TABLE IF NOT EXISTS public.entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    prompt_id TEXT,
    prompt_title TEXT,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    context_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Category-Specific Tables (Optional/Future)
CREATE TABLE IF NOT EXISTS public.abduction_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
    observations TEXT[] DEFAULT '{}',
    hypotheses JSONB DEFAULT '[]',
    scores JSONB,
    feedback TEXT
);

CREATE TABLE IF NOT EXISTS public.synapse_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_id UUID REFERENCES public.entries(id) ON DELETE CASCADE,
    word1 TEXT,
    word2 TEXT,
    connections TEXT[] DEFAULT '{}',
    score INTEGER,
    feedback TEXT
);

-- 3. Push Subscriptions for Web Push Notifications
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
    enabled BOOLEAN NOT NULL DEFAULT true,
    morning_hour INTEGER NOT NULL DEFAULT 8,
    evening_hour INTEGER NOT NULL DEFAULT 21,
    last_morning_sent_at TIMESTAMPTZ,
    last_evening_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_push_subscriptions_user_endpoint
    ON public.push_subscriptions(user_id, endpoint);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abduction_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synapse_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Anonymous Usage
-- Allowing all operations for now (since we use client-generated IDs)
-- In production with Auth, you would restrict this to auth.uid() = user_id

CREATE POLICY "Public handle entries" ON public.entries 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public handle abduction_entries" ON public.abduction_entries 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public handle synapse_entries" ON public.synapse_entries 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public handle push_subscriptions" ON public.push_subscriptions
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_category ON public.entries(category);
CREATE INDEX IF NOT EXISTS idx_entries_created_at ON public.entries(created_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_enabled ON public.push_subscriptions(enabled);
