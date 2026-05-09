import os
import urllib.request
import urllib.error
import json

supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "").rstrip("/")
service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not supabase_url or not service_role_key:
    raise SystemExit("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")

statements = [
    # stripe_customers
    """CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL UNIQUE,
  price_id TEXT,
  subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)""",
    "ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY",
    """DO $$ BEGIN
  CREATE POLICY "sc_select_own" ON public.stripe_customers FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "sc_insert_own" ON public.stripe_customers FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "sc_update_own" ON public.stripe_customers FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",

    # teams
    """CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'business',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)""",
    "ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY",
    """DO $$ BEGIN
  CREATE POLICY "teams_select" ON public.teams FOR SELECT USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = id AND tm.user_id = auth.uid() AND tm.status = 'active')
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "teams_insert" ON public.teams FOR INSERT WITH CHECK (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "teams_update" ON public.teams FOR UPDATE USING (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "teams_delete" ON public.teams FOR DELETE USING (auth.uid() = owner_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",

    # team_members
    """CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'pending',
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)""",
    "ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY",
    """DO $$ BEGIN
  CREATE POLICY "tm_select" ON public.team_members FOR SELECT USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "tm_insert" ON public.team_members FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "tm_update" ON public.team_members FOR UPDATE USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "tm_delete" ON public.team_members FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",

    # team_invites
    """CREATE TABLE IF NOT EXISTS public.team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)""",
    "ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY",
    """DO $$ BEGIN
  CREATE POLICY "ti_select" ON public.team_invites FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid()) OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "ti_insert" ON public.team_invites FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "ti_update" ON public.team_invites FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid()) OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",
    """DO $$ BEGIN
  CREATE POLICY "ti_delete" ON public.team_invites FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.teams t WHERE t.id = team_id AND t.owner_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$""",

    # extend profiles
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL",
    "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT",
]

url = f"{supabase_url}/rest/v1/rpc/exec_sql"
headers = {
    "apikey": service_role_key,
    "Authorization": f"Bearer {service_role_key}",
    "Content-Type": "application/json",
}

def run_sql(stmt):
    body = json.dumps({"query": stmt}).encode()
    req = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

# Try pg_net approach via /rest/v1/rpc — fallback to direct pg
# Supabase exposes a SQL endpoint at /rest/v1/ but not raw SQL.
# Use the management API if available, otherwise use psycopg2 via POSTGRES_URL
postgres_url = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL")
if not postgres_url:
    raise SystemExit("No POSTGRES_URL found")

try:
    import psycopg2
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary", "-q"])
    import psycopg2

conn = psycopg2.connect(postgres_url)
conn.autocommit = True
cur = conn.cursor()

success = 0
for stmt in statements:
    try:
        cur.execute(stmt)
        print(f"OK: {stmt[:70].strip().replace(chr(10), ' ')}...")
        success += 1
    except Exception as e:
        msg = str(e).strip()
        if "already exists" in msg or "duplicate" in msg.lower():
            print(f"SKIP: {stmt[:50].strip()}")
        else:
            print(f"ERROR: {msg[:120]}")

cur.close()
conn.close()
print(f"\nDone: {success}/{len(statements)} statements executed.")
