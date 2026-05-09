import postgres from 'postgres'

const sql = postgres(process.env.POSTGRES_URL_NON_POOLING, {
  ssl: 'require',
})

async function main() {
  console.log('[v0] Running database migration...')

  // Create profiles table
  await sql`
    CREATE TABLE IF NOT EXISTS public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name TEXT,
      avatar_url TEXT,
      credits INTEGER DEFAULT 3,
      plan TEXT DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('[v0] profiles table created')

  await sql`ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`

  // Drop policies if they exist, then recreate
  await sql`DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles`
  await sql`DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles`
  await sql`DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles`
  await sql`DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles`

  await sql`CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id)`
  await sql`CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id)`
  await sql`CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id)`
  await sql`CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id)`
  console.log('[v0] profiles RLS policies created')

  // Create headshots table
  await sql`
    CREATE TABLE IF NOT EXISTS public.headshots (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      source_image_url TEXT,
      style TEXT DEFAULT 'professional',
      prompt TEXT,
      is_favorite BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  console.log('[v0] headshots table created')

  await sql`ALTER TABLE public.headshots ENABLE ROW LEVEL SECURITY`

  await sql`DROP POLICY IF EXISTS "headshots_select_own" ON public.headshots`
  await sql`DROP POLICY IF EXISTS "headshots_insert_own" ON public.headshots`
  await sql`DROP POLICY IF EXISTS "headshots_update_own" ON public.headshots`
  await sql`DROP POLICY IF EXISTS "headshots_delete_own" ON public.headshots`

  await sql`CREATE POLICY "headshots_select_own" ON public.headshots FOR SELECT USING (auth.uid() = user_id)`
  await sql`CREATE POLICY "headshots_insert_own" ON public.headshots FOR INSERT WITH CHECK (auth.uid() = user_id)`
  await sql`CREATE POLICY "headshots_update_own" ON public.headshots FOR UPDATE USING (auth.uid() = user_id)`
  await sql`CREATE POLICY "headshots_delete_own" ON public.headshots FOR DELETE USING (auth.uid() = user_id)`
  console.log('[v0] headshots RLS policies created')

  // Auto-create profile trigger
  await sql`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
    BEGIN
      INSERT INTO public.profiles (id, full_name)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$
  `
  await sql`DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users`
  await sql`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
  `
  console.log('[v0] profile trigger created')

  console.log('[v0] Migration complete!')
  await sql.end()
}

main().catch((err) => {
  console.error('[v0] Migration failed:', err)
  process.exit(1)
})
