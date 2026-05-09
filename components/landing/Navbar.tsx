"use client"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { gsap } from "@/lib/gsap"
import { Sparkles, Menu, X } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.1 }
    )

    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border py-3" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">PortraifyAI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <Link href="#examples" className="hover:text-foreground transition-colors">Examples</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="#faq" className="hover:text-foreground transition-colors">FAQ</Link>
          <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all active:scale-[0.97]"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border mt-1 px-4 py-4 flex flex-col gap-3">
          <Link href="#examples" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Examples</Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Pricing</Link>
          <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>FAQ</Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(false)}>Contact</Link>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/auth/login" className="w-full py-2.5 rounded-xl border border-border text-center text-sm font-medium text-foreground">Sign in</Link>
            <Link href="/auth/sign-up" className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-center text-sm font-medium">Get Started Free</Link>
          </div>
        </div>
      )}
    </nav>
  )
}
