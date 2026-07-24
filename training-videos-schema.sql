-- ─────────────────────────────────────────────────────────────
--  ZCPD · Training Videos  (YouTube-backed)
--  Run this in the Supabase SQL editor (or `supabase db push`).
--
--  Videos are hosted on YouTube (unlisted). We only store the link,
--  so there is no storage bucket and no file-size limit.
-- ─────────────────────────────────────────────────────────────

create table if not exists public.training_videos (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  category     text default 'General',
  youtube_url  text not null,          -- full YouTube link (watch / youtu.be / shorts / embed)
  sort_order   int  default 0,
  created_at   timestamptz default now()
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


-- ── If you already ran the earlier (Supabase-Storage) version of this
--    table, run these instead of the CREATE above to migrate it:
--
--   alter table public.training_videos add column if not exists youtube_url text;
--   alter table public.training_videos alter column storage_path drop not null;
--   -- (optional) drop the old column once data is migrated:
--   -- alter table public.training_videos drop column storage_path;
--   -- and remove the old bucket in Storage → Buckets → training-videos.
