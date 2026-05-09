import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import ContactClient from "@/components/contact/ContactClient"

export const metadata = {
  title: "Contact & Support — PortraifyAI",
  description: "Get help, track your support ticket, or chat with our team.",
}

export default async function ContactPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()
    profile = data
  }

  return (
    <Suspense>
      <ContactClient user={user ? { id: user.id, email: user.email!, name: profile?.full_name ?? "" } : null} />
    </Suspense>
  )
}
