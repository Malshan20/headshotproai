import { createServiceClient } from "@/lib/supabase/service"
import AdminTicketsClient from "@/components/admin/AdminTicketsClient"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const metadata = { title: "Admin — Support Tickets" }

// Simple admin guard — checks for an ADMIN_EMAIL env var
async function isAdmin(email: string | undefined) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase())
  return !!email && adminEmails.includes(email.toLowerCase())
}

export default async function AdminTicketsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !(await isAdmin(user.email))) redirect("/dashboard")

  const admin = createServiceClient()
  const { data: tickets } = await admin
    .from("support_tickets")
    .select("*")
    .order("updated_at", { ascending: false })

  return <AdminTicketsClient tickets={tickets ?? []} currentUserEmail={user.email!} />
}
