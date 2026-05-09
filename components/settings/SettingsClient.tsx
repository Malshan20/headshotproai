"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { gsap } from "@/lib/gsap"
import { createClient } from "@/lib/supabase/client"
import { updateProfile, updateEmail, updatePassword, deleteAccount } from "@/app/actions/profile"
import { ThemeToggle } from "@/components/ThemeToggle"
import {
  Sparkles, ArrowLeft, User, Mail, Lock, Trash2,
  CheckCircle2, AlertCircle, Eye, EyeOff, ChevronRight, CreditCard
} from "lucide-react"

type Profile = { full_name: string | null; credits: number; plan: string; team_id: string | null }
type Props = { user: { id: string; email: string }; profile: Profile | null }

type Tab = "profile" | "account" | "security" | "danger"

export default function SettingsClient({ user, profile }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("profile")
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name ?? "")

  // Account fields
  const [newEmail, setNewEmail] = useState(user.email)

  // Security fields
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showPw, setShowPw] = useState(false)

  // Danger
  const [deleteConfirm, setDeleteConfirm] = useState("")

  useEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
  }, [])

  useEffect(() => {
    gsap.fromTo(contentRef.current, { opacity: 0, x: 12 }, { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" })
  }, [tab])

  function notify(msg: string, type: "success" | "error" = "success") {
    setSuccess(null); setError(null)
    if (type === "success") setSuccess(msg)
    else setError(msg)
    setTimeout(() => { setSuccess(null); setError(null) }, 4000)
  }

  function handleSaveProfile() {
    startTransition(async () => {
      const res = await updateProfile({ full_name: fullName })
      if (res.error) notify(res.error, "error")
      else notify("Profile updated successfully.")
    })
  }

  function handleUpdateEmail() {
    if (newEmail === user.email) return notify("That's already your current email.", "error")
    startTransition(async () => {
      const res = await updateEmail(newEmail)
      if (res.error) notify(res.error, "error")
      else notify(res.message ?? "Check your inbox to confirm.")
    })
  }

  function handleUpdatePassword() {
    if (!currentPw || !newPw) return notify("Please fill in all password fields.", "error")
    if (newPw.length < 8) return notify("New password must be at least 8 characters.", "error")
    if (newPw !== confirmPw) return notify("Passwords don't match.", "error")
    startTransition(async () => {
      const res = await updatePassword(currentPw, newPw)
      if (res.error) notify(res.error, "error")
      else { notify("Password updated."); setCurrentPw(""); setNewPw(""); setConfirmPw("") }
    })
  }

  function handleDeleteAccount() {
    if (deleteConfirm !== "delete my account") return notify("Type the confirmation phrase exactly.", "error")
    startTransition(async () => { await deleteAccount() })
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "account", label: "Account", icon: <Mail className="w-4 h-4" /> },
    { id: "security", label: "Security", icon: <Lock className="w-4 h-4" /> },
    { id: "danger", label: "Danger Zone", icon: <Trash2 className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header ref={headerRef} className="opacity-0 border-b border-border glass sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground text-sm">Settings</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/billing" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Toast */}
        {(success || error) && (
          <div className={`mb-6 flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium ${
            success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
          }`}>
            {success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {success ?? error}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar nav */}
          <nav className="md:w-52 shrink-0">
            <ul className="space-y-1">
              {tabs.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      tab === t.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    } ${t.id === "danger" && tab !== "danger" ? "hover:text-red-500" : ""}`}
                  >
                    {t.icon}
                    {t.label}
                    {tab === t.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-6 p-4 glass rounded-xl border border-border">
              <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
              <p className="font-semibold text-foreground capitalize">{profile?.plan ?? "free"}</p>
              <p className="text-xs text-muted-foreground mt-1">{profile?.credits ?? 0} credits left</p>
              <Link href="/billing" className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline">
                Manage billing <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </nav>

          {/* Content */}
          <div ref={contentRef} className="flex-1">
            {/* Profile tab */}
            {tab === "profile" && (
              <section className="glass rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Profile
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Update your public display name.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-muted-foreground cursor-not-allowed"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">Change your email in the Account tab.</p>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                  >
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </section>
            )}

            {/* Account tab */}
            {tab === "account" && (
              <section className="glass rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" /> Account
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Update your email address. A confirmation will be sent.</p>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors"
                    />
                  </div>
                  <button
                    onClick={handleUpdateEmail}
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                  >
                    {isPending ? "Sending..." : "Update Email"}
                  </button>
                </div>
              </section>
            )}

            {/* Security tab */}
            {tab === "security" && (
              <section className="glass rounded-2xl p-6 border border-border">
                <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" /> Security
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Change your password. Must be at least 8 characters.</p>

                <div className="space-y-4">
                  {[
                    { label: "Current Password", value: currentPw, setter: setCurrentPw },
                    { label: "New Password", value: newPw, setter: setNewPw },
                    { label: "Confirm New Password", value: confirmPw, setter: setConfirmPw },
                  ].map(({ label, value, setter }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          className="w-full px-4 py-2.5 pr-10 rounded-xl bg-background border border-border focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-foreground transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleUpdatePassword}
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-60"
                  >
                    {isPending ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </section>
            )}

            {/* Danger zone */}
            {tab === "danger" && (
              <section className="glass rounded-2xl p-6 border border-red-500/30">
                <h2 className="text-lg font-bold text-red-500 mb-1 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> Danger Zone
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>

                <div className="space-y-4 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                  <p className="text-sm text-foreground">
                    Type <span className="font-mono font-bold text-red-500">delete my account</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="delete my account"
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-red-500/30 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 text-foreground transition-colors"
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isPending || deleteConfirm !== "delete my account"}
                    className="px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-40"
                  >
                    {isPending ? "Deleting..." : "Delete My Account"}
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
