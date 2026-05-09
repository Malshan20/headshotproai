"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { gsap } from "@/lib/gsap"
import { createCheckoutSession, createPortalSession } from "@/app/actions/stripe"
import { PLANS, isUnlimited, UNLIMITED_CREDITS, type PlanId } from "@/lib/plans"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  Sparkles, Check, Zap, Building2, Crown, ArrowLeft,
  CreditCard, ExternalLink, AlertCircle, CheckCircle2,
} from "lucide-react"

type Profile = {
  full_name: string | null
  credits: number
  plan: string
}

type StripeCustomer = {
  plan: string
  status: string
  current_period_end: string | null
  subscription_id: string | null
} | null

type Props = {
  user: { id: string; email: string }
  profile: Profile | null
  stripeCustomer: StripeCustomer
  justUpgraded: boolean
  justCanceled: boolean
}

const planIcons: Record<string, React.ReactNode> = {
  free: <Sparkles className="w-5 h-5" />,
  pro: <Zap className="w-5 h-5" />,
  business: <Building2 className="w-5 h-5" />,
}

export default function BillingClient({ user, profile, stripeCustomer, justUpgraded, justCanceled }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null)
  const [isPortalLoading, setIsPortalLoading] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  const currentPlan = (profile?.plan ?? "free") as PlanId

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
      if (cardsRef.current?.children) {
        gsap.fromTo(
          Array.from(cardsRef.current.children),
          { opacity: 0, y: 40, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.1, ease: "power3.out", delay: 0.2 }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  function handleUpgrade(planId: PlanId) {
    if (planId === "free" || planId === currentPlan) return
    setLoadingPlan(planId)
    startTransition(async () => {
      await createCheckoutSession(planId)
      setLoadingPlan(null)
    })
  }

  function handlePortal() {
    setIsPortalLoading(true)
    startTransition(async () => {
      await createPortalSession()
      setIsPortalLoading(false)
    })
  }

  const hasActiveSubscription = stripeCustomer?.status === "active" && currentPlan !== "free"
  const periodEnd = stripeCustomer?.current_period_end
    ? new Date(stripeCustomer.current_period_end).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header ref={headerRef} className="opacity-0 border-b border-border glass sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground text-sm">PortraifyAI</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">Settings</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Toast notifications */}
        {justUpgraded && (
          <div className="mb-8 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Your plan has been upgraded successfully! Enjoy your new features.</p>
          </div>
        )}
        {justCanceled && (
          <div className="mb-8 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Checkout was canceled. Your plan hasn&apos;t changed.</p>
          </div>
        )}

        {/* Page heading */}
        <div className="text-center mb-12">
          <Crown className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-foreground mb-3 text-balance">Plans &amp; Billing</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Choose the plan that fits your needs. Upgrade, downgrade, or manage your subscription anytime.
          </p>
        </div>

        {/* Current subscription status */}
        {hasActiveSubscription && (
          <div className="mb-10 glass rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {planIcons[currentPlan]}
              </div>
              <div>
                <p className="font-semibold text-foreground capitalize">{currentPlan} Plan — Active</p>
                {periodEnd && <p className="text-sm text-muted-foreground">Renews on {periodEnd}</p>}
              </div>
            </div>
            <button
              onClick={handlePortal}
              disabled={isPortalLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-primary/50 text-sm font-medium text-foreground hover:text-primary transition-all disabled:opacity-60 whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4" />
              {isPortalLoading ? "Opening portal..." : "Manage Billing"}
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Plan cards */}
        <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan
            const isUpgrade = PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === currentPlan)
            const isLoading = loadingPlan === plan.id

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]"
                    : "glass border border-border hover:border-primary/30"
                } ${isCurrent ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-foreground text-primary text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">
                    Current
                  </div>
                )}

                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                  plan.highlighted ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"
                }`}>
                  {planIcons[plan.id]}
                </div>

                <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className={`text-4xl font-extrabold ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      /month
                    </span>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-primary-foreground/80" : "text-primary"}`} />
                      <span className={plan.highlighted ? "text-primary-foreground/90" : "text-foreground/80"}>{feat}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === "free" ? (
                  <div className={`text-center text-sm py-2 rounded-xl font-medium ${
                    isCurrent ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                  }`}>
                    {isCurrent ? "Your current plan" : "Always free"}
                  </div>
                ) : isCurrent ? (
                  <button
                    onClick={handlePortal}
                    disabled={isPortalLoading}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 ${
                      plan.highlighted
                        ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                        : "border border-border hover:border-primary/40 text-foreground"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    Manage Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id as PlanId)}
                    disabled={isPending || isLoading}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 ${
                      plan.highlighted
                        ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                        : "bg-primary text-primary-foreground hover:opacity-90"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Redirecting...
                      </>
                    ) : (
                      <>
                        {isUpgrade ? "Upgrade to" : "Switch to"} {plan.name}
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Credits summary */}
        <div className="glass rounded-2xl p-6 border border-border mb-8">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Your Usage
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: "Current Plan", value: <span className="capitalize">{currentPlan}</span> },
              {
                label: "Credits Remaining",
                value: isUnlimited(profile?.credits ?? 0) ? "Unlimited" : (profile?.credits ?? 0),
              },
              {
                label: "Monthly Credits",
                value: (PLANS.find(p => p.id === currentPlan)?.credits ?? 3) >= UNLIMITED_CREDITS
                  ? "Unlimited"
                  : (PLANS.find(p => p.id === currentPlan)?.credits ?? 3),
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-background/50 rounded-xl p-3.5">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="text-lg font-bold text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>


      </main>
    </div>
  )
}
