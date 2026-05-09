"use client"
import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import {
  Upload, Sparkles, ArrowLeft, Loader2, CheckCircle2, Image as ImageIcon, Lock
} from "lucide-react"

// Style constants
const ALL_STYLES = [
  { id: "professional", label: "Corporate", desc: "Business formal, neutral backdrop" },
  { id: "creative", label: "Creative", desc: "Modern, artistic lighting" },
  { id: "warm", label: "Warm Pro", desc: "Friendly, approachable tone" },
  { id: "minimal", label: "Minimal", desc: "Clean, crisp simplicity" },
]

// List of style ids that are premium
const PREMIUM_STYLE_IDS = ["creative", "warm", "minimal"]

type Step = "upload" | "configure" | "generating" | "done"

export default function GeneratePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>("upload")
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [selectedStyle, setSelectedStyle] = useState("professional")
  const [customPrompt, setCustomPrompt] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Add plan state (defaults to null until checked)
  const [userPlan, setUserPlan] = useState<"free" | "premium" | null>(null)

  // On mount, fetch user and plan
  useEffect(() => {
    (async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUserPlan("free")
        return
      }
      // Simple plan resolution - expects a "plan" field on users OR fallback to "free"
      const { data, error } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle()
      if (!error && data?.plan) {
        setUserPlan(data.plan === "premium" ? "premium" : "free")
      } else {
        setUserPlan("free")
      }
    })()
  }, [])

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WEBP).")
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10MB.")
      return
    }
    setError(null)
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
    setStep("configure")
  }, [])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  async function handleGenerate() {
    if (!file) return
    setStep("generating")
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }

      // 1) Upload source image
      const fd = new FormData()
      fd.append("file", file)
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload failed")
      const sourceUrl: string = uploadData.url

      // 2) Create headshot record
      const { data: headshot, error: insertErr } = await supabase
        .from("headshots")
        .insert({
          user_id: user.id,
          source_image_url: sourceUrl,
          style: selectedStyle,
          prompt: customPrompt || null,
          status: "pending",
        })
        .select()
        .single()

      if (insertErr || !headshot) throw new Error("Failed to create headshot record")

      // 3) Generate
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headshotId: headshot.id,
          imageUrl: sourceUrl,
          style: selectedStyle,
          customPrompt: customPrompt || undefined,
        }),
      })
      const genData = await genRes.json()
      if (!genRes.ok) throw new Error(genData.error || "Generation failed")

      setResultUrl(genData.resultUrl)
      setStep("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setStep("configure")
    }
  }

  // Return loading state while checking plan
  if (userPlan === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  // Split styles for UI: the 3 premium styles, and all others
  const premiumStyles = ALL_STYLES.filter(s => PREMIUM_STYLE_IDS.includes(s.id))
  const basicStyles = ALL_STYLES.filter(s => !PREMIUM_STYLE_IDS.includes(s.id))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm text-foreground">PortraifyAI</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {(["upload", "configure", "generating"] as const).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                step === s || (step === "done" && s === "generating")
                  ? "bg-primary text-primary-foreground"
                  : ["configure", "generating", "done"].indexOf(step) > ["upload", "configure", "generating"].indexOf(s)
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                {i + 1}
              </div>
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* STEP: Upload */}
        {step === "upload" && (
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-foreground mb-2">Upload your photo</h1>
            <p className="text-muted-foreground mb-8">A clear, front-facing selfie works best</p>

            <div
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`glass rounded-2xl border-2 border-dashed transition-all cursor-pointer p-16 flex flex-col items-center gap-4 ${
                isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Drop your photo here</p>
                <p className="text-sm text-muted-foreground">or click to browse — JPG, PNG, WEBP up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
          </div>
        )}

        {/* STEP: Configure */}
        {step === "configure" && (
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Customize your headshot</h1>
            <p className="text-muted-foreground mb-8">Choose a style and optionally add a custom prompt</p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <div className="flex flex-col gap-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden glass">
                  {preview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Your photo" className="w-full h-full object-cover" />
                  )}
                  <button
                    onClick={() => { setStep("upload"); setPreview(null); setFile(null) }}
                    className="absolute top-3 right-3 glass rounded-lg px-3 py-1.5 text-xs font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    Change
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-foreground">Custom prompt (optional)</label>
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. dark grey suit, city skyline background"
                    className="px-4 py-3 rounded-xl bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              {/* Style picker */}
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium text-foreground">Select style</p>
                {/* Always display non-premium styles */}
                {basicStyles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStyle(s.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedStyle === s.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/40 hover:bg-accent/20"
                    }`}
                  >
                    <p className="font-medium text-foreground text-sm">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </button>
                ))}
                {/* Only display premium styles for free plan users */}
                {userPlan === "free" && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mt-6 mb-2 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-yellow-500/80" />
                      Premium styles
                    </p>
                    <div className="flex flex-col gap-3">
                      {premiumStyles.map((s) => (
                        <button
                          key={s.id}
                          disabled
                          className={`w-full text-left p-4 rounded-xl border border-dashed opacity-60 cursor-not-allowed bg-card`}
                        >
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground text-sm">{s.label}</p>
                            <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">Premium</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span>
                        Unlock these styles with a <Link href="/billing" className="text-primary underline underline-offset-2">Pro plan</Link>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="mt-8 w-full py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 active:scale-[0.98] transition-all brand-glow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Generate My Headshot
            </button>
          </div>
        )}

        {/* STEP: Generating */}
        {step === "generating" && (
          <div className="flex flex-col items-center text-center py-16 gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Generating your headshot...</h2>
              <p className="text-muted-foreground">AI is analyzing and enhancing your photo. This takes about 20&ndash;40 seconds.</p>
            </div>
            <div className="w-full max-w-xs">
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-[progress_30s_linear_forwards]" />
              </div>
            </div>
          </div>
        )}

        {/* STEP: Done */}
        {step === "done" && resultUrl && (
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="w-6 h-6" />
              <span className="font-semibold text-lg">Your headshot is ready!</span>
            </div>

            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="Generated headshot" className="w-full h-auto" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
              <a
                href={resultUrl}
                download="headshot.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm text-center hover:opacity-90 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Download
              </a>
              <Link
                href="/dashboard"
                className="flex-1 py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm text-center hover:bg-accent transition-colors flex items-center justify-center gap-2"
              >
                View Gallery
              </Link>
            </div>

            <button
              onClick={() => { setStep("upload"); setPreview(null); setFile(null); setResultUrl(null) }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Generate another headshot
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
