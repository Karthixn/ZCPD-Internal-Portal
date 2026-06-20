# ZCPD Internal Portal

## Quick start — 3 steps

### Step 1 — Supabase
1. Go to https://supabase.com → New project → name: `zcpd-portal`
2. SQL Editor → New Query → paste `supabase-schema.sql` → Run
3. Settings → API → copy **Project URL** and **anon/public key**

### Step 2 — Environment
```bash
cp .env.example .env
# Edit .env:
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3 — Run
```bash
npm install
npm run dev
# → http://localhost:5173
```

---

## Your first login (FTC account)
1. Supabase → Authentication → Users → **Add user** → your email + password
2. Copy your UUID
3. SQL Editor:
```sql
UPDATE profiles SET role = 'ftc' WHERE id = 'paste-uuid-here';
```
4. Log in at http://localhost:5173/login — you have full FTC access

---

## Creating other officer accounts
1. Supabase → Authentication → Users → Add user → set email + temp password
2. Go to Admin panel in the portal → find the new user → change role from dropdown
   OR run in SQL:
```sql
-- First make sure officer row exists
INSERT INTO officers (name, rank, badge_no, status)
VALUES ('Cyrus Iyer', 'CI', 'DSP-604', 'ACTIVE')
ON CONFLICT (badge_no) DO NOTHING;

-- Link user to officer and set role
UPDATE profiles
SET role = 'fti',
    officer_id = (SELECT id FROM officers WHERE badge_no = 'DSP-604')
WHERE id = 'their-auth-uuid';
```

---

## Role access
| Role    | What they see |
|---------|--------------|
| **FTC** | Everything — admin, salary, all modules |
| **FTI** | Officers, SWAT, FTO portal (read/oversee), Records, Weapons, SOP |
| **FTO** | Officers, SWAT, FTO portal (write cadets), SOP |
| **Officer** | Dashboard, SOP only |

---

## Pages built
| Page | Route | Access |
|------|-------|--------|
| Login | /login | Public |
| Dashboard | /dashboard | All |
| Officers roster | /officers | FTO+ |
| S.W.A.T roster | /swat | FTO+ |
| FTO Portal | /fto | FTO+ |
| → Cadet list | /fto | FTO+ |
| → New cadet | /fto/new-cadet | FTO+ |
| → Cadet detail | /fto/cadet/:id | FTO+ |
| → Weekly report | modal in detail | FTO+ |
| → PO test | modal in detail | FTO+ |
| → Training log | modal in detail | FTO+ |
| Records | /records | FTI+ |
| Weapon log | /weapons | FTI+ |
| Salary & Duty | /salary | FTC only |
| SOP Library | /sop | All |
| Admin panel | /admin | FTC only |

---

## Deploy to VPS (Nginx)
```bash
npm run build
# Copy dist/ to /var/www/zcpd/
# Nginx config:
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/zcpd;
  index index.html;
  location / { try_files $uri $uri/ /index.html; }
}
```
