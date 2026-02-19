"use client";

import { motion } from "framer-motion";
import { Smartphone, GripVertical, Trash2, Edit2 } from "lucide-react";

interface Screen {
  name: string;
  html: string;
}

interface ScreensPanelProps {
  screens: Screen[];
  currentScreen: number;
  onScreenChange: (index: number) => void;
}

export function ScreensPanel({ screens, currentScreen, onScreenChange }: ScreensPanelProps) {
  if (screens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Smartphone className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">No screens yet</p>
        <p className="text-white/25 text-xs mt-1">Generate your app to see screens here</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {screens.map((screen, i) => (
        <motion.button
          key={i}
          onClick={() => onScreenChange(i)}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
            currentScreen === i
              ? "bg-indigo-500/15 border border-indigo-500/30"
              : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
          }`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Thumbnail */}
          <div className="w-12 h-20 rounded-lg bg-[#0a0a0f] border border-white/[0.06] overflow-hidden flex-shrink-0">
            <iframe
              srcDoc={screen.html}
              className="w-[375px] h-[812px] border-none pointer-events-none"
              style={{ transform: "scale(0.032)", transformOrigin: "top left" }}
              tabIndex={-1}
              title={screen.name}
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              currentScreen === i ? "text-indigo-300" : "text-white/70"
            }`}>
              {screen.name}
            </p>
            <p className="text-xs text-white/30 mt-0.5">
              {Math.round(screen.html.length / 1024)}KB
            </p>
          </div>

          <span className={`text-xs px-2 py-0.5 rounded-full ${
            currentScreen === i
              ? "bg-indigo-500/20 text-indigo-300"
              : "bg-white/[0.04] text-white/30"
          }`}>
            {i + 1}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
