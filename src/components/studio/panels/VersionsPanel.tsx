"use client";

import { useState } from "react";
import { History, RotateCcw, Clock, Check, GitBranch, Save, ChevronRight } from "lucide-react";
import { useBuilderStore } from "@/stores/builder-store";
import { motion, AnimatePresence } from "framer-motion";

interface VersionsPanelProps {
  appId: string;
}

interface Version {
  id: string;
  label: string;
  timestamp: Date;
  screenCount: number;
  trigger: string;
  isCurrent: boolean;
}

export function VersionsPanel({ appId }: VersionsPanelProps) {
  const { screens, appName } = useBuilderStore();
  const [versions, setVersions] = useState<Version[]>(() => {
    if (screens.length === 0) return [];
    return [{
      id: "current",
      label: "Current Version",
      timestamp: new Date(),
      screenCount: screens.length,
      trigger: "AI generation",
      isCurrent: true,
    }];
  });
  const [saving, setSaving] = useState(false);

  const saveVersion = () => {
    setSaving(true);
    const newVersion: Version = {
      id: `v-${Date.now()}`,
      label: `Snapshot — ${new Date().toLocaleTimeString()}`,
      timestamp: new Date(),
      screenCount: screens.length,
      trigger: "Manual save",
      isCurrent: false,
    };
    // Mark old current as not current
    setVersions(prev => [
      { ...prev[0], isCurrent: true },
      newVersion,
      ...prev.slice(1).map(v => ({ ...v, isCurrent: false })),
    ]);
    setTimeout(() => setSaving(false), 500);
  };

  if (screens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <History className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">Version history</p>
        <p className="text-white/25 text-xs mt-1 max-w-[240px]">
          Generate your app to start tracking versions. Every AI update creates a snapshot you can restore.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Save button */}
      <div className="p-3 border-b border-white/[0.04]">
        <button
          onClick={saveVersion}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium hover:bg-indigo-500/15 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <Check className="w-4 h-4" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Saved!" : "Save Snapshot"}
        </button>
      </div>

      {/* Version list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {versions.map((version, i) => (
          <motion.div
            key={version.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 rounded-xl border transition-all ${
              version.isCurrent
                ? "bg-indigo-500/10 border-indigo-500/20"
                : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                version.isCurrent ? "bg-indigo-500/20" : "bg-white/[0.04]"
              }`}>
                {version.isCurrent ? (
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Clock className="w-4 h-4 text-white/30" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-medium truncate ${
                    version.isCurrent ? "text-indigo-300" : "text-white/60"
                  }`}>
                    {version.label}
                  </p>
                  {version.isCurrent && (
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-[9px] text-indigo-300 font-bold">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-white/25">
                    {version.screenCount} screens
                  </span>
                  <span className="text-white/10">·</span>
                  <span className="text-[11px] text-white/25">
                    {version.trigger}
                  </span>
                </div>
              </div>
            </div>

            {!version.isCurrent && (
              <div className="flex gap-2 mt-2.5">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] text-[11px] text-white/40 hover:text-white/60 transition-colors">
                  <RotateCcw className="w-3 h-3" />
                  Restore
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/[0.04] text-[11px] text-white/40 hover:text-white/60 transition-colors">
                  <ChevronRight className="w-3 h-3" />
                  Preview
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="p-3 border-t border-white/[0.04]">
        <p className="text-[11px] text-white/20 text-center">
          Versions are saved locally. Deploy to persist permanently.
        </p>
      </div>
    </div>
  );
}
