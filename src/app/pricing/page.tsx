import { PricingClient } from "./pricing-client";

export const metadata = {
  title: "Pricing | AppForge — Plans for Every Builder",
  description: "Choose the perfect plan to build amazing mobile apps with AI. Start free, upgrade when you're ready to scale. Compare all features and pricing.",
  openGraph: {
    title: "Pricing | AppForge — Plans for Every Builder",
    description: "Choose the perfect plan to build amazing mobile apps with AI. Start free, upgrade when you're ready to scale.",
    type: "website",
    url: "https://appforge.ai/pricing",
    siteName: "AppForge",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | AppForge — Plans for Every Builder",
    description: "Choose the perfect plan to build amazing mobile apps with AI. Start free, upgrade when you're ready to scale.",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}