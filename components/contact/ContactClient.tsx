"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import Link from "next/link"
import { gsap } from "@/lib/gsap"
import { Sparkles, Send, Search, MessageSquare, CheckCircle2, Clock, AlertCircle, XCircle, ChevronRight, ArrowLeft, Loader2, Tag, Mail } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { createTicket, lookupTicket, sendTicketMessage } from "@/app/actions/support"
import { createClient } from "@/lib/supabase/client"
import Navbar from "../landing/Navbar"

type View = "home" | "new-ticket" | "track-ticket" | "chat"

interface UserProp {
  id: string
  email: string
  name: string
}

interface TicketMessage {
  id: string
  ticket_id: string
  sender_type: string
  sender_name: string
  content: string
  created_at: string
}

interface Ticket {
  id: string
  ticket_number: string
  email: string
  name: string
  subject: string
  category: string
  priority: string
  status: string
  created_at: string
  updated_at: string
  ticket_messages?: TicketMessage[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open:        { label: "Open",        color: "text-blue-500 bg-blue-500/10",   icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress", color: "text-yellow-500 bg-yellow-500/10", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  waiting:     { label: "Waiting",     color: "text-orange-500 bg-orange-500/10", icon: <Clock className="w-3.5 h-3.5" /> },
  resolved:    { label: "Resolved",    color: "text-green-500 bg-green-500/10",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  closed:      { label: "Closed",      color: "text-muted-foreground bg-muted",  icon: <XCircle className="w-3.5 h-3.5" /> },
}

const CATEGORIES = ["general", "billing", "technical", "account", "feature"]
const PRIORITIES = ["low", "normal", "high", "urgent"]

export default function ContactClient({ user }: { user: UserProp | null }) {
  const [view, setView] = useState<View>("home")
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
  }, [])

  // Subscribe to real-time messages when a ticket is open
  useEffect(() => {
    if (!activeTicket) return

    const supabase = createClient()
    const channel = supabase
      .channel(`ticket-${activeTicket.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${activeTicket.id}` },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new as TicketMessage]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeTicket])

  function openTicketChat(ticket: Ticket) {
    const msgs = ticket.ticket_messages ?? []
    setMessages(msgs.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()))
    setActiveTicket(ticket)
    setView("chat")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      <div ref={containerRef} className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        {view !== "home" && view !== "chat" && (
          <button
            onClick={() => setView("home")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {view === "chat" && (
          <button
            onClick={() => setView("track-ticket")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to tracker
          </button>
        )}

        {view === "home" && <HomeView setView={setView} />}
        {view === "new-ticket" && <NewTicketView user={user} onSuccess={openTicketChat} />}
        {view === "track-ticket" && <TrackTicketView user={user} onOpenChat={openTicketChat} />}
        {view === "chat" && activeTicket && (
          <ChatView ticket={activeTicket} messages={messages} setMessages={setMessages} user={user} />
        )}
      </div>
    </div>
  )
}

// ── Home ──────────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "How do I download my generated headshots?",
    a: "Go to your Dashboard, find the headshot you want, and click the download icon. All generated images are stored in your account and available for download at any time.",
  },
  {
    q: "Can I change my subscription plan?",
    a: "Yes. Visit the Billing page from your dashboard to upgrade or change your plan. Changes take effect immediately and your credits are updated accordingly.",
  },
  {
    q: "How many photos do I need to upload?",
    a: "You only need to upload one clear photo of yourself. For best results, use a well-lit, front-facing photo where your face is clearly visible.",
  },
  {
    q: "Is my data and photos kept private?",
    a: "Yes. Your uploaded photos and generated headshots are stored securely and are only accessible to you. We do not share, sell, or use your images for training. See our Privacy Policy for full details.",
  },
]

function HomeView({ setView }: { setView: (v: View) => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-2">
          <MessageSquare className="w-3.5 h-3.5" /> Support Center
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight text-balance">
          How can we help you?
        </h1>
        <p className="text-muted-foreground text-lg">
          Submit a ticket or track an existing one. We typically respond within 2&nbsp;hours.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setView("new-ticket")}
          className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground mb-1">Submit a Ticket</h2>
          <p className="text-sm text-muted-foreground">Describe your issue and we&apos;ll get back to you with a unique ticket number.</p>
          <div className="flex items-center gap-1 mt-4 text-xs text-primary font-medium">
            Get started <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>

        <button
          onClick={() => setView("track-ticket")}
          className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Search className="w-5 h-5 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground mb-1">Track a Ticket</h2>
          <p className="text-sm text-muted-foreground">Already submitted? Enter your email and ticket number to check status and chat.</p>
          <div className="flex items-center gap-1 mt-4 text-xs text-primary font-medium">
            Track now <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="font-medium text-foreground mb-3 text-sm">Common Questions</h3>
        <div className="divide-y divide-border">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left text-sm text-foreground flex items-center justify-between py-3 gap-3 hover:text-primary transition-colors"
              >
                <span>{item.q}</span>
                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                    openFaq === i ? "rotate-90 text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="text-sm text-muted-foreground pb-3 leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── New Ticket ────────────────────────────────────────────────────────────────
function NewTicketView({ user, onSuccess }: { user: UserProp | null; onSuccess: (t: Ticket) => void }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    subject: "",
    category: "general" as string,
    priority: "normal" as string,
    message: "",
  })

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await createTicket(form as any)
      if (res.error) { setError(res.error); return }
      if (res.ticket) onSuccess(res.ticket as Ticket)
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Submit a Support Ticket</h1>
        <p className="text-muted-foreground text-sm mt-1">Fill out the form below. You&apos;ll receive a unique ticket number to track your request.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Your Name</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="Jane Smith"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              placeholder="jane@example.com"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Subject</label>
          <input
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            required
            placeholder="Brief description of your issue"
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm capitalize"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm capitalize"
            >
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            required
            rows={5}
            placeholder="Please describe your issue in detail..."
            className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
        </button>
      </form>
    </div>
  )
}

// ── Track Ticket ──────────────────────────────────────────────────────────────
function TrackTicketView({ user, onOpenChat }: { user: UserProp | null; onOpenChat: (t: Ticket) => void }) {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState(user?.email ?? "")
  const [ticketNumber, setTicketNumber] = useState("")
  const [error, setError] = useState("")
  const [ticket, setTicket] = useState<Ticket | null>(null)

  function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setTicket(null)
    startTransition(async () => {
      const res = await lookupTicket(email, ticketNumber)
      if (res.error) { setError(res.error); return }
      if (res.ticket) setTicket(res.ticket as Ticket)
    })
  }

  const statusCfg = ticket ? (STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open) : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Track Your Ticket</h1>
        <p className="text-muted-foreground text-sm mt-1">Enter your email and ticket number to check status and continue chatting.</p>
      </div>

      <form onSubmit={handleLookup} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="jane@example.com"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Ticket Number</label>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
              required
              placeholder="PAI-XXXXXX-XXXX"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm font-mono"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Looking up...</> : <><Search className="w-4 h-4" /> Find Ticket</>}
        </button>
      </form>

      {ticket && statusCfg && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{ticket.ticket_number}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                  {statusCfg.icon}{statusCfg.label}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Opened {new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" · "}{ticket.category} · {ticket.priority} priority
              </p>
            </div>
          </div>
          <div className="p-5">
            <button
              onClick={() => onOpenChat(ticket)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Open Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Chat View ─────────────────────────────────────────────────────────────────
function ChatView({
  ticket, messages, setMessages, user
}: {
  ticket: Ticket
  messages: TicketMessage[]
  setMessages: React.Dispatch<React.SetStateAction<TicketMessage[]>>
  user: UserProp | null
}) {
  const [input, setInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)
  const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    const text = input.trim()
    setInput("")

    // Optimistic update
    const optimistic: TicketMessage = {
      id: `opt-${Date.now()}`,
      ticket_id: ticket.id,
      sender_type: "user",
      sender_name: user?.name || ticket.name,
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    startTransition(async () => {
      await sendTicketMessage(ticket.id, text, user?.name || ticket.name)
    })
  }

  const isClosed = ticket.status === "closed" || ticket.status === "resolved"

  return (
    <div className="space-y-4">
      {/* Ticket header */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{ticket.ticket_number}</span>
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${statusCfg.color}`}>
                {statusCfg.icon}{statusCfg.label}
              </span>
              <span className="text-xs text-muted-foreground capitalize">{ticket.category} · {ticket.priority}</span>
            </div>
            <h2 className="font-semibold text-foreground text-sm">{ticket.subject}</h2>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col" style={{ minHeight: "420px" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[480px]">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
              <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
              No messages yet.
            </div>
          )}
          {messages.map((msg) => {
            const isAdmin = msg.sender_type === "admin"
            return (
              <div key={msg.id} className={`flex gap-3 ${isAdmin ? "flex-row" : "flex-row-reverse"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                  {isAdmin ? "S" : (msg.sender_name?.[0] ?? "U").toUpperCase()}
                </div>
                <div className={`max-w-[78%] space-y-1 ${isAdmin ? "items-start" : "items-end"} flex flex-col`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isAdmin ? "bg-primary/10 text-foreground rounded-tl-sm" : "bg-primary text-primary-foreground rounded-tr-sm"}`}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {isAdmin ? "Support Team" : msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-3">
          {isClosed ? (
            <p className="text-center text-sm text-muted-foreground py-2">
              This ticket is {ticket.status}. <button className="text-primary hover:underline" onClick={() => {}}>Open a new ticket</button> if you need further help.
            </p>
          ) : (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isPending}
                className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              />
              <button
                type="submit"
                disabled={isPending || !input.trim()}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
