"use client"
import { useEffect, useRef } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { Upload, Sliders, ImageDown } from "lucide-react"

const STEPS = [
  {
    step: "01",
    icon: Upload,
    title: "Upload Your Photo",
    desc: "Upload any clear front-facing photo — a selfie works perfectly. No studio needed.",
  },
  {
    step: "02",
    icon: Sliders,
    title: "Choose Your Style",
    desc: "Pick from corporate, creative, warm, or minimalist. Add a custom prompt if you want.",
  },
  {
    step: "03",
    icon: ImageDown,
    title: "Download & Impress",
    desc: "Your AI headshot is ready in seconds. Download in full resolution and use anywhere.",
  },
]

export default function HowItWorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)

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
        stepsRef.current!.children,
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.2, ease: "power3.out",
          scrollTrigger: { trigger: stepsRef.current, start: "top 80%" },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-secondary/30">
      <div className="max-w-5xl mx-auto">
        <div ref={headingRef} className="opacity-0 text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            From selfie to{" "}
            <span className="text-gradient">professional</span>
            {" in 3 steps"}
          </h2>
        </div>

        <div ref={stepsRef} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-[3.5rem] left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-border" />

          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.step} className="opacity-0 flex flex-col items-center text-center relative">
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold text-primary bg-background border border-border rounded-full w-5 h-5 flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{s.desc}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
