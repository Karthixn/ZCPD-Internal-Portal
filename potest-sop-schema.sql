-- ─────────────────────────────────────────────────────────────
--  ZCPD · Add SOP-knowledge score to PO test results
--  Run this in the Supabase SQL editor.
--  SOP is scored out of 10; the other 10 criteria are out of 5,
--  so the maximum PO test score is now 60.
-- ─────────────────────────────────────────────────────────────

alter table public.po_test_results
  add column if not exists sop integer default 0;
