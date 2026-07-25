-- ─────────────────────────────────────────────────────────────
--  ZCPD · News & Announcements
--  Run this in the Supabase SQL editor (or `supabase db push`).
-- ─────────────────────────────────────────────────────────────

create table if not exists public.news_posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null,
  category    text default 'Update',
  pinned      boolean default false,
  created_at  timestamptz default now()
);

alter table public.news_posts enable row level security;

-- Public (unauthenticated) can read announcements …
drop policy if exists news_read  on public.news_posts;
create policy news_read  on public.news_posts
  for select using (true);

-- … but only FTC / FTI can post / edit / remove.
drop policy if exists news_write on public.news_posts;
create policy news_write on public.news_posts
  for all using (public.get_my_role() in ('ftc','fti'))
  with check   (public.get_my_role() in ('ftc','fti'));
