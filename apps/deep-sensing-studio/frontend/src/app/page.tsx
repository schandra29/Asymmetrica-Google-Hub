import CTASection from "@/components/landing/CTASection";
import FeaturesShowcase from "@/components/landing/FeaturesShowcase";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import LiveDemo from "@/components/landing/LiveDemo";
import ScrollReveal from "@/components/landing/ScrollReveal";
import StatsBanner from "@/components/landing/StatsBanner";
import Testimonials from "@/components/landing/Testimonials";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between overflow-x-hidden">
      <Hero />
      <ScrollReveal>
        <FeaturesShowcase />
      </ScrollReveal>
      <ScrollReveal>
        <LiveDemo />
      </ScrollReveal>
      <ScrollReveal>
        <HowItWorks />
      </ScrollReveal>
      <ScrollReveal>
        <StatsBanner />
      </ScrollReveal>
      <ScrollReveal>
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal>
        <CTASection />
      </ScrollReveal>
      <Footer />
    </main>
  );
}