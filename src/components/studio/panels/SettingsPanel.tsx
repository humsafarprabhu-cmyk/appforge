"use client";

import { Settings, Palette, Shield, Bell, Globe, Code2 } from "lucide-react";

interface SettingsPanelProps {
  appId: string;
}

export function SettingsPanel({ appId }: SettingsPanelProps) {
  const sections = [
    { icon: <Palette className="w-4 h-4 text-pink-400" />, label: "Theme & Colors", desc: "Colors, fonts, dark/light mode", bg: "bg-pink-500/10" },
    { icon: <Shield className="w-4 h-4 text-blue-400" />, label: "Authentication", desc: "Email, Google login, signup", bg: "bg-blue-500/10" },
    { icon: <Bell className="w-4 h-4 text-amber-400" />, label: "Notifications", desc: "Push notifications, triggers", bg: "bg-amber-500/10" },
    { icon: <Globe className="w-4 h-4 text-green-400" />, label: "Domain & SEO", desc: "Custom domain, meta tags", bg: "bg-green-500/10" },
    { icon: <Code2 className="w-4 h-4 text-purple-400" />, label: "Integrations", desc: "Stripe, analytics, APIs", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-3 space-y-2">
      {sections.map((s, i) => (
        <button
          key={i}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left"
        >
          <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
            {s.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white/70">{s.label}</p>
            <p className="text-xs text-white/30 mt-0.5">{s.desc}</p>
          </div>
        </button>
      ))}

      <div className="pt-3 px-1">
        <p className="text-[11px] text-white/20">
          💡 Tip: &quot;Enable Google login for my app&quot; in chat
        </p>
      </div>
    </div>
  );
}
