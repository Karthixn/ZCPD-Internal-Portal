-- ─────────────────────────────────────────────────────────────
--  ZCPD · Editable site content (nav + citizen pages)
--  Run this in the Supabase SQL editor (or `supabase db push`).
-- ─────────────────────────────────────────────────────────────

create table if not exists public.site_content (
  key         text primary key,          -- 'nav' | 'join' | 'divisions' | 'services' | 'faq'
  data        jsonb not null,
  updated_at  timestamptz default now()
);

alter table public.site_content enable row level security;

-- Public (unauthenticated) can read all site content …
drop policy if exists sc_read  on public.site_content;
create policy sc_read  on public.site_content
  for select using (true);

-- … but only FTC can edit it.
drop policy if exists sc_write on public.site_content;
create policy sc_write on public.site_content
  for all using (public.get_my_role() = 'ftc')
  with check   (public.get_my_role() = 'ftc');
