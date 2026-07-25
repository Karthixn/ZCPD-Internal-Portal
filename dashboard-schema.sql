-- ─────────────────────────────────────────────────────────────
--  ZCPD · Dashboard — Events & Activity log
--  Run this in the Supabase SQL editor (or `supabase db push`).
-- ─────────────────────────────────────────────────────────────

-- 1. Events -----------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    text default 'Event',
  event_date  date not null,
  event_time  text,
  created_at  timestamptz default now()
);

alter table public.events enable row level security;

drop policy if exists ev_read  on public.events;
create policy ev_read  on public.events
  for select using (public.get_my_role() in ('ftc','fti','fto','officer'));

drop policy if exists ev_write on public.events;
create policy ev_write on public.events
  for all using (public.get_my_role() in ('ftc','fti'))
  with check   (public.get_my_role() in ('ftc','fti'));


-- 2. Activity log ----------------------------------------------
create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  action      text not null,     -- human-readable line, e.g. "Promoted John Doe to SI"
  kind        text,              -- 'officer' | 'promotion' | 'news' | 'record' | …
  actor       text,              -- who performed it
  created_at  timestamptz default now()
);

alter table public.activity_log enable row level security;

drop policy if exists al_read on public.activity_log;
create policy al_read on public.activity_log
  for select using (public.get_my_role() in ('ftc','fti','fto','officer'));

-- Any signed-in staff member may append log lines (never update/delete).
drop policy if exists al_insert on public.activity_log;
create policy al_insert on public.activity_log
  for insert with check (auth.role() = 'authenticated');
