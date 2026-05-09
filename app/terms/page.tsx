import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service — PortraifyAI",
  description: "The terms and conditions governing your use of PortraifyAI.",
}

export default function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-foreground text-balance mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">Effective date: May 1, 2025 &nbsp;·&nbsp; Last updated: May 1, 2025</p>
        </div>

        <div className="prose-policy">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using PortraifyAI (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all of these Terms, you may not use the Service. These Terms apply to all visitors, users, and others who access the Service.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 13 years of age to use the Service. By using the Service, you represent that you are at least 13 years old and have the legal capacity to enter into these Terms. If you are using the Service on behalf of an organization, you represent that you have authority to bind that organization.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              You must create an account to access most features. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. You agree to notify us immediately at <a href="mailto:support@portraifyai.com">support@portraifyai.com</a> if you suspect unauthorized use of your account. We reserve the right to suspend or terminate accounts at our discretion.
            </p>
          </Section>

          <Section title="4. Service Description">
            <p>
              PortraifyAI provides AI-powered professional headshot generation from user-uploaded photographs. The Service uses third-party AI models (including Google Gemini and Replicate) to transform photos. Results may vary based on input image quality, lighting, and other factors. We do not guarantee specific output results.
            </p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul>
              <li>Upload images of individuals without their explicit consent.</li>
              <li>Generate images that are deceptive, defamatory, or intended to impersonate others.</li>
              <li>Create content that is illegal, harmful, threatening, abusive, or violates any third-party rights.</li>
              <li>Attempt to reverse-engineer, scrape, or otherwise extract data or models from the Service.</li>
              <li>Use automated means (bots, scripts) to access the Service beyond normal use without our written permission.</li>
              <li>Circumvent any usage limits, access controls, or billing systems.</li>
              <li>Upload malicious files or interfere with the integrity or performance of the Service.</li>
            </ul>
          </Section>

          <Section title="6. Intellectual Property">
            <p>
              <strong>Your content:</strong> You retain ownership of photos you upload. By uploading, you grant PortraifyAI a limited, non-exclusive license to process your photos solely for the purpose of providing the Service.
            </p>
            <p>
              <strong>Generated images:</strong> Subject to your compliance with these Terms and payment of applicable fees, you are granted a license to use generated headshots for personal and commercial purposes according to your subscription plan.
            </p>
            <p>
              <strong>Free plan:</strong> Generated images include a PortraifyAI watermark and are licensed for personal use only.
            </p>
            <p>
              <strong>Pro and Business plans:</strong> Generated images are watermark-free and include a commercial use license.
            </p>
            <p>
              <strong>PortraifyAI IP:</strong> The Service, including its design, code, branding, and underlying technology, is owned exclusively by PortraifyAI and protected by applicable intellectual property laws.
            </p>
          </Section>

          <Section title="7. Credits & Usage Limits">
            <p>
              The Service operates on a credit system. Each subscription plan includes a defined number of credits per billing cycle:
            </p>
            <ul>
              <li><strong>Free:</strong> 3 credits per month, standard styles, 720p resolution, watermark applied.</li>
              <li><strong>Pro:</strong> 50 credits per month, all premium styles, 4K resolution, no watermark.</li>
              <li><strong>Business:</strong> Unlimited credits per month, all premium styles, 4K resolution, no watermark.</li>
            </ul>
            <p>
              Unused credits do not roll over to the next billing cycle. Credits are non-transferable and have no cash value.
            </p>
          </Section>

          <Section title="8. Subscriptions & Billing">
            <p>
              Paid plans are billed on a recurring monthly basis via Stripe. By subscribing, you authorize us to charge your payment method on a recurring basis. Subscriptions automatically renew unless cancelled before the renewal date. Prices are listed in USD and are subject to change with 30 days&apos; notice. Taxes may apply based on your jurisdiction.
            </p>
          </Section>

          <Section title="9. Cancellation">
            <p>
              You may cancel your subscription at any time from your Billing settings. Cancellation takes effect at the end of the current billing period. You will retain access to paid features until the period ends. We do not provide prorated refunds for mid-period cancellations except as described in our Refund Policy.
            </p>
          </Section>

          <Section title="10. Disclaimers">
            <p>
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT RESULTS WILL MEET YOUR EXPECTATIONS.
            </p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PORTRAIFYAI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE 3 MONTHS PRECEDING THE CLAIM.
            </p>
          </Section>

          <Section title="12. Indemnification">
            <p>
              You agree to indemnify, defend, and hold harmless PortraifyAI, its officers, directors, employees, and agents from any claims, liabilities, damages, and expenses (including reasonable attorneys&apos; fees) arising from your use of the Service, your content, or your violation of these Terms.
            </p>
          </Section>

          <Section title="13. Termination">
            <p>
              We may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service ceases immediately. Provisions that by their nature should survive termination shall survive.
            </p>
          </Section>

          <Section title="14. Governing Law">
            <p>
              These Terms are governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to conflict of law provisions. Any disputes shall be resolved exclusively in the state or federal courts located in Delaware.
            </p>
          </Section>

          <Section title="15. Changes to Terms">
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting the updated Terms with a revised effective date and, where appropriate, by email. Your continued use of the Service after changes become effective constitutes acceptance.
            </p>
          </Section>

          <Section title="16. Contact">
            <p>
              Questions about these Terms? Contact us at:<br />
              <strong>PortraifyAI</strong><br />
              Email: <a href="mailto:legal@portraifyai.com">legal@portraifyai.com</a><br />
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
