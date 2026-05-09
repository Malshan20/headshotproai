import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createServiceClient } from "@/lib/supabase/service"
import { PLANS, type PlanId } from "@/lib/plans"
import type Stripe from "stripe"

export const runtime = "nodejs"

// Disable body parsing — Stripe requires the raw body for signature verification
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error("[stripe/webhook] Signature verification failed:", err.message)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = createServiceClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== "subscription") break

        const userId = session.metadata?.user_id
        const planId = (session.metadata?.plan_id as PlanId) ?? "pro"
        if (!userId) break

        const sub = await stripe.subscriptions.retrieve(session.subscription as string)
        const plan = PLANS.find((p) => p.id === planId)

        await supabase.from("stripe_customers").upsert({
          user_id: userId,
          customer_id: session.customer as string,
          subscription_id: sub.id,
          price_id: sub.items.data[0].price.id,
          plan: planId,
          status: sub.status,
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })

        await supabase.from("profiles").update({
          plan: planId,
          credits: plan?.credits ?? 3,
          stripe_customer_id: session.customer as string,
        }).eq("id", userId)

        break
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.user_id

        // Look up user by customer_id if metadata missing
        let resolvedUserId = userId
        if (!resolvedUserId) {
          const { data } = await supabase
            .from("stripe_customers")
            .select("user_id")
            .eq("customer_id", sub.customer as string)
            .single()
          resolvedUserId = data?.user_id
        }
        if (!resolvedUserId) break

        const priceId = sub.items.data[0].price.id
        const plan = PLANS.find((p) => p.priceId === priceId)
        const planId = plan?.id ?? "free"

        await supabase.from("stripe_customers").upsert({
          user_id: resolvedUserId,
          customer_id: sub.customer as string,
          subscription_id: sub.id,
          price_id: priceId,
          plan: planId,
          status: sub.status,
          current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (sub.status === "active") {
          await supabase.from("profiles").update({
            plan: planId,
            credits: plan?.credits ?? 3,
          }).eq("id", resolvedUserId)
        }

        break
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription

        const { data: sc } = await supabase
          .from("stripe_customers")
          .select("user_id")
          .eq("customer_id", sub.customer as string)
          .single()

        if (!sc?.user_id) break

        await supabase.from("stripe_customers").update({
          plan: "free",
          status: "canceled",
          subscription_id: null,
          price_id: null,
          current_period_end: null,
          updated_at: new Date().toISOString(),
        }).eq("user_id", sc.user_id)

        await supabase.from("profiles").update({
          plan: "free",
          credits: 3,
        }).eq("id", sc.user_id)

        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        const { data: sc } = await supabase
          .from("stripe_customers")
          .select("user_id")
          .eq("customer_id", customerId)
          .single()

        if (sc?.user_id) {
          await supabase.from("stripe_customers").update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          }).eq("user_id", sc.user_id)
        }

        break
      }

      default:
        // Unhandled event type — not an error
        break
    }
  } catch (err: any) {
    console.error("[stripe/webhook] Handler error:", err.message)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
