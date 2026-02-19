"use client";

import { History, RotateCcw, Clock } from "lucide-react";

interface VersionsPanelProps {
  appId: string;
}

export function VersionsPanel({ appId }: VersionsPanelProps) {
  // TODO: Fetch versions from app_versions table
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <History className="w-10 h-10 text-white/20 mb-3" />
      <p className="text-white/40 text-sm">Version history</p>
      <p className="text-white/25 text-xs mt-1 max-w-[240px]">
        Every time AI updates your app, a version is saved. You can restore any previous version.
      </p>
      <div className="mt-6 space-y-2 w-full px-2">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-left">
          <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <div>
            <p className="text-xs font-medium text-indigo-300">Current Version</p>
            <p className="text-[11px] text-white/30 mt-0.5">Auto-saved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
