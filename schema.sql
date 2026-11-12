-- ==============================================================================
-- SMARTLINK MANAGER PRO - SUPABASE DATABASE SCHEMA
-- Execute this SQL in your Supabase SQL Editor (https://app.supabase.com)
-- ==============================================================================

-- 1. Create Links Table
CREATE TABLE IF NOT EXISTS public.links (
    id TEXT PRIMARY KEY DEFAULT ('lnk_' || substr(md5(random()::text), 1, 12)),
    name TEXT NOT NULL,
    original_url TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sub_id TEXT DEFAULT '',
    description TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    click_count BIGINT DEFAULT 0,
    unique_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Clicks Log Table
CREATE TABLE IF NOT EXISTS public.clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id TEXT REFERENCES public.links(id) ON DELETE CASCADE,
    link_slug TEXT NOT NULL,
    link_name TEXT NOT NULL,
    sub_id TEXT DEFAULT '',
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_agent TEXT DEFAULT '',
    device_type TEXT DEFAULT 'desktop',
    browser TEXT DEFAULT '',
    os TEXT DEFAULT '',
    ip_hash TEXT NOT NULL,
    referrer TEXT DEFAULT 'Direct / None',
    destination_url TEXT NOT NULL,
    query_params JSONB DEFAULT '{}'::jsonb
);

-- 3. High-Performance Indexes
CREATE INDEX IF NOT EXISTS idx_links_slug ON public.links(slug);
CREATE INDEX IF NOT EXISTS idx_links_status ON public.links(status);
CREATE INDEX IF NOT EXISTS idx_links_created_at ON public.links(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON public.clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_timestamp ON public.clicks(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_clicks_ip_hash ON public.clicks(ip_hash);

-- 4. Stored Procedure for Atomic Click Count Increment
CREATE OR REPLACE FUNCTION public.increment_link_clicks(link_row_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.links
  SET click_count = click_count + 1,
      updated_at = NOW()
  WHERE id = link_row_id;
END;
$$;

-- 5. Row Level Security (RLS) Configuration
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clicks ENABLE ROW LEVEL SECURITY;

-- Allow read and write for authenticated users or API service role
CREATE POLICY "Allow public read of active links for redirect"
ON public.links FOR SELECT
USING (true);

CREATE POLICY "Allow service role full access to links"
ON public.links FOR ALL
USING (true);

CREATE POLICY "Allow insert of click logs"
ON public.clicks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow service role full access to clicks"
ON public.clicks FOR ALL
USING (true);
