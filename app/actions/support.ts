"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceClient } from "@/lib/supabase/service"
import { revalidatePath } from "next/cache"

function generateTicketNumber(): string {
  const prefix = "PAI"
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export type TicketCategory = "general" | "billing" | "technical" | "account" | "feature"
export type TicketPriority = "low" | "normal" | "high" | "urgent"
export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed"

export interface CreateTicketInput {
  name: string
  email: string
  subject: string
  category: TicketCategory
  priority: TicketPriority
  message: string
}

export async function createTicket(input: CreateTicketInput) {
  const admin = createServiceClient()

  // Get logged-in user if any
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const ticketNumber = generateTicketNumber()

  const { data: ticket, error: ticketErr } = await admin
    .from("support_tickets")
    .insert({
      ticket_number: ticketNumber,
      user_id: user?.id ?? null,
      email: input.email,
      name: input.name,
      subject: input.subject,
      category: input.category,
      priority: input.priority,
      status: "open",
    })
    .select()
    .single()

  if (ticketErr) {
    console.error("[createTicket] error:", ticketErr.message)
    return { error: "Failed to create ticket. Please try again." }
  }

  // Insert the first message
  await admin.from("ticket_messages").insert({
    ticket_id: ticket.id,
    sender_type: "user",
    sender_id: user?.id ?? null,
    sender_name: input.name,
    content: input.message,
  })

  return { ticket }
}

export async function lookupTicket(email: string, ticketNumber: string) {
  const admin = createServiceClient()

  const { data, error } = await admin
    .from("support_tickets")
    .select("*, ticket_messages(*)")
    .eq("email", email.toLowerCase().trim())
    .eq("ticket_number", ticketNumber.trim().toUpperCase())
    .single()

  if (error || !data) return { error: "Ticket not found. Check your email and ticket number." }
  return { ticket: data }
}

export async function sendTicketMessage(ticketId: string, content: string, senderName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const admin = createServiceClient()

  const { error } = await admin.from("ticket_messages").insert({
    ticket_id: ticketId,
    sender_type: "user",
    sender_id: user?.id ?? null,
    sender_name: senderName,
    content: content.trim(),
  })

  if (error) return { error: "Failed to send message." }

  // Update ticket updated_at
  await admin
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", ticketId)

  revalidatePath("/contact")
  return { success: true }
}

// ── Admin actions ─────────────────────────────────────────────────────────────

export async function adminGetAllTickets() {
  const admin = createServiceClient()
  const { data, error } = await admin
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return { error: error.message }
  return { tickets: data }
}

export async function adminGetTicket(ticketId: string) {
  const admin = createServiceClient()
  const { data, error } = await admin
    .from("support_tickets")
    .select("*, ticket_messages(*)")
    .eq("id", ticketId)
    .single()

  if (error) return { error: error.message }
  return { ticket: data }
}

export async function adminSendMessage(ticketId: string, content: string) {
  const admin = createServiceClient()

  const { error } = await admin.from("ticket_messages").insert({
    ticket_id: ticketId,
    sender_type: "admin",
    sender_id: null,
    sender_name: "PortraifyAI Support",
    content: content.trim(),
  })

  if (error) return { error: "Failed to send message." }

  await admin
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString(), status: "in_progress" })
    .eq("id", ticketId)

  revalidatePath("/admin/tickets")
  return { success: true }
}

export async function adminUpdateTicketStatus(ticketId: string, status: TicketStatus) {
  const admin = createServiceClient()

  const { error } = await admin
    .from("support_tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId)

  if (error) return { error: error.message }

  revalidatePath("/admin/tickets")
  return { success: true }
}
