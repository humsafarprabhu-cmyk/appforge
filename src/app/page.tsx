import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Examples } from "@/components/landing/Examples";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export const metadata = {
  title: "AppForge — AI Mobile App Builder | Describe → Build → Download",
  description: "Build stunning mobile apps with AI. No code, no complex tools, no months of development. Just describe what you want, and watch your app come to life.",
  openGraph: {
    title: "AppForge — AI Mobile App Builder",
    description: "Build stunning mobile apps with AI in minutes, not months.",
    type: "website",
    url: "https://appforge.ai",
    siteName: "AppForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "AppForge — AI Mobile App Builder",
    description: "Build stunning mobile apps with AI in minutes, not months.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AppForge",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://appforge-swart.vercel.app",
  description: "Turn your app idea into a real mobile app. AI-powered app builder with instant preview, glassmorphism UI, and one-click export. No coding required.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "AI-powered app generation",
    "Instant live preview",
    "Glassmorphism UI design",
    "One-click ZIP/PWA export",
    "No coding required",
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <Features />
      <Examples />
      <LiveDemo />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}