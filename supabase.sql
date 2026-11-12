create extension if not exists pgcrypto;

create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  original_url text not null,
  slug text not null unique,
  sub_id text default '',
  description text default '',
  thumbnail_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  click_count integer not null default 0,
  unique_count integer not null default 0
);

create table if not exists clicks (
  id uuid primary key default gen_random_uuid(),
  link_id uuid not null references links(id) on delete cascade,
  link_slug text,
  link_name text,
  sub_id text default '',
  timestamp timestamptz not null default now(),
  user_agent text,
  device_type text,
  browser text,
  os text,
  ip_hash text,
  referrer text default '',
  query_params jsonb default '{}'::jsonb,
  destination_url text
);

create index if not exists clicks_link_time on clicks (link_id, timestamp desc);
create index if not exists clicks_time on clicks (timestamp desc);
