import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Refund Policy — PortraifyAI",
  description: "PortraifyAI's refund and cancellation policy for paid subscriptions.",
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
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
        <div className="mb-12">
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-foreground text-balance mb-4">Refund Policy</h1>
          <p className="text-muted-foreground text-sm">Effective date: May 1, 2025 &nbsp;·&nbsp; Last updated: May 1, 2025</p>
        </div>

        <div className="prose-policy">

          <Section title="Overview">
            <p>
              At PortraifyAI, we want you to be completely satisfied with your purchase. This Refund Policy outlines when and how you may request a refund. Please read this policy carefully before subscribing.
            </p>
          </Section>

          <Section title="1. Subscription Payments">
            <p>
              PortraifyAI offers monthly recurring subscriptions (Pro and Business). All subscription payments are processed securely by Stripe. By subscribing, you authorize us to charge your payment method at the start of each billing cycle.
            </p>
          </Section>

          <Section title="2. 7-Day Money-Back Guarantee">
            <p>
              We offer a <strong>7-day money-back guarantee</strong> on your first subscription payment for Pro and Business plans. If you are not satisfied with the Service for any reason, you may request a full refund within 7 days of your initial purchase.
            </p>
            <p>To be eligible, the following conditions must be met:</p>
            <ul>
              <li>The refund request is made within 7 calendar days of the original payment date.</li>
              <li>This is your first subscription to that plan (not a renewal or plan switch).</li>
              <li>You have not used more than 10 credits during the period.</li>
            </ul>
            <p>
              To request a refund under this guarantee, contact us at <a href="mailto:billing@portraifyai.com">billing@portraifyai.com</a> with your account email and order details.
            </p>
          </Section>

          <Section title="3. Renewal Charges">
            <p>
              Subscription renewals are <strong>non-refundable</strong> unless there was an error on our part (e.g. a technical issue prevented you from using the Service during that period). If you did not intend to renew, please ensure you cancel your subscription before your renewal date. We send reminder emails 3 days before renewal.
            </p>
          </Section>

          <Section title="4. Cancellations">
            <p>
              You may cancel your subscription at any time from your account&apos;s Billing settings. Cancellation stops future charges but does not trigger a refund for the current billing period. You will continue to have access to paid features until the end of the current billing period.
            </p>
            <p>
              To cancel: go to <strong>Dashboard → Billing → Cancel Subscription</strong>, or contact us at <a href="mailto:billing@portraifyai.com">billing@portraifyai.com</a>.
            </p>
          </Section>

          <Section title="5. Credits">
            <p>
              Credits are consumed per headshot generated. <strong>Unused credits are non-refundable and do not carry over</strong> to the next billing cycle. Credits have no monetary value and cannot be exchanged for cash.
            </p>
          </Section>

          <Section title="6. Service Outages & Technical Issues">
            <p>
              If a technical error on our platform results in credits being deducted without a successful headshot being generated, we will restore those credits to your account. Please contact us within 14 days of the incident at <a href="mailto:support@portraifyai.com">support@portraifyai.com</a> with a description of the issue.
            </p>
            <p>
              In the event of extended service downtime (more than 24 consecutive hours), we will issue a prorated credit to affected accounts or offer a partial refund at our discretion.
            </p>
          </Section>

          <Section title="7. Exceptions">
            <p>The following situations are not eligible for refunds:</p>
            <ul>
              <li>Dissatisfaction with AI-generated results (aesthetic preferences vary and results are not guaranteed).</li>
              <li>Failure to cancel before an auto-renewal date.</li>
              <li>Accounts suspended or terminated for Terms of Service violations.</li>
              <li>Renewals beyond the initial billing cycle (except for technical issues).</li>
              <li>Requests made after the 7-day guarantee window has passed.</li>
            </ul>
          </Section>

          <Section title="8. How to Request a Refund">
            <p>To request a refund, please:</p>
            <ul>
              <li>Email <a href="mailto:billing@portraifyai.com">billing@portraifyai.com</a> with subject line: &quot;Refund Request — [your account email]&quot;</li>
              <li>Include your account email address and the reason for your request.</li>
              <li>Attach or reference your payment receipt (available from your Billing page).</li>
            </ul>
            <p>
              We aim to respond to all refund requests within <strong>2 business days</strong>. Approved refunds are processed back to the original payment method and typically appear within 5–10 business days depending on your bank.
            </p>
          </Section>

          <Section title="9. Chargebacks">
            <p>
              If you initiate a chargeback with your bank before contacting us, we reserve the right to suspend your account pending resolution. We encourage you to reach out directly — we are committed to resolving issues fairly and promptly.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this Refund Policy from time to time. Changes take effect immediately upon posting. Your continued use of the Service after a change constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              For billing or refund questions, contact:<br />
              <strong>PortraifyAI Billing Support</strong><br />
              Email: <a href="mailto:billing@portraifyai.com">billing@portraifyai.com</a><br />
              Support portal: <Link href="/contact">portraifyai.com/contact</Link>
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
