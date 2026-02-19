"use client";

import { useState, useEffect } from "react";
import { 
  Palette, Shield, Bell, Globe, Code2, 
  ChevronRight, AlertTriangle, Trash2,
  Smartphone
} from "lucide-react";
import { useBuilderStore } from "@/stores/builder-store";
import { motion, AnimatePresence } from "framer-motion";

interface SettingsPanelProps {
  appId: string;
}

interface SettingsSection {
  id: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  bg: string;
}

const SECTIONS: SettingsSection[] = [
  { id: "general", icon: <Smartphone className="w-4 h-4 text-indigo-400" />, label: "General", desc: "App name, icon, description", bg: "bg-indigo-500/10" },
  { id: "theme", icon: <Palette className="w-4 h-4 text-pink-400" />, label: "Theme & Colors", desc: "Colors, fonts, dark/light mode", bg: "bg-pink-500/10" },
  { id: "auth", icon: <Shield className="w-4 h-4 text-blue-400" />, label: "Authentication", desc: "Login methods, signup settings", bg: "bg-blue-500/10" },
  { id: "notifications", icon: <Bell className="w-4 h-4 text-amber-400" />, label: "Notifications", desc: "Push notifications, triggers", bg: "bg-amber-500/10" },
  { id: "integrations", icon: <Code2 className="w-4 h-4 text-purple-400" />, label: "Integrations", desc: "Analytics, payments, APIs", bg: "bg-purple-500/10" },
  { id: "danger", icon: <AlertTriangle className="w-4 h-4 text-red-400" />, label: "Danger Zone", desc: "Delete app, reset data", bg: "bg-red-500/10" },
];

const THEMES = [
  { name: "Indigo", primary: "#6366f1", accent: "#818cf8" },
  { name: "Emerald", primary: "#10b981", accent: "#34d399" },
  { name: "Rose", primary: "#f43f5e", accent: "#fb7185" },
  { name: "Blue", primary: "#3b82f6", accent: "#60a5fa" },
  { name: "Orange", primary: "#f97316", accent: "#fb923c" },
  { name: "Purple", primary: "#a855f7", accent: "#c084fc" },
  { name: "Teal", primary: "#14b8a6", accent: "#2dd4bf" },
];

export function SettingsPanel({ appId }: SettingsPanelProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { appName, setAppName, appDescription, setAppDescription, blueprint } = useBuilderStore();
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [authEnabled, setAuthEnabled] = useState(blueprint?.auth?.enabled ?? true);
  const [googleAuth, setGoogleAuth] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  const toggle = (id: string) => setExpanded(expanded === id ? null : id);

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-10 h-6 rounded-full relative transition-colors ${enabled ? "bg-indigo-500" : "bg-white/10"}`}
    >
      <motion.div
        className="w-4.5 h-4.5 bg-white rounded-full absolute top-[3px] shadow-sm"
        animate={{ left: enabled ? 20 : 3 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );

  return (
    <div className="p-3 space-y-1.5">
      {SECTIONS.map((section) => (
        <div key={section.id}>
          <button
            onClick={() => toggle(section.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group ${
              expanded === section.id
                ? "bg-white/[0.04] border border-white/[0.08]"
                : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
            }`}
          >
            <div className={`w-9 h-9 rounded-lg ${section.bg} flex items-center justify-center flex-shrink-0`}>
              {section.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/70">{section.label}</p>
              <p className="text-xs text-white/30 mt-0.5">{section.desc}</p>
            </div>
            <motion.div animate={{ rotate: expanded === section.id ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronRight className="w-4 h-4 text-white/20" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expanded === section.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-3 py-3 space-y-3">
                  {section.id === "general" && (
                    <>
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">App Name</label>
                        <input
                          value={appName}
                          onChange={(e) => setAppName(e.target.value)}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">Description</label>
                        <textarea
                          value={appDescription}
                          onChange={(e) => setAppDescription(e.target.value)}
                          rows={3}
                          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-500/50 resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-white/40 mb-1.5 block">App Icon</label>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
                            📱
                          </div>
                          <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/50 hover:text-white/70 transition-colors">
                            Upload Icon
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {section.id === "theme" && (
                    <>
                      <div>
                        <label className="text-xs text-white/40 mb-2 block">Color Theme</label>
                        <div className="grid grid-cols-7 gap-2">
                          {THEMES.map((theme, i) => (
                            <button
                              key={i}
                              onClick={() => setSelectedTheme(i)}
                              className={`w-full aspect-square rounded-xl transition-all ${
                                selectedTheme === i ? "ring-2 ring-white/40 scale-110" : "hover:scale-105"
                              }`}
                              style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }}
                              title={theme.name}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/60">Dark Mode</p>
                          <p className="text-[11px] text-white/25">Default theme for your app</p>
                        </div>
                        <ToggleSwitch enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                      </div>
                    </>
                  )}

                  {section.id === "auth" && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/60">Enable Authentication</p>
                          <p className="text-[11px] text-white/25">Users can sign up and log in</p>
                        </div>
                        <ToggleSwitch enabled={authEnabled} onToggle={() => setAuthEnabled(!authEnabled)} />
                      </div>
                      {authEnabled && (
                        <>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white/60">Email + Password</p>
                              <p className="text-[11px] text-white/25">Always enabled</p>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">ON</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white/60">Google Sign-In</p>
                              <p className="text-[11px] text-white/25">Requires Google OAuth setup</p>
                            </div>
                            <ToggleSwitch enabled={googleAuth} onToggle={() => setGoogleAuth(!googleAuth)} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-white/60">Require Login</p>
                              <p className="text-[11px] text-white/25">Users must sign in to use app</p>
                            </div>
                            <ToggleSwitch enabled={true} onToggle={() => {}} />
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {section.id === "notifications" && (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-white/60">Push Notifications</p>
                          <p className="text-[11px] text-white/25">Send updates to users</p>
                        </div>
                        <ToggleSwitch enabled={pushEnabled} onToggle={() => setPushEnabled(!pushEnabled)} />
                      </div>
                      {pushEnabled && (
                        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                          <p className="text-xs text-amber-400/60">
                            Push notifications will be available after deploying your app. Configure triggers in the Admin Panel.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {section.id === "integrations" && (
                    <>
                      {[
                        { name: "Google Analytics", desc: "Track user behavior", connected: false },
                        { name: "Stripe", desc: "Accept payments", connected: false },
                        { name: "Razorpay", desc: "Payments for India", connected: false },
                        { name: "AdMob", desc: "Display ads for revenue", connected: false },
                      ].map((integration, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02]">
                          <div>
                            <p className="text-sm text-white/60">{integration.name}</p>
                            <p className="text-[11px] text-white/25">{integration.desc}</p>
                          </div>
                          <button className="px-2.5 py-1 rounded-lg bg-white/[0.06] text-xs text-white/40 hover:text-white/60 transition-colors">
                            Connect
                          </button>
                        </div>
                      ))}
                    </>
                  )}

                  {section.id === "danger" && (
                    <>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                        <div>
                          <p className="text-sm text-red-400">Reset All Data</p>
                          <p className="text-[11px] text-red-400/40">Clear all user data and collections</p>
                        </div>
                        <Trash2 className="w-4 h-4 text-red-400/50" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors">
                        <div>
                          <p className="text-sm text-red-400">Delete App</p>
                          <p className="text-[11px] text-red-400/40">Permanently delete this app and all data</p>
                        </div>
                        <Trash2 className="w-4 h-4 text-red-400/50" />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      <div className="pt-3 px-1">
        <p className="text-[11px] text-white/20">
          💡 Tip: &quot;Enable Google login&quot; or &quot;Change theme to emerald&quot; in chat
        </p>
      </div>
    </div>
  );
}
