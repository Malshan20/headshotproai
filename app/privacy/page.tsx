import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy — PortraifyAI",
  description: "How PortraifyAI collects, uses, and protects your personal data.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 sticky top-0 z-40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-foreground text-sm">
            PortraifyAI
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="mb-12">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-foreground text-balance mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">Effective date: May 1, 2025 &nbsp;·&nbsp; Last updated: May 1, 2025</p>
        </div>

        <div className="prose-policy">
          <Section title="1. Introduction">
            <p>
              PortraifyAI (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the PortraifyAI platform accessible at portraifyai.com (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p>We collect the following categories of information:</p>
            <ul>
              <li><strong>Account information</strong> — name, email address, and password (hashed) when you register.</li>
              <li><strong>Uploaded photos</strong> — images you upload to generate professional headshots. These are stored securely and used solely for generation purposes.</li>
              <li><strong>Generated images</strong> — the AI-produced headshots associated with your account.</li>
              <li><strong>Payment information</strong> — billing details are collected and processed by Stripe. We do not store your full card number on our servers.</li>
              <li><strong>Usage data</strong> — log data including IP address, browser type, pages visited, time spent, and referring URLs.</li>
              <li><strong>Communications</strong> — messages you send us via support tickets or email.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul>
              <li>To provide, maintain, and improve the Service.</li>
              <li>To process transactions and manage your subscription.</li>
              <li>To generate AI headshots from your uploaded photos.</li>
              <li>To send transactional emails (e.g. receipts, account alerts).</li>
              <li>To respond to support requests and inquiries.</li>
              <li>To detect, prevent, and address fraud or abuse.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="4. Photo & Image Data">
            <p>
              Your uploaded photos are processed by the Google Gemini API and/or Replicate AI models solely to generate your requested headshot. We do <strong>not</strong> use your photos to train AI models. Uploaded source photos are automatically deleted from our processing pipeline within 24 hours of generation. Generated headshots are stored in your account until you delete them or close your account.
            </p>
          </Section>

          <Section title="5. Sharing of Information">
            <p>We do not sell your personal data. We may share information with:</p>
            <ul>
              <li><strong>Service providers</strong> — Supabase (database & storage), Stripe (payments), Google (AI generation), Replicate (AI generation), Vercel (hosting). Each is bound by data processing agreements.</li>
              <li><strong>Law enforcement</strong> — when required by applicable law, court order, or governmental authority.</li>
              <li><strong>Business transfers</strong> — in connection with a merger, acquisition, or sale of assets, your data may be transferred.</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <p>
              We retain your account data for as long as your account is active. Uploaded source photos are deleted within 24 hours of generation. Generated headshots remain until you delete them. Upon account deletion, all personal data is removed within 30 days except where retention is required by law.
            </p>
          </Section>

          <Section title="7. Cookies & Tracking">
            <p>
              We use essential cookies for authentication sessions. We do not use advertising or third-party tracking cookies. You may disable cookies in your browser settings, but this may affect Service functionality.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We implement industry-standard safeguards including TLS encryption in transit, AES-256 encryption at rest, row-level security in our database, and regular security reviews. However, no method of transmission over the internet is 100% secure.
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul>
              <li>Access and receive a copy of your personal data.</li>
              <li>Correct inaccurate personal data.</li>
              <li>Request deletion of your personal data.</li>
              <li>Object to or restrict processing of your data.</li>
              <li>Data portability.</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at <a href="mailto:privacy@portraifyai.com">privacy@portraifyai.com</a> or use the account deletion option in Settings.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              The Service is not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal data, please contact us immediately.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page with a revised &quot;Last updated&quot; date and, where appropriate, by email.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>
              If you have questions about this Privacy Policy, please contact us at:<br />
              <strong>PortraifyAI</strong><br />
              Email: <a href="mailto:privacy@portraifyai.com">privacy@portraifyai.com</a><br />
              Support: <Link href="/contact">portraifyai.com/contact</Link>
            </p>
          </Section>
        </div>

        <PolicyFooter />
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold text-foreground mb-4">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3 text-[15px]">
        {children}
      </div>
    </section>
  )
}

function PolicyFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
      <span>&copy; {new Date().getFullYear()} PortraifyAI. All rights reserved.</span>
      <div className="flex items-center gap-5">
        <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        <Link href="/refund" className="hover:text-foreground transition-colors">Refund Policy</Link>
      </div>
    </footer>
  )
}
