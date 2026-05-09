"use client"
import { useEffect, useRef } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { Zap, Shield, Palette, Download, Heart, Sparkles } from "lucide-react"

const FEATURES = [
  {
    icon: Sparkles,
    title: "FLUX PuLID Technology",
    desc: "State-of-the-art identity-preserving AI ensures your headshot looks exactly like you — just polished.",
  },
  {
    icon: Zap,
    title: "Results in Seconds",
    desc: "No waiting days for a photographer. Get professional-quality headshots generated in under 30 seconds.",
  },
  {
    icon: Palette,
    title: "Multiple Styles",
    desc: "Corporate, creative, warm, or minimalist — choose the aesthetic that fits your personal brand.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Your photos are processed securely and never shared. You own every image generated.",
  },
  {
    icon: Download,
    title: "High-Resolution Downloads",
    desc: "Download full-resolution images ready for LinkedIn, Slack, resumes, and any platform.",
  },
  {
    icon: Heart,
    title: "Favorites Collection",
    desc: "Save your best headshots to a favorites gallery and access them anytime from your dashboard.",
  },
]

export default function FeaturesSection() {
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
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
          scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="opacity-0 text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Why PortraifyAI</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            Everything you need to make a{" "}
            <span className="text-gradient">great first impression</span>
          </h2>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="opacity-0 glass rounded-2xl p-6 card-hover group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
