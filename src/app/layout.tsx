import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AppForge — Build Mobile Apps with AI in Minutes",
  description: "Turn your app idea into a real mobile app. AI-powered app builder with instant preview, glassmorphism UI, and one-click export. No coding required.",
  keywords: ["AI app builder", "mobile app builder", "no-code app maker", "AI mobile app", "build app without coding", "app generator", "PWA builder", "glassmorphism UI", "instant app preview", "one-click export"],
  authors: [{ name: "AppForge Team" }],
  creator: "AppForge",
  publisher: "AppForge",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "AppForge - AI Mobile App Builder",
    description: "Describe your app. It's on your phone in 2 minutes. Build stunning mobile apps with AI - no code required.",
    siteName: "AppForge",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AppForge - AI Mobile App Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AppForgeAI",
    creator: "@AppForgeAI",
    title: "AppForge - AI Mobile App Builder",
    description: "Describe your app. It's on your phone in 2 minutes. Build stunning mobile apps with AI - no code required.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#6366f1" },
    ],
  },
  other: {
    "msapplication-TileColor": "#6366f1",
    "theme-color": "#0a0a0f",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-36YPNK1326" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-36YPNK1326');`}
        </Script>
        {/* Lemon Squeezy overlay checkout */}
        <Script src="https://assets.lemonsqueezy.com/lemon.js" strategy="lazyOnload" />
        {/* Razorpay loaded on-demand in checkout.ts */}
      </head>
      <body
        className={`${geistSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <AuthProvider>
        {children}
        </AuthProvider>
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
            },
          }}
        />
      </body>
    </html>
  );
}