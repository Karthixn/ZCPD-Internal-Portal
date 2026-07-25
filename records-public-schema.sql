-- ─────────────────────────────────────────────────────────────
--  ZCPD · Publish records to the public "Police Blotter"
--  Run this in the Supabase SQL editor (or `supabase db push`).
-- ─────────────────────────────────────────────────────────────

-- Per-record visibility flag (default hidden).
alter table public.records
  add column if not exists is_public boolean default false;

-- Public view: only records explicitly marked public, display-safe columns.
create or replace view public.public_records as
  select id, title, type, description, officer_name, incident_date, reference_no, created_at
  from public.records
  where is_public = true;

grant select on public.public_records to anon, authenticated;
