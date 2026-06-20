-- ============================================================
-- ZCPD PORTAL — SUPABASE SCHEMA
-- Paste this entire file into Supabase SQL Editor → Run
-- ============================================================

-- 1. Officers (main roster)
CREATE TABLE IF NOT EXISTS officers (
  id                  SERIAL PRIMARY KEY,
  name                TEXT NOT NULL,
  rank                TEXT NOT NULL,
  designation         TEXT,
  badge_no            TEXT UNIQUE NOT NULL,
  discord_id          TEXT,
  status              TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','LEAVE','EXCEPTION','TERMINATED','RESIGNED')),
  remarks             TEXT,
  last_promotion_date DATE,
  next_promotion      TEXT,
  total_duty_hrs      NUMERIC(8,2) DEFAULT 0,
  months_served       INTEGER DEFAULT 0,
  eligibility         TEXT DEFAULT 'NOT ELIGIBLE',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (one per auth user)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  officer_id  INTEGER REFERENCES officers(id) ON DELETE SET NULL,
  role        TEXT NOT NULL DEFAULT 'officer' CHECK (role IN ('ftc','fti','fto','officer')),
  is_active   BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 3. SWAT members
CREATE TABLE IF NOT EXISTS swat_members (
  id            SERIAL PRIMARY KEY,
  officer_id    INTEGER REFERENCES officers(id) ON DELETE CASCADE,
  squad         TEXT NOT NULL CHECK (squad IN ('ALPHA','DELTA','BRAVO','CHARLIE')),
  badge_no      TEXT NOT NULL,
  role          TEXT DEFAULT 'member' CHECK (role IN ('squad_leader','member')),
  discord_id    TEXT,
  status        TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  joined_date   DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cadet applications (full pipeline)
CREATE TABLE IF NOT EXISTS cadet_applications (
  id                      SERIAL PRIMARY KEY,
  name                    TEXT NOT NULL,
  discord_username        TEXT,
  badge_no                TEXT,
  batch_no                INTEGER,
  joining_date            DATE,
  assigned_fto            TEXT,
  referred_by             TEXT,
  discord_interview_done  BOOLEAN DEFAULT FALSE,
  discord_interview_date  DATE,
  discord_interviewer     TEXT,
  discord_interview_pass  BOOLEAN,
  discord_interview_notes TEXT,
  ingame_interview_done   BOOLEAN DEFAULT FALSE,
  ingame_interview_date   DATE,
  ingame_interviewer      TEXT,
  ingame_interview_pass   BOOLEAN,
  ingame_interview_notes  TEXT,
  roles_given_date        DATE,
  charge_taken_by         TEXT,
  phase1_status           TEXT DEFAULT 'NOT COMPLETED',
  phase1_date             DATE,
  phase1_fto              TEXT,
  phase2_status           TEXT DEFAULT 'NOT COMPLETED',
  phase2_date             DATE,
  phase2_fto              TEXT,
  phase3_status           TEXT DEFAULT 'NOT COMPLETED',
  phase3_date             DATE,
  phase3_fto              TEXT,
  po_test_status          TEXT DEFAULT 'NOT COMPLETED',
  po_test_date            DATE,
  po_test_score           INTEGER,
  status                  TEXT DEFAULT 'IN PROGRESS',
  promoted_date           DATE,
  exit_reason             TEXT,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FTO weekly reports
CREATE TABLE IF NOT EXISTS fto_weekly_reports (
  id            SERIAL PRIMARY KEY,
  cadet_id      INTEGER REFERENCES cadet_applications(id) ON DELETE CASCADE,
  fto_name      TEXT NOT NULL,
  week_number   INTEGER NOT NULL,
  duty_hrs      NUMERIC(5,2),
  activities    TEXT,
  performance   TEXT CHECK (performance IN ('EXCELLENT','GOOD','AVERAGE','POOR')),
  remarks       TEXT,
  report_date   DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PO test results (11-criteria rubric)
CREATE TABLE IF NOT EXISTS po_test_results (
  id                SERIAL PRIMARY KEY,
  cadet_id          INTEGER REFERENCES cadet_applications(id) ON DELETE CASCADE,
  fto_name          TEXT NOT NULL,
  fto_badge         TEXT,
  fto_designation   TEXT,
  test_date         DATE NOT NULL,
  equip_uniform     INTEGER CHECK (equip_uniform BETWEEN 1 AND 5),
  job_knowledge     INTEGER CHECK (job_knowledge BETWEEN 1 AND 5),
  traffic_citizen   INTEGER CHECK (traffic_citizen BETWEEN 1 AND 5),
  radio_comms       INTEGER CHECK (radio_comms BETWEEN 1 AND 5),
  discipline        INTEGER CHECK (discipline BETWEEN 1 AND 5),
  case_handling     INTEGER CHECK (case_handling BETWEEN 1 AND 5),
  teamwork          INTEGER CHECK (teamwork BETWEEN 1 AND 5),
  initiative        INTEGER CHECK (initiative BETWEEN 1 AND 5),
  adaptability      INTEGER CHECK (adaptability BETWEEN 1 AND 5),
  time_mgmt         INTEGER CHECK (time_mgmt BETWEEN 1 AND 5),
  recommendation    TEXT CHECK (recommendation IN ('PASSED','NEEDS IMPROVEMENT','UNSATISFACTORY')),
  overall_remarks   TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Phase training logs
CREATE TABLE IF NOT EXISTS phase_training_logs (
  id              SERIAL PRIMARY KEY,
  phase_number    INTEGER NOT NULL,
  batch_no        INTEGER,
  venue           TEXT,
  training_date   DATE NOT NULL,
  time_start      TIME,
  time_end        TIME,
  cadets_present  TEXT[],
  training_given  TEXT[],
  instructors     TEXT[],
  summary         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Promotion history
CREATE TABLE IF NOT EXISTS promotion_history (
  id            SERIAL PRIMARY KEY,
  officer_id    INTEGER REFERENCES officers(id) ON DELETE CASCADE,
  from_rank     TEXT,
  to_rank       TEXT NOT NULL,
  promoted_date DATE NOT NULL,
  approved_by   TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Monthly salary
CREATE TABLE IF NOT EXISTS monthly_salary (
  id              SERIAL PRIMARY KEY,
  officer_id      INTEGER REFERENCES officers(id) ON DELETE CASCADE,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year            INTEGER NOT NULL,
  duty_hrs        NUMERIC(8,2) DEFAULT 0,
  base_amount     BIGINT DEFAULT 0,
  auction_amount  BIGINT DEFAULT 0,
  bonus           BIGINT DEFAULT 0,
  notes           TEXT,
  UNIQUE (officer_id, month, year)
);

-- 10. Weapon log
CREATE TABLE IF NOT EXISTS weapon_log (
  id                SERIAL PRIMARY KEY,
  log_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  weapon_type       TEXT NOT NULL,
  qty_transported   INTEGER DEFAULT 0,
  locker_number     TEXT,
  confiscated_count INTEGER DEFAULT 0,
  in_locker_count   INTEGER DEFAULT 0,
  logged_by         TEXT,
  meeting_ref       TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Records (incidents, case files, documents)
CREATE TABLE IF NOT EXISTS records (
  id            SERIAL PRIMARY KEY,
  title         TEXT NOT NULL,
  type          TEXT DEFAULT 'Incident Report',
  description   TEXT,
  officer_name  TEXT,
  incident_date DATE,
  reference_no  TEXT,
  tags          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

DO $$ BEGIN
  ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE swat_members ENABLE ROW LEVEL SECURITY;
  ALTER TABLE cadet_applications ENABLE ROW LEVEL SECURITY;
  ALTER TABLE fto_weekly_reports ENABLE ROW LEVEL SECURITY;
  ALTER TABLE po_test_results ENABLE ROW LEVEL SECURITY;
  ALTER TABLE phase_training_logs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE promotion_history ENABLE ROW LEVEL SECURITY;
  ALTER TABLE monthly_salary ENABLE ROW LEVEL SECURITY;
  ALTER TABLE weapon_log ENABLE ROW LEVEL SECURITY;
  ALTER TABLE records ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Drop existing policies first
DO $$ DECLARE r RECORD;
BEGIN
  FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Officers: fto+ read, fti+ write
CREATE POLICY o_read  ON officers FOR SELECT USING (get_my_role() IN ('ftc','fti','fto','officer'));
CREATE POLICY o_write ON officers FOR ALL    USING (get_my_role() IN ('ftc','fti'));

-- Profiles: own + ftc sees all
CREATE POLICY p_read  ON profiles FOR SELECT USING (id = auth.uid() OR get_my_role() = 'ftc');
CREATE POLICY p_write ON profiles FOR ALL    USING (get_my_role() = 'ftc');

-- SWAT
CREATE POLICY sw_read  ON swat_members FOR SELECT USING (get_my_role() IN ('ftc','fti','fto'));
CREATE POLICY sw_write ON swat_members FOR ALL    USING (get_my_role() IN ('ftc','fti'));

-- Cadets
CREATE POLICY ca_read  ON cadet_applications FOR SELECT USING (get_my_role() IN ('ftc','fti','fto'));
CREATE POLICY ca_write ON cadet_applications FOR ALL    USING (get_my_role() IN ('ftc','fti','fto'));

-- Weekly reports
CREATE POLICY wr_read  ON fto_weekly_reports FOR SELECT USING (get_my_role() IN ('ftc','fti','fto'));
CREATE POLICY wr_write ON fto_weekly_reports FOR ALL    USING (get_my_role() IN ('ftc','fti','fto'));

-- PO tests
CREATE POLICY pt_read  ON po_test_results FOR SELECT USING (get_my_role() IN ('ftc','fti','fto'));
CREATE POLICY pt_write ON po_test_results FOR ALL    USING (get_my_role() IN ('ftc','fti','fto'));

-- Phase logs
CREATE POLICY pl_read  ON phase_training_logs FOR SELECT USING (get_my_role() IN ('ftc','fti','fto'));
CREATE POLICY pl_write ON phase_training_logs FOR ALL    USING (get_my_role() IN ('ftc','fti','fto'));

-- Promotions
CREATE POLICY ph_read  ON promotion_history FOR SELECT USING (get_my_role() IN ('ftc','fti','fto'));
CREATE POLICY ph_write ON promotion_history FOR ALL    USING (get_my_role() IN ('ftc','fti'));

-- Salary (FTC only)
CREATE POLICY sa_read  ON monthly_salary FOR SELECT USING (get_my_role() = 'ftc');
CREATE POLICY sa_write ON monthly_salary FOR ALL    USING (get_my_role() = 'ftc');

-- Weapons
CREATE POLICY wl_read  ON weapon_log FOR SELECT USING (get_my_role() IN ('ftc','fti'));
CREATE POLICY wl_write ON weapon_log FOR ALL    USING (get_my_role() IN ('ftc','fti'));

-- Records
CREATE POLICY rc_read  ON records FOR SELECT USING (get_my_role() IN ('ftc','fti','fto'));
CREATE POLICY rc_write ON records FOR ALL    USING (get_my_role() IN ('ftc','fti'));
