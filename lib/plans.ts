export type PlanId = "free" | "pro" | "business"

export interface Plan {
  id: PlanId
  name: string
  price: number           // monthly USD
  priceId: string | null  // Stripe Price ID from env
  credits: number         // headshots per month — use Number.MAX_SAFE_INTEGER for unlimited
  resolution: "720p" | "4K"
  watermark: boolean
  premiumStyles: boolean   // access to all styles (creative, warm, minimal, professional)
  features: string[]
  highlighted?: boolean
}

// Sentinel value stored in DB for unlimited plans
export const UNLIMITED_CREDITS = 999999

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceId: null,
    credits: 3,
    resolution: "720p",
    watermark: true,
    premiumStyles: false,
    features: [
      "3 headshots / month",
      "Standard styles only",
      "720p resolution",
      "Watermark included",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
    credits: 50,
    resolution: "4K",
    watermark: false,
    premiumStyles: true,
    highlighted: true,
    features: [
      "50 headshots / month",
      "All premium styles",
      "4K resolution",
      "No watermark",
      "Priority support",
      "Commercial license",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 49,
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? null,
    credits: UNLIMITED_CREDITS,
    resolution: "4K",
    watermark: false,
    premiumStyles: true,
    features: [
      "Unlimited headshots / month",
      "All premium styles",
      "4K resolution",
      "No watermark",
      "Dedicated support",
      "Commercial license",
    ],
  },
]

export function getPlan(id?: string | null): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0]
}

/** Returns true when credit count represents unlimited (business plan) */
export function isUnlimited(credits: number): boolean {
  return credits >= UNLIMITED_CREDITS
}
