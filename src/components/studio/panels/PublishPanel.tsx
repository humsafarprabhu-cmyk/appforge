"use client";

import { useState } from "react";
import { Globe, Smartphone, FileArchive, Rocket, ExternalLink, Check, Lock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { exportAsZip, exportAsPWA, exportAsExpo } from "@/lib/export";
import { useBuilderStore } from "@/stores/builder-store";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getApiBase } from "@/lib/api";

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
  const [isSaving, setIsSaving] = useState(false);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const { user } = useAuth();
  const { blueprint } = useBuilderStore();

  const apiBase = getApiBase();
  
  // For try-mode, link to backend functional app endpoint
  const jobId = useBuilderStore.getState().lastJobId;
  const liveUrl = savedSlug
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/app/${savedSlug}`
    : jobId
    ? `${apiBase}/app/${jobId}`
    : "";

  const handleCopyUrl = () => {
    if (!liveUrl) return;
    navigator.clipboard.writeText(liveUrl);
    toast.success("Live URL copied!");
  };

  const handleSaveToCloud = async () => {
    if (!user) {
      toast.error("Sign in to publish your app");
      return;
    }
    if (screens.length === 0) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "my-app";

      const { data, error } = await supabase
        .from("apps")
        .upsert({
          user_id: user.id,
          name: appName,
          slug,
          description: appDescription || "",
          screens: screens.map(s => ({ name: s.name, html: s.html })),
          blueprint: blueprint || null,
          status: "ready",
          category: "custom",
          package_name: `com.appforge.${slug}`,
        }, { onConflict: "slug" })
        .select("slug")
        .single();

      if (error) throw error;
      setSavedSlug(data.slug);
      toast.success("App published! 🚀");
    } catch (err: any) {
      toast.error(err?.message || "Failed to publish");
    } finally {
      setIsSaving(false);
    }
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
              <div className={`w-1.5 h-1.5 rounded-full ${liveUrl ? "bg-green-500" : "bg-white/20"}`} />
              <span className={`text-xs ${liveUrl ? "text-green-400" : "text-white/30"}`}>
                {savedSlug ? "Published" : liveUrl ? "Preview available" : "Not published"}
              </span>
            </div>
          </div>
        </div>
        {screens.length > 0 ? (
          <div className="space-y-2">
            {liveUrl && (
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/[0.04] rounded-lg px-3 py-2">
                  <p className="text-xs text-white/50 font-mono truncate">{liveUrl}</p>
                </div>
                <button onClick={handleCopyUrl} className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30 transition-colors">
                  Copy
                </button>
              </div>
            )}
            {!savedSlug && user && (
              <button
                onClick={handleSaveToCloud}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500/15 border border-green-500/20 text-green-300 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                {isSaving ? "Publishing..." : "Publish to Web"}
              </button>
            )}
            {!user && (
              <p className="text-xs text-white/25 text-center">Sign in to publish your app permanently</p>
            )}
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
            <p className="text-xs text-white/30 mt-0.5">Install on phone home screen — works offline, no app store needed</p>
          </div>
        </div>
      </button>

      {/* React Native Expo Export */}
      <button
        onClick={async () => {
          try {
            await exportAsExpo(appName, screens, appDescription);
            toast.success("Expo project downloaded!");
          } catch {
            toast.error("Export failed");
          }
        }}
        disabled={screens.length === 0}
        className="w-full rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-left hover:bg-white/[0.04] transition-all disabled:opacity-40 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white/80">React Native (Expo)</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium">New</span>
            </div>
            <p className="text-xs text-white/30 mt-0.5">Full source code + build to APK with EAS</p>
          </div>
        </div>
      </button>

      {/* APK Build */}
      <button
        onClick={() => {
          toast("APK builds coming soon! For now, use the React Native (Expo) export above, then run: npx eas build --platform android --profile preview", {
            duration: 8000,
            action: {
              label: "Expo Docs",
              onClick: () => window.open("https://docs.expo.dev/build/setup/", "_blank"),
            },
          });
        }}
        disabled={screens.length === 0}
        className="w-full rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-left hover:bg-white/[0.04] transition-all disabled:opacity-40 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-white/80">Build APK</p>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal-500/20 text-teal-400 font-medium">Via Expo EAS</span>
            </div>
            <p className="text-xs text-white/30 mt-0.5">Export as React Native, then build APK with EAS Build</p>
          </div>
        </div>
      </button>

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
