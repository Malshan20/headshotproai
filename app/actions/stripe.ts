"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { stripe } from "@/lib/stripe"
import { PLANS, UNLIMITED_CREDITS, type PlanId } from "@/lib/plans"
import { headers } from "next/headers"

async function getBaseUrl() {
  const hdrs = await headers()
  const host = hdrs.get("host") ?? "localhost:3000"
  const proto = host.includes("localhost") ? "http" : "https"
  return `${proto}://${host}`
}

// ── Create or retrieve Stripe customer ────────────────────────────────────────
async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const supabase = await createClient()

  // Check existing
  const { data: existing } = await supabase
    .from("stripe_customers")
    .select("customer_id")
    .eq("user_id", userId)
    .single()

  if (existing?.customer_id) return existing.customer_id

  // Create new in Stripe
  const customer = await stripe.customers.create({ email, metadata: { supabase_uid: userId } })

  // Store in DB
  await supabase.from("stripe_customers").upsert({
    user_id: userId,
    customer_id: customer.id,
    plan: "free",
    status: "inactive",
  })

  return customer.id
}

// ── Start Checkout session ────────────────────────────────────────────────────
export async function createCheckoutSession(planId: PlanId): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const plan = PLANS.find((p) => p.id === planId)
  if (!plan || !plan.priceId) throw new Error("Invalid plan or missing price ID")

  const baseUrl = await getBaseUrl()
  const customerId = await getOrCreateStripeCustomer(user.id, user.email!)

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${baseUrl}/billing?success=1&plan=${planId}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/billing?canceled=1`,
    metadata: { user_id: user.id, plan_id: planId },
    subscription_data: { metadata: { user_id: user.id, plan_id: planId } },
  })

  redirect(session.url!)
}

// ── Open Stripe Customer Portal ───────────────────────────────────────────────
export async function createPortalSession(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: sc } = await supabase
    .from("stripe_customers")
    .select("customer_id")
    .eq("user_id", user.id)
    .single()

  if (!sc?.customer_id) throw new Error("No Stripe customer found")

  const baseUrl = await getBaseUrl()
  const session = await stripe.billingPortal.sessions.create({
    customer: sc.customer_id,
    return_url: `${baseUrl}/billing`,
  })

  redirect(session.url)
}

// ── Sync subscription after successful checkout (no webhook needed) ───────────
// Called server-side when user returns from Stripe with ?session_id=
// Uses service client so it can write regardless of RLS row existence.
export async function syncSubscription(sessionId: string): Promise<{ plan: string } | null> {
  // Verify the currently logged-in user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  try {
    // Retrieve the Checkout Session directly from Stripe — this is the source of truth
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    })

    // Only proceed if payment was actually completed
    if (session.payment_status !== "paid") return null

    // Guard: session must belong to this user (prevent session_id spoofing)
    const sessionUserId = session.metadata?.user_id
    if (sessionUserId && sessionUserId !== user.id) return null

    const sub = session.subscription as import("stripe").Stripe.Subscription
    const planId = (session.metadata?.plan_id as PlanId) ?? "pro"
    const plan = PLANS.find((p) => p.id === planId)

    // Safely resolve current_period_end — location differs across Stripe API versions
    const periodEndRaw: number | undefined =
      (sub as any).current_period_end ??
      (sub as any).items?.data?.[0]?.current_period_end ??
      undefined

    const currentPeriodEnd = periodEndRaw
      ? new Date(periodEndRaw * 1000).toISOString()
      : null

    // Use service client to bypass RLS — this is trusted server-side code
    const admin = createServiceClient()

    // Upsert stripe_customers row (works even if no row exists yet)
    const { error: scError } = await admin.from("stripe_customers").upsert(
      {
        user_id: user.id,
        customer_id: session.customer as string,
        subscription_id: sub.id,
        price_id: sub.items.data[0]?.price?.id ?? null,
        plan: planId,
        status: sub.status,
        current_period_end: currentPeriodEnd,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )

    if (scError) {
      console.error("[syncSubscription] stripe_customers upsert error:", scError.message)
    }

    // Replenish credits — business plan gets the unlimited sentinel value
    const newCredits = plan?.credits ?? 3

    // Update the profile plan + replenish credits
    const { error: profileError } = await admin
      .from("profiles")
      .update({
        plan: planId,
        credits: newCredits,
        stripe_customer_id: session.customer as string,
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("[syncSubscription] profiles update error:", profileError.message)
    }

    // Revalidate here (inside a Server Action) — NOT in the page render
    revalidatePath("/billing")
    revalidatePath("/dashboard")

    return { plan: planId }
  } catch (err) {
    console.error("[syncSubscription] error:", err)
    return null
  }
}

// ── Get current subscription status ──────────────────────────────────────────
export async function getSubscriptionStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("stripe_customers")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return data
}
