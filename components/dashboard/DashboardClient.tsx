"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { gsap } from "@/lib/gsap"
import {
  Sparkles, Plus, LogOut, Heart, Download, Trash2, LayoutGrid, Star, Coins, User,
  Settings, CreditCard,
} from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

type Headshot = {
  id: string
  result_image_url: string | null
  source_image_url: string
  style: string
  status: string
  is_favorite: boolean
  created_at: string
}

type Profile = {
  full_name: string | null
  credits: number
  plan: string
}

type Props = {
  user: { id: string; email: string }
  profile: Profile | null
  initialHeadshots: Headshot[]
}

export default function DashboardClient({ user, profile, initialHeadshots }: Props) {
  const router = useRouter()
  const [headshots, setHeadshots] = useState<Headshot[]>(initialHeadshots)
  const [filter, setFilter] = useState<"all" | "favorites">("all")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const headerRef = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
      )
      if (gridRef.current?.children.length) {
        gsap.fromTo(
          gridRef.current.children,
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "power3.out", delay: 0.2 }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  const supabase = createClient()

  async function toggleFavorite(id: string, current: boolean) {
    const { error } = await supabase
      .from("headshots")
      .update({ is_favorite: !current })
      .eq("id", id)
      .eq("user_id", user.id)

    if (!error) {
      setHeadshots((prev) =>
        prev.map((h) => (h.id === id ? { ...h, is_favorite: !current } : h))
      )
    }
  }

  async function deleteHeadshot(id: string) {
    setDeletingId(id)
    const { error } = await supabase
      .from("headshots")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (!error) {
      setHeadshots((prev) => prev.filter((h) => h.id !== id))
    }
    setDeletingId(null)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const displayed = filter === "favorites"
    ? headshots.filter((h) => h.is_favorite)
    : headshots

  const completed = headshots.filter((h) => h.status === "completed")
  const favorites = headshots.filter((h) => h.is_favorite)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header ref={headerRef} className="opacity-0 border-b border-border glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">PortraifyAI</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Credits badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              <Coins className="w-3.5 h-3.5" />
              <span>{profile?.credits ?? 0} credits</span>
            </div>

            <Link
              href="/generate"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all active:scale-[0.97]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Headshot</span>
            </Link>

            <Link
              href="/billing"
              className="hidden md:flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Billing"
            >
              <CreditCard className="w-4 h-4" />
            </Link>

            <Link
              href="/settings"
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            <ThemeToggle />

            <button
              onClick={handleSignOut}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Welcome + Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-1">
              {"Welcome back"}
              {profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>

          <div className="flex gap-3">
            {[
              { icon: LayoutGrid, label: "Total", value: headshots.length },
              { icon: Star, label: "Favorites", value: favorites.length },
              { icon: Coins, label: "Credits", value: profile?.credits ?? 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="glass rounded-xl px-4 py-3 flex flex-col items-center min-w-[80px]">
                <Icon className="w-4 h-4 text-primary mb-1" />
                <span className="text-xl font-bold text-foreground">{value}</span>
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter + Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(["all", "favorites"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {f === "all" ? "All Headshots" : "Favorites"}
                <span className="ml-2 text-xs opacity-60">
                  {f === "all" ? headshots.length : favorites.length}
                </span>
              </button>
            ))}
          </div>

          <Link
            href="/generate"
            className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate new
          </Link>
        </div>

        {/* Grid */}
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center glass rounded-2xl">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <User className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {filter === "favorites" ? "No favorites yet" : "No headshots yet"}
            </h3>
            <p className="text-muted-foreground text-sm mb-6">
              {filter === "favorites"
                ? "Heart a headshot to save it here."
                : "Generate your first professional headshot now."}
            </p>
            {filter === "all" && (
              <Link
                href="/generate"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Generate My First Headshot
              </Link>
            )}
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayed.map((h) => (
              <HeadshotCard
                key={h.id}
                headshot={h}
                onFavorite={toggleFavorite}
                onDelete={deleteHeadshot}
                isDeleting={deletingId === h.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function HeadshotCard({
  headshot,
  onFavorite,
  onDelete,
  isDeleting,
}: {
  headshot: Headshot
  onFavorite: (id: string, current: boolean) => void
  onDelete: (id: string) => void
  isDeleting: boolean
}) {
  const imgUrl = headshot.result_image_url || headshot.source_image_url
  const isReady = headshot.status === "completed" && headshot.result_image_url

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border card-hover">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgUrl}
          alt="Headshot"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status overlay */}
        {headshot.status === "pending" && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-xs font-medium text-muted-foreground">Processing...</span>
          </div>
        )}

        {/* Actions overlay (hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => onFavorite(headshot.id, headshot.is_favorite)}
              className="glass rounded-lg p-2 hover:bg-primary/20 transition-colors"
              title={headshot.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  headshot.is_favorite ? "fill-red-500 text-red-500" : "text-foreground"
                }`}
              />
            </button>
            <button
              onClick={() => onDelete(headshot.id)}
              disabled={isDeleting}
              className="glass rounded-lg p-2 hover:bg-destructive/20 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Bottom row */}
          {isReady && (
            <a
              href={headshot.result_image_url!}
              download="headshot.jpg"
              target="_blank"
              rel="noopener noreferrer"
              className="glass rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-primary/20 transition-colors w-full justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </a>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-foreground capitalize">{headshot.style}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {new Date(headshot.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => onFavorite(headshot.id, headshot.is_favorite)}
          className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          title={headshot.is_favorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              headshot.is_favorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`}
          />
        </button>
      </div>
    </div>
  )
}
