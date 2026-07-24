-- ─────────────────────────────────────────────────────────────
--  ZCPD · Training Videos
--  Run this in the Supabase SQL editor (or `supabase db push`).
-- ─────────────────────────────────────────────────────────────

-- 1. Table -------------------------------------------------------
create table if not exists public.training_videos (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  category      text default 'General',
  storage_path  text not null,            -- object path inside the 'training-videos' bucket
  sort_order    int  default 0,
  created_at    timestamptz default now()
);

alter table public.training_videos enable row level security;

-- Public (unauthenticated) can read the video list …
drop policy if exists tv_read  on public.training_videos;
create policy tv_read  on public.training_videos
  for select using (true);

-- … but only FTC / FTI can add / edit / remove.
drop policy if exists tv_write on public.training_videos;
create policy tv_write on public.training_videos
  for all using (public.get_my_role() in ('ftc','fti'))
  with check   (public.get_my_role() in ('ftc','fti'));


-- 2. Storage bucket ---------------------------------------------
-- Public bucket so the <video> element can stream directly.
insert into storage.buckets (id, name, public)
values ('training-videos', 'training-videos', true)
on conflict (id) do update set public = true;

-- Anyone may read objects from this bucket …
drop policy if exists tv_obj_read on storage.objects;
create policy tv_obj_read on storage.objects
  for select using (bucket_id = 'training-videos');

-- … only FTC / FTI may upload / update / delete.
drop policy if exists tv_obj_write on storage.objects;
create policy tv_obj_write on storage.objects
  for all
  using      (bucket_id = 'training-videos' and public.get_my_role() in ('ftc','fti'))
  with check (bucket_id = 'training-videos' and public.get_my_role() in ('ftc','fti'));
