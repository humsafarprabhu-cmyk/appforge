"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Smartphone, Database, Users, Rocket,
  Settings, History, ChevronLeft, ChevronRight, Sparkles,
  Send, Loader2, PanelLeftClose, PanelLeft
} from "lucide-react";
import { useBuilderStore } from "@/stores/builder-store";
import { PhonePreview } from "@/components/builder/PhonePreview";
import { ScreenNavigator } from "@/components/builder/ScreenNavigator";
import { ChatPanel } from "./panels/ChatPanel";
import { DataPanel } from "./panels/DataPanel";
import { UsersPanel } from "./panels/UsersPanel";
import { PublishPanel } from "./panels/PublishPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { VersionsPanel } from "./panels/VersionsPanel";
import { ScreensPanel } from "./panels/ScreensPanel";

type TabId = "chat" | "screens" | "data" | "users" | "publish" | "settings" | "versions";

interface Tab {
  id: TabId;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const TABS: Tab[] = [
  { id: "chat", icon: <MessageSquare className="w-5 h-5" />, label: "Chat" },
  { id: "screens", icon: <Smartphone className="w-5 h-5" />, label: "Screens" },
  { id: "data", icon: <Database className="w-5 h-5" />, label: "Data" },
  { id: "users", icon: <Users className="w-5 h-5" />, label: "Users" },
  { id: "publish", icon: <Rocket className="w-5 h-5" />, label: "Publish" },
  { id: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  { id: "versions", icon: <History className="w-5 h-5" />, label: "Versions" },
];

interface StudioLayoutProps {
  appId: string;
  onSendMessage: (message: string) => void;
}

export function StudioLayout({ appId, onSendMessage }: StudioLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatInput, setChatInput] = useState("");

  const {
    appName,
    appDescription,
    screens,
    currentScreen,
    messages,
    isGenerating,
    generationProgress,
    generationMessage,
    lastError,
    blueprint,
    setAppName,
    setCurrentScreen,
  } = useBuilderStore();

  const handleSend = useCallback(() => {
    if (!chatInput.trim() || isGenerating) return;
    const msg = chatInput.trim();
    setChatInput("");
    onSendMessage(msg);
  }, [chatInput, isGenerating, onSendMessage]);

  const renderPanel = () => {
    switch (activeTab) {
      case "chat":
        return <ChatPanel messages={messages} isGenerating={isGenerating} generationProgress={generationProgress} generationMessage={generationMessage} lastError={lastError} />;
      case "screens":
        return <ScreensPanel screens={screens} currentScreen={currentScreen} onScreenChange={setCurrentScreen} />;
      case "data":
        return <DataPanel appId={appId} blueprint={blueprint} />;
      case "users":
        return <UsersPanel appId={appId} />;
      case "publish":
        return <PublishPanel appId={appId} appName={appName} screens={screens} appDescription={appDescription} />;
      case "settings":
        return <SettingsPanel appId={appId} />;
      case "versions":
        return <VersionsPanel appId={appId} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050507] text-white overflow-hidden">
      {/* Top Bar */}
      <header className="h-12 border-b border-white/[0.06] flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/90">AppForge Studio</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <input
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="text-sm font-medium bg-transparent border-none outline-none text-white/80 hover:text-white focus:text-white w-48 truncate"
            placeholder="App Name"
          />
        </div>
        <div className="flex items-center gap-2">
          {screens.length > 0 && (
            <div className="text-xs text-white/40 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar (icon sidebar) */}
        <nav className="w-14 border-r border-white/[0.06] flex flex-col items-center py-2 gap-1 flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (sidebarCollapsed) setSidebarCollapsed(false);
              }}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                activeTab === tab.id
                  ? "bg-indigo-500/20 text-indigo-400"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
              }`}
              title={tab.label}
            >
              {tab.icon}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-indigo-500 text-[10px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
              {/* Tooltip */}
              <span className="absolute left-12 px-2 py-1 rounded bg-white/10 backdrop-blur-sm text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {tab.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Side Panel */}
        <AnimatePresence mode="wait">
          {!sidebarCollapsed && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 360, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-white/[0.06] flex flex-col overflow-hidden flex-shrink-0"
            >
              {/* Panel Header */}
              <div className="h-10 border-b border-white/[0.06] flex items-center justify-between px-4 flex-shrink-0">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  {TABS.find(t => t.id === activeTab)?.label}
                </span>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-y-auto">
                {renderPanel()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle when sidebar is hidden */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-14 top-16 z-10 w-6 h-12 bg-white/[0.04] border border-white/[0.06] rounded-r-lg flex items-center justify-center text-white/40 hover:text-white/60 transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        )}

        {/* Center: Phone Preview */}
        <div className="flex-1 flex items-center justify-center p-8 relative">
          {screens.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              {/* Screen selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentScreen(Math.max(0, currentScreen - 1))}
                  disabled={currentScreen === 0}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-white/60 min-w-[120px] text-center">
                  {screens[currentScreen]?.name || "Screen"} ({currentScreen + 1}/{screens.length})
                </span>
                <button
                  onClick={() => setCurrentScreen(Math.min(screens.length - 1, currentScreen + 1))}
                  disabled={currentScreen >= screens.length - 1}
                  className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white disabled:opacity-20 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Phone frame */}
              <div className="relative">
                <div className="w-[375px] h-[812px] rounded-[3rem] border-[3px] border-white/[0.08] bg-[#0a0a0f] overflow-hidden shadow-2xl shadow-black/50">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-10" />
                  {/* Screen content */}
                  <iframe
                    srcDoc={screens[currentScreen]?.html || ""}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin"
                    title={screens[currentScreen]?.name || "Preview"}
                  />
                </div>
                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-white/20 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="text-center">
              {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
                  </div>
                  <div>
                    <p className="text-white/80 font-medium">{generationMessage || "Building your app..."}</p>
                    <div className="mt-3 w-64 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-white/40 text-sm mt-2">{Math.round(generationProgress)}%</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <Smartphone className="w-10 h-10 text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm">Describe your app in the chat to start building</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Always-visible chat input */}
      <div className="border-t border-white/[0.06] px-4 py-3 flex-shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                screens.length === 0
                  ? "Describe your app idea..."
                  : "Ask AI to update your app..."
              }
              disabled={isGenerating}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!chatInput.trim() || isGenerating}
            className="w-11 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/[0.06] disabled:text-white/20 flex items-center justify-center transition-all"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
