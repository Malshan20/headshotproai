"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { adminSendMessage, adminUpdateTicketStatus } from "@/app/actions/support"
import { CheckCircle2, Clock, AlertCircle, XCircle, MessageSquare, Send, Loader2, Tag, User, Calendar } from "lucide-react"

type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed"

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
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open:        { label: "Open",        color: "text-blue-500 bg-blue-500/10",     icon: <Clock className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress", color: "text-yellow-500 bg-yellow-500/10", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  waiting:     { label: "Waiting",     color: "text-orange-500 bg-orange-500/10", icon: <Clock className="w-3.5 h-3.5" /> },
  resolved:    { label: "Resolved",    color: "text-green-500 bg-green-500/10",   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  closed:      { label: "Closed",      color: "text-muted-foreground bg-muted",   icon: <XCircle className="w-3.5 h-3.5" /> },
}

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-muted-foreground", normal: "text-foreground",
  high: "text-yellow-500", urgent: "text-red-500",
}

const STATUSES: TicketStatus[] = ["open", "in_progress", "waiting", "resolved", "closed"]

export default function AdminTicketsClient({ tickets: initialTickets, currentUserEmail }: { tickets: Ticket[]; currentUserEmail: string }) {
  const [tickets, setTickets] = useState(initialTickets)
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [input, setInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const [filter, setFilter] = useState<string>("all")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Real-time: new tickets
  useEffect(() => {
    const supabase = createClient()
    const ch = supabase
      .channel("admin-tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, (payload) => {
        if (payload.eventType === "INSERT") {
          setTickets((prev) => [payload.new as Ticket, ...prev])
        } else if (payload.eventType === "UPDATE") {
          setTickets((prev) => prev.map((t) => t.id === payload.new.id ? { ...t, ...(payload.new as Ticket) } : t))
          if (selected?.id === payload.new.id) setSelected((s) => s ? { ...s, ...(payload.new as Ticket) } : s)
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [selected])

  // Real-time: messages for selected ticket
  useEffect(() => {
    if (!selected) return
    const supabase = createClient()
    const ch = supabase
      .channel(`admin-ticket-${selected.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "ticket_messages", filter: `ticket_id=eq.${selected.id}` }, (payload) => {
        setMessages((prev) => {
          const exists = prev.some((m) => m.id === payload.new.id)
          return exists ? prev : [...prev, payload.new as TicketMessage]
        })
      })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [selected])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function openTicket(t: Ticket) {
    setSelected(t)
    setMessages([])
    setLoadingMsgs(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", t.id)
      .order("created_at", { ascending: true })
    setMessages(data ?? [])
    setLoadingMsgs(false)
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !input.trim()) return
    const text = input.trim()
    setInput("")

    const optimistic: TicketMessage = {
      id: `opt-${Date.now()}`,
      ticket_id: selected.id,
      sender_type: "admin",
      sender_name: "PortraifyAI Support",
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    startTransition(async () => {
      await adminSendMessage(selected.id, text)
    })
  }

  function handleStatusChange(status: TicketStatus) {
    if (!selected) return
    startTransition(async () => {
      await adminUpdateTicketStatus(selected.id, status)
      setSelected((s) => s ? { ...s, status } : s)
      setTickets((prev) => prev.map((t) => t.id === selected.id ? { ...t, status } : t))
    })
  }

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter)

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r border-border flex flex-col bg-card">
        <div className="p-4 border-b border-border">
          <h1 className="font-bold text-foreground text-lg">Support Tickets</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{currentUserEmail}</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "all" ? "All" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>

        {/* Ticket list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
              <MessageSquare className="w-7 h-7 mb-2 opacity-30" />
              No tickets
            </div>
          )}
          {filtered.map((t) => {
            const cfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open
            const isActive = selected?.id === t.id
            return (
              <button
                key={t.id}
                onClick={() => openTicket(t)}
                className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-muted/50 ${isActive ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-mono text-[10px] text-primary font-semibold">{t.ticket_number}</span>
                  <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${cfg.color}`}>
                    {cfg.icon}{cfg.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground truncate">{t.subject}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground truncate">{t.name}</span>
                  <span className={`text-[10px] font-medium capitalize ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(t.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </button>
            )
          })}
        </div>
      </aside>

      {/* Main panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p className="text-sm">Select a ticket to view the conversation</p>
          </div>
        ) : (
          <>
            {/* Ticket header */}
            <div className="p-4 border-b border-border bg-card flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono text-xs font-semibold text-primary">{selected.ticket_number}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_CONFIG[selected.status]?.color}`}>
                    {STATUS_CONFIG[selected.status]?.icon}{STATUS_CONFIG[selected.status]?.label}
                  </span>
                </div>
                <h2 className="font-semibold text-foreground">{selected.subject}</h2>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{selected.name} — {selected.email}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(selected.created_at).toLocaleDateString()}</span>
                  <span className="capitalize">{selected.category} · <span className={`font-medium ${PRIORITY_COLOR[selected.priority]}`}>{selected.priority}</span></span>
                </div>
              </div>

              {/* Status control */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Set status:</span>
                <div className="flex gap-1 flex-wrap">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={isPending || selected.status === s}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors capitalize ${
                        selected.status === s
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/50"
                      }`}
                    >
                      {STATUS_CONFIG[s]?.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMsgs && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
              {!loadingMsgs && messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30" /> No messages yet.
                </div>
              )}
              {messages.map((msg) => {
                const isAdmin = msg.sender_type === "admin"
                return (
                  <div key={msg.id} className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${isAdmin ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {isAdmin ? "A" : (msg.sender_name?.[0] ?? "U").toUpperCase()}
                    </div>
                    <div className={`max-w-[75%] space-y-1 flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isAdmin ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted text-foreground rounded-tl-sm"}`}>
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {isAdmin ? "You (Admin)" : msg.sender_name} · {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply input */}
            <div className="border-t border-border p-3 bg-card">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Reply as PortraifyAI Support..."
                  disabled={isPending}
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
                />
                <button
                  type="submit"
                  disabled={isPending || !input.trim()}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
