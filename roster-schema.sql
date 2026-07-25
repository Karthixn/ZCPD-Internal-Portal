-- ─────────────────────────────────────────────────────────────
--  ZCPD · Public Roster / Rank Tree + officer photos
--  Run this in the Supabase SQL editor (or `supabase db push`).
-- ─────────────────────────────────────────────────────────────

-- 1. Photo column on officers ----------------------------------
alter table public.officers
  add column if not exists avatar_path text;   -- object path inside the 'avatars' bucket


-- 2. Avatars storage bucket (small images — safe on the free tier)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Anyone may view avatars …
drop policy if exists av_read on storage.objects;
create policy av_read on storage.objects
  for select using (bucket_id = 'avatars');

-- … any signed-in user may upload / replace (the UI only lets a user
--    reach their own photo; FTC/FTI manage others from the Officers page).
drop policy if exists av_write on storage.objects;
create policy av_write on storage.objects
  for all
  using      (bucket_id = 'avatars' and auth.role() = 'authenticated')
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');


-- 3. Public roster view -----------------------------------------
-- Exposes ONLY display-safe columns of ALL officers to the public.
-- (Sensitive fields — duty hours, discord, remarks — are never selected.)
create or replace view public.public_roster as
  select id, name, rank, badge_no, designation, avatar_path, status
  from public.officers;

grant select on public.public_roster to anon, authenticated;
