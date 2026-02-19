"use client";

import { Globe, Smartphone, FileArchive, Rocket, ExternalLink, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { exportAsZip, exportAsPWA } from "@/lib/export";

interface Screen {
  name: string;
  html: string;
}

interface PublishPanelProps {
  appId: string;
  appName: string;
  screens: Screen[];
  appDescription: string;
}

export function PublishPanel({ appId, appName, screens, appDescription }: PublishPanelProps) {
  const liveUrl = typeof window !== "undefined"
    ? `${window.location.origin}/app/${appId}`
    : "";

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(liveUrl);
    toast.success("Live URL copied!");
  };

  const handleZip = async () => {
    try {
      await exportAsZip(appName, screens, appDescription);
      toast.success("ZIP downloaded!");
    } catch {
      toast.error("Export failed");
    }
  };

  const handlePWA = async () => {
    try {
      await exportAsPWA(appName, screens, appDescription);
      toast.success("PWA package downloaded!");
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <div className="p-3 space-y-3">
      {/* Live Web */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">Live on Web</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs text-green-400">Published</span>
            </div>
          </div>
        </div>
        {screens.length > 0 ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/[0.04] rounded-lg px-3 py-2">
              <p className="text-xs text-white/50 font-mono truncate">{liveUrl}</p>
            </div>
            <button onClick={handleCopyUrl} className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors">
              Copy
            </button>
          </div>
        ) : (
          <p className="text-xs text-white/30">Generate your app first</p>
        )}
      </div>

      {/* ZIP Download */}
      <button
        onClick={handleZip}
        disabled={screens.length === 0}
        className="w-full rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-left hover:bg-white/[0.04] transition-all disabled:opacity-40 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <FileArchive className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">Download ZIP</p>
            <p className="text-xs text-white/30 mt-0.5">HTML + CSS + JS + SDK bundle</p>
          </div>
        </div>
      </button>

      {/* PWA Download */}
      <button
        onClick={handlePWA}
        disabled={screens.length === 0}
        className="w-full rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-left hover:bg-white/[0.04] transition-all disabled:opacity-40 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Rocket className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">Download PWA</p>
            <p className="text-xs text-white/30 mt-0.5">Progressive Web App with offline support</p>
          </div>
        </div>
      </button>

      {/* Android APK */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 opacity-60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white/80">Android APK</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">Coming Soon</span>
            </div>
            <p className="text-xs text-white/30 mt-0.5">Signed APK for direct install or Play Store</p>
          </div>
        </div>
      </div>

      {/* iOS */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 opacity-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center">
            <Lock className="w-4 h-4 text-white/30" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white/50">iOS App</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/30 font-medium">Pro Plan</span>
            </div>
            <p className="text-xs text-white/20 mt-0.5">Requires Apple Developer Account</p>
          </div>
        </div>
      </div>
    </div>
  );
}
