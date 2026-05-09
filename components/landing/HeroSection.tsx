"use client"
import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { gsap } from "@/lib/gsap"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const orb3Ref = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance animation timeline
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.fromTo(badgeRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
        .fromTo(headlineRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, "-=0.3")
        .fromTo(subRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.4")
        .fromTo(ctaRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .fromTo(previewRef.current, { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: "power2.out" }, "-=0.3")

      // Floating orbs
      gsap.to(orb1Ref.current, {
        y: -40, x: 20, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut",
      })
      gsap.to(orb2Ref.current, {
        y: 30, x: -30, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2,
      })
      gsap.to(orb3Ref.current, {
        y: -20, x: 15, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 1,
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16">
      {/* Background orbs */}
      <div ref={orb1Ref} className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-primary/12 blur-3xl pointer-events-none" />
      <div ref={orb2Ref} className="absolute bottom-[15%] right-[5%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl pointer-events-none" />
      <div ref={orb3Ref} className="absolute top-[40%] right-[25%] w-[300px] h-[300px] rounded-full bg-accent/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Badge */}
        <div ref={badgeRef} className="opacity-0 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-6 text-sm text-muted-foreground">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
           Studio-quality AI portraits
        </div>

        {/* Headline */}
        <h1 ref={headlineRef} className="opacity-0 text-5xl md:text-7xl font-semibold tracking-tight text-balance mb-6 leading-[1.1]">
          Look{" "}
          <span className="text-gradient">confident</span>
          {", "}
          <br className="hidden md:block" />
          professional &amp; unforgettable
        </h1>

        {/* Subheadline */}
        <p ref={subRef} className="opacity-0 text-lg md:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed mb-8">
          Upload a selfie and get studio-quality AI headshots in seconds. Perfect for LinkedIn,
          resumes, business profiles, and dating apps.
        </p>

        {/* CTA */}
        <div ref={ctaRef} className="opacity-0 flex flex-col sm:flex-row items-center gap-3 mb-12">
          <Link
            href="/auth/sign-up"
            className="group inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-7 py-3.5 font-semibold text-base hover:opacity-90 active:scale-[0.97] transition-all brand-glow"
          >
            Generate Your Headshot Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="#examples"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-7 py-3.5 font-medium text-base text-foreground hover:bg-accent transition-colors"
          >
            See Examples
          </Link>
        </div>

      </div>

      {/* Before / After preview strip */}
      <div ref={previewRef} id="examples" className="opacity-0 relative z-10 mt-20 w-full max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {PREVIEW_STYLES.map((s) => (
            <div key={s.label} className="group relative rounded-2xl overflow-hidden aspect-[3/4] card-hover cursor-pointer">
              <div className={`absolute inset-0 ${s.bg}`} />
              <div className="absolute inset-0 flex flex-col justify-end p-3">
                <span className="glass rounded-lg px-2.5 py-1 text-xs font-medium text-foreground w-fit">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          AI-generated samples — your results will be based on your uploaded photo
        </p>
      </div>
    </section>
  )
}

const PREVIEW_STYLES = [
  { 
    label: "Corporate", 
    bg: "bg-[url('/preview1.png')] bg-cover bg-center" 
  },
  { 
    label: "Creative", 
    bg: "bg-[url('/preview2.png')] bg-cover bg-center" 
  },
  { 
    label: "Confident", 
    bg: "bg-[url('/preview3.png')] bg-cover bg-center" 
  },
  { 
    label: "Warm Pro", 
    bg: "bg-[url('/preview4.png')] bg-cover bg-center" 
  },
];
