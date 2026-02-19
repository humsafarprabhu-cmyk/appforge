"use client";

import { useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { Smartphone, Trash2, Edit2, Plus, GripVertical, Copy, Eye, MoreHorizontal } from "lucide-react";
import { useBuilderStore } from "@/stores/builder-store";

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
  const [editingName, setEditingName] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const { removeScreen, updateScreen } = useBuilderStore();

  if (screens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Smartphone className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">No screens yet</p>
        <p className="text-white/25 text-xs mt-1">Describe your app in the chat to generate screens</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with count */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.04]">
        <p className="text-xs text-white/40">{screens.length} screen{screens.length !== 1 ? "s" : ""}</p>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-[11px] font-medium hover:bg-indigo-500/15 transition-colors">
          <Plus className="w-3 h-3" />
          Add
        </button>
      </div>

      {/* Screen list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {screens.map((screen, i) => (
          <motion.div
            key={`${screen.name}-${i}`}
            className={`relative rounded-xl transition-all ${
              currentScreen === i
                ? "bg-indigo-500/15 border border-indigo-500/30"
                : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
            }`}
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <button
              onClick={() => onScreenChange(i)}
              className="w-full flex items-center gap-3 p-3 text-left"
            >
              {/* Thumbnail */}
              <div className="w-12 h-20 rounded-lg bg-[#0a0a0f] border border-white/[0.06] overflow-hidden flex-shrink-0 relative">
                <iframe
                  srcDoc={screen.html}
                  className="w-[375px] h-[812px] border-none pointer-events-none"
                  style={{ transform: "scale(0.032)", transformOrigin: "top left" }}
                  tabIndex={-1}
                  title={screen.name}
                />
                {currentScreen === i && (
                  <div className="absolute inset-0 border-2 border-indigo-500/50 rounded-lg" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {editingName === i ? (
                  <input
                    autoFocus
                    defaultValue={screen.name}
                    onBlur={(e) => {
                      updateScreen(i, { name: e.target.value || screen.name });
                      setEditingName(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        updateScreen(i, { name: (e.target as HTMLInputElement).value || screen.name });
                        setEditingName(null);
                      }
                      if (e.key === "Escape") setEditingName(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/[0.06] border border-indigo-500/30 rounded px-2 py-0.5 text-sm text-white outline-none w-full"
                  />
                ) : (
                  <p className={`text-sm font-medium truncate ${
                    currentScreen === i ? "text-indigo-300" : "text-white/70"
                  }`}>
                    {screen.name}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] text-white/25">
                    {Math.round(screen.html.length / 1024)}KB
                  </span>
                  {i === 0 && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-[9px] text-indigo-300 font-bold">
                      HOME
                    </span>
                  )}
                </div>
              </div>

              <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                currentScreen === i
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-white/[0.04] text-white/30"
              }`}>
                {i + 1}
              </span>
            </button>

            {/* Action buttons on hover */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingName(i); }}
                className="w-6 h-6 rounded bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60"
                title="Rename"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              {screens.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeScreen(i); }}
                  className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-red-400/40 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-3 border-t border-white/[0.04]">
        <p className="text-[11px] text-white/20 text-center">
          💡 &quot;Add a settings screen&quot; or &quot;Remove the profile page&quot; in chat
        </p>
      </div>
    </div>
  );
}
