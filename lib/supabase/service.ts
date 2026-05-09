import "server-only"
import { createClient } from "@supabase/supabase-js"

// Bypasses RLS. Only use in trusted server contexts (webhooks, admin routes).
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
