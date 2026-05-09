import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import FeaturesSection from "@/components/landing/FeaturesSection"
import HowItWorksSection from "@/components/landing/HowItWorksSection"
import PricingSection from "@/components/landing/PricingSection"
import TestimonialsSection from "@/components/landing/TestimonialsSection"
import FooterFAQ from "@/components/landing/FooterFAQ"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <TestimonialsSection />
      <PricingSection />
      <FooterFAQ />
    </main>
  )
}
