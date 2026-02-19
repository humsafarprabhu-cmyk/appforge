"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Share2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Screen {
  name: string;
  html: string;
}

interface App {
  id: string;
  name: string;
  description: string;
  screens: Screen[];
  color_primary: string;
  color_secondary: string;
  theme: string;
  icon_url: string | null;
  slug: string | null;
}

function getScreenIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("home") || lower.includes("dashboard")) return "🏠";
  if (lower.includes("profile") || lower.includes("account")) return "👤";
  if (lower.includes("setting")) return "⚙️";
  if (lower.includes("chat") || lower.includes("message")) return "💬";
  if (lower.includes("search") || lower.includes("explore")) return "🔍";
  if (lower.includes("cart") || lower.includes("shop")) return "🛒";
  return "📱";
}

export function AppViewer({ app }: { app: App }) {
  const [current, setCurrent] = useState(0);
  const [showSplash, setShowSplash] = useState(true);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (index: number) => {
    setCurrent(Math.max(0, Math.min(index, app.screens.length - 1)));
  };

  return (
    <div className="h-screen w-screen bg-[#050507] flex flex-col overflow-hidden">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 bg-[#050507] flex flex-col items-center justify-center"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${app.color_primary}, ${app.color_secondary})` }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M16 18l6-6-6-6" />
                <path d="M8 6l-6 6 6 6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mt-4">{app.name}</h1>
            <p className="text-white/40 text-sm mt-1">Built with AppForge</p>
            <div className="mt-6 w-8 h-8 border-3 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Content */}
      <div
        className="flex-1 relative overflow-hidden"
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const diff = touchStart - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 60) navigateTo(current + (diff > 0 ? 1 : -1));
        }}
      >
        <AnimatePresence mode="wait">
          <motion.iframe
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            srcDoc={app.screens[current]?.html || ""}
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin"
            title={app.screens[current]?.name || "Screen"}
          />
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/[0.06] flex items-center justify-around px-2 flex-shrink-0 safe-bottom">
        {app.screens.map((screen, i) => (
          <button
            key={i}
            onClick={() => navigateTo(i)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors ${
              current === i ? "text-indigo-400" : "text-white/40"
            }`}
          >
            <span className="text-base">{getScreenIcon(screen.name)}</span>
            <span className="text-[10px] font-medium truncate max-w-[60px]">{screen.name}</span>
          </button>
        ))}
      </nav>

      {/* AppForge watermark (free tier) */}
      <a
        href="https://appforge-swart.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed top-2 right-2 z-40 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-[10px] text-white/30 hover:text-white/50 transition-colors"
      >
        Built with AppForge
      </a>
    </div>
  );
}
