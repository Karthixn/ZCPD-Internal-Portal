-- ─────────────────────────────────────────────────────────────
--  ZCPD · Give PO (officer role) read-only access
--    • view Records
--    • view their OWN training status (matched by badge number)
--  Run this in the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────

-- Helper: the badge number of the currently signed-in user.
create or replace function public.my_badge()
  returns text language sql stable security definer set search_path = public as $$
  select o.badge_no
  from public.profiles p
  join public.officers o on o.id = p.officer_id
  where p.id = auth.uid()
  limit 1;
$$;

-- Records — officers may read (view only; writes stay FTC/FTI).
drop policy if exists rc_read on public.records;
create policy rc_read on public.records
  for select using (public.get_my_role() in ('ftc','fti','fto','officer'));

-- Cadet record — an officer may read their OWN row (badge match).
drop policy if exists ca_read_self on public.cadet_applications;
create policy ca_read_self on public.cadet_applications
  for select using (badge_no = public.my_badge());

-- PO test results — own only.
drop policy if exists pt_read_self on public.po_test_results;
create policy pt_read_self on public.po_test_results
  for select using (cadet_id in (select id from public.cadet_applications where badge_no = public.my_badge()));

-- Weekly FTO reports — own only.
drop policy if exists wr_read_self on public.fto_weekly_reports;
create policy wr_read_self on public.fto_weekly_reports
  for select using (cadet_id in (select id from public.cadet_applications where badge_no = public.my_badge()));
