"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { ChevronDown, Sparkles } from "lucide-react"

const FAQS = [
  {
    q: "How does PortraifyAI preserve my identity?",
    a: "We use FLUX PuLID (Personalized identity-preserving Latent Diffusion), a state-of-the-art model that analyzes your facial structure and ensures the generated headshot looks unmistakably like you — just enhanced and professional.",
  },
  {
    q: "What kind of photo should I upload?",
    a: "A clear, front-facing photo with good lighting works best. Selfies are perfectly fine. Avoid sunglasses, heavy filters, or photos where your face is partially obscured.",
  },
  {
    q: "Are my photos stored or shared?",
    a: "Your uploaded photos and generated headshots are stored securely in your private account. We never share your images with third parties or use them for training.",
  },
  {
    q: "How many headshots can I generate for free?",
    a: "Free accounts include 3 headshots to try out the service. Upgrade to Pro for 50/month or Business for unlimited.",
  },
  {
    q: "Can I use the headshots commercially?",
    a: "Yes. All generated headshots are yours to use however you like — LinkedIn, business cards, websites, marketing materials, or anywhere else.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="font-medium text-foreground group-hover:text-primary transition-colors">{q}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-40 pb-5" : "max-h-0"}`}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
      </div>
    </div>
  )
}

export default function FooterFAQ() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const faqHeadingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        faqHeadingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: faqHeadingRef.current, start: "top 85%" },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef}>
      {/* FAQ */}
      <section id="faq" className="py-24 px-4 bg-secondary/30">
        <div className="max-w-3xl mx-auto">
          <div ref={faqHeadingRef} className="opacity-0 text-center mb-12">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-4xl font-semibold tracking-tight text-balance">
              Common <span className="text-gradient">questions</span>
            </h2>
          </div>
          <div className="glass rounded-2xl px-6">
            {FAQS.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl py-16 px-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance mb-4">
            Ready to make a great impression?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Get a professional headshot in under a minute — no studio, no scheduling.
          </p>
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-8 py-3.5 font-semibold text-base hover:opacity-90 active:scale-[0.97] transition-all brand-glow"
          >
            Generate Your Free Headshot
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          {/* Top row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground text-sm">PortraifyAI</span>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <Link href="/auth/login" className="hover:text-foreground transition-colors">Sign In</Link>
              <Link href="/auth/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link>
              <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
              <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} PortraifyAI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/refund" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
