import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import BillingClient from "@/components/billing/BillingClient"
import { syncSubscription } from "@/app/actions/stripe"

interface Props {
  searchParams: Promise<{ success?: string; canceled?: string; session_id?: string; plan?: string }>
}

export default async function BillingPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const params = await searchParams

  // Sync subscription after successful checkout — server-verifies session with Stripe directly
  // revalidatePath is called inside syncSubscription (Server Action), not here
  if (params.success && params.session_id) {
    await syncSubscription(params.session_id)
  }

  const [{ data: profile }, { data: stripeCustomer }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("stripe_customers").select("*").eq("user_id", user.id).maybeSingle(),
  ])

  return (
    <BillingClient
      user={{ id: user.id, email: user.email ?? "" }}
      profile={profile}
      stripeCustomer={stripeCustomer}
      justUpgraded={!!params.success}
      justCanceled={!!params.canceled}
    />
  )
}