"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { Check } from "lucide-react"

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Try it out with no commitment.",
    features: ["3 AI headshots", "2 styles", "Standard resolution", "Basic support"],
    cta: "Get Started Free",
    href: "/auth/sign-up",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    period: "per month",
    desc: "For professionals who need more.",
    features: [
      "50 AI headshots / mo",
      "All styles + custom prompts",
      "4K high-resolution downloads",
      "Favorites & history",
      "Priority generation",
      "Priority support",
    ],
    cta: "Start Pro",
    href: "/auth/sign-up",
    popular: true,
  },
  {
    name: "Business",
    price: "$49",
    period: "per month",
    desc: "For teams and growing companies.",
    features: [
      "Unlimited headshots",
      "All Pro features",
      "Brand style presets",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "/auth/sign-up",
    popular: false,
  },
]

export default function PricingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 80%" },
        }
      )
      gsap.fromTo(
        cardsRef.current!.children,
        { opacity: 0, y: 60 },
        {
          opacity: 1, y: 0, duration: 0.7, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section id="pricing" ref={sectionRef} className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div ref={headingRef} className="opacity-0 text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Simple, honest <span className="text-gradient">pricing</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`opacity-0 relative rounded-2xl p-7 flex flex-col gap-5 ${
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-2xl scale-[1.02]"
                  : "glass"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <div>
                <p className={`text-sm font-medium mb-1 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={`text-sm ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`text-sm mt-2 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                    <span className={plan.popular ? "text-primary-foreground/90" : "text-foreground"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-all active:scale-[0.97] ${
                  plan.popular
                    ? "bg-primary-foreground text-primary hover:opacity-90"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
