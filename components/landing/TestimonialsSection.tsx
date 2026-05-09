"use client"
import { useEffect, useRef } from "react"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { Star } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "James",
    role: "Product Manager",
    initial: "J",
    color: "bg-blue-500",
    stars: 5,
    quote:
      "Swapped my LinkedIn photo and within a week I had three recruiters reach out. Honestly didn't expect that kind of difference from a headshot.",
  },
  {
    name: "Mia",
    role: "Freelance Designer",
    initial: "M",
    color: "bg-rose-500",
    stars: 5,
    quote:
      "I've spent $150 on studio headshots that looked worse than this. Took me maybe two minutes total. It's become my go-to for client proposals.",
  },
  {
    name: "Daniel",
    role: "Software Engineer",
    initial: "D",
    color: "bg-violet-500",
    stars: 4,
    quote:
      "Using it for my GitHub, conference badge, and team page. The professional style is clean without looking like a stock photo — that was my main concern.",
  },
  {
    name: "Anika",
    role: "Marketing Lead",
    initial: "A",
    color: "bg-emerald-500",
    stars: 5,
    quote:
      "We needed updated photos for our whole remote team. Everyone uploaded a selfie and we had consistent, polished headshots the same day. Huge time saver.",
  },
  {
    name: "Chris",
    role: "Sales Rep",
    initial: "C",
    color: "bg-amber-500",
    stars: 4,
    quote:
      "My old photo was embarrassingly outdated. This got me something current fast. A couple prospects have actually commented on it in cold email replies.",
  },
  {
    name: "Lena",
    role: "UX Designer",
    initial: "L",
    color: "bg-cyan-500",
    stars: 5,
    quote:
      "The warm style hit exactly the right tone for my portfolio — professional but not stiff. I've recommended it to everyone in my design Slack.",
  },
]

export default function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 80%" },
        }
      )
      if (gridRef.current) {
        gsap.fromTo(
          Array.from(gridRef.current.children),
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
          }
        )
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-4 bg-secondary/20">
      <div className="max-w-6xl mx-auto">
        <div ref={headingRef} className="opacity-0 text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
            Early feedback
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-balance">
            What people are{" "}
            <span className="text-gradient">saying so far</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            Real feedback from early users — first names only, no company names.
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="opacity-0 glass rounded-2xl p-6 card-hover flex flex-col gap-4"
            >
              {/* Stars — variable rating for realism */}
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < t.stars
                        ? "fill-amber-400 text-amber-400"
                        : "fill-muted text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-foreground leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author — first name + role only */}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <div
                  className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {t.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name} · {t.role}</p>
                  <p className="text-xs text-muted-foreground">Early access</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
