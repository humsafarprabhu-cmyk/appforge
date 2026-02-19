"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Sparkles, Smartphone, Maximize2, X,
  Download, Share2, QrCode, RotateCcw, Edit2, Save, Check,
  ChevronLeft, ChevronRight, Loader2, Copy, Globe, FileArchive,
  Smartphone as SmartphoneIcon
} from "lucide-react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { exportAsZip, exportAsPWA } from "@/lib/export";
import { useBuilderStore } from "@/stores/builder-store";
import type { ChatMessage } from "@/types/app";

interface Screen {
  name: string;
  html: string;
  isActive?: boolean;
}

interface BuilderEditorProps {
  appId: string;
  appName: string;
  screens: Screen[];
  currentScreen: number;
  messages: ChatMessage[];
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;
  lastError: string | null;
  chatInputValue: string;
  onAppNameChange: (name: string) => void;
  onScreenChange: (index: number) => void;
  onChatInputChange: (value: string) => void;
  onSendMessage: () => void;
  onRetry: () => void;
}

// ─── Suggestion chips ───
const SUGGESTIONS = [
  "🏋️ Fitness tracker with workout logging",
  "🍕 Food delivery app with cart",
  "📝 Note-taking app with folders",
  "🎵 Music player with playlists",
  "💰 Budget tracker with charts",
  "🛒 E-commerce store with products",
];

export function BuilderEditor({
  appId,
  appName,
  screens,
  currentScreen,
  messages,
  isGenerating,
  generationProgress,
  generationMessage,
  lastError,
  chatInputValue,
  onAppNameChange,
  onScreenChange,
  onChatInputChange,
  onSendMessage,
  onRetry,
}: BuilderEditorProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(appName);
  const [isExporting, setIsExporting] = useState(false);
  const { appDescription } = useBuilderStore();

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Auto-focus input
  useEffect(() => {
    if (!isGenerating) inputRef.current?.focus();
  }, [isGenerating]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleSaveName = () => {
    onAppNameChange(tempName);
    setEditingName(false);
  };

  const handleExportZip = async () => {
    if (screens.length === 0) return;
    setIsExporting(true);
    try {
      await exportAsZip(appName, screens, appDescription);
      toast.success("ZIP downloaded!");
    } catch { toast.error("Export failed"); }
    finally { setIsExporting(false); }
  };

  const handleExportPWA = async () => {
    if (screens.length === 0) return;
    setIsExporting(true);
    try {
      await exportAsPWA(appName, screens, appDescription);
      toast.success("PWA downloaded!");
    } catch { toast.error("Export failed"); }
    finally { setIsExporting(false); }
  };

  const previewUrl = typeof window !== "undefined" ? `${window.location.origin}/builder/${appId}` : "";
  const hasScreens = screens.length > 0;

  return (
    <div className="h-screen flex flex-col bg-[#09090b] overflow-hidden">

      {/* ═══ TOP BAR ═══ */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-xl z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="w-px h-5 bg-white/10" />
          
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
                onBlur={handleSaveName}
                autoFocus
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-indigo-500 w-48"
              />
              <button onClick={handleSaveName} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4" /></button>
            </div>
          ) : (
            <button
              onClick={() => { setEditingName(true); setTempName(appName); }}
              className="flex items-center gap-1.5 group"
            >
              <span className="text-sm font-semibold text-white">{appName}</span>
              <Edit2 className="w-3 h-3 text-white/30 group-hover:text-white/60 transition-colors" />
            </button>
          )}

          {hasScreens && (
            <span className="text-[10px] font-medium text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
              {screens.length} screens
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {hasScreens && (
            <>
              <ToolbarButton icon={<QrCode className="w-4 h-4" />} label="QR" onClick={() => setShowQR(true)} />
              <ToolbarButton icon={<Share2 className="w-4 h-4" />} label="Share" onClick={async () => {
                await navigator.clipboard.writeText(previewUrl);
                toast.success("Link copied!");
              }} />
              <ToolbarButton icon={<Download className="w-4 h-4" />} label="Export" onClick={() => setShowExport(true)} />
            </>
          )}
        </div>
      </header>

      {/* ═══ MAIN CONTENT: LEFT CHAT + RIGHT PREVIEW ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ─── LEFT: CHAT PANEL ─── */}
        <div className="w-[420px] min-w-[360px] max-w-[480px] flex flex-col border-r border-white/[0.06] bg-[#0c0c0e]">

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-4 scrollbar-thin">

            {/* Empty state */}
            {messages.length === 0 && !isGenerating && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-5">
                  <Sparkles className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Describe your app</h3>
                <p className="text-white/40 text-sm mb-8 max-w-xs leading-relaxed">
                  Tell me what you want to build and I'll generate a complete mobile app with 5 screens.
                </p>
                <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => onChatInputChange(s)}
                      className="text-left px-4 py-2.5 bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] rounded-xl text-sm text-white/60 hover:text-white/80 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Generation progress */}
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-indigo-500/[0.08] border border-indigo-500/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  <span className="text-sm text-indigo-300">{generationMessage || "Building your app..."}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${generationProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="text-[11px] text-white/30 mt-2">{Math.round(generationProgress)}%</div>
              </motion.div>
            )}

            {/* Error */}
            {lastError && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/[0.08] border border-red-500/20 rounded-2xl p-4"
              >
                <p className="text-sm text-red-300 mb-3">{lastError}</p>
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retry
                </button>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-white/[0.06]">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={chatInputValue}
                onChange={e => onChatInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isGenerating}
                placeholder={isGenerating ? "Generating..." : "Describe your app or request changes..."}
                rows={2}
                className="w-full bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.12] focus:border-indigo-500/50 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-40"
              />
              <button
                onClick={onSendMessage}
                disabled={!chatInputValue.trim() || isGenerating}
                className="absolute right-2 bottom-2.5 p-2 bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/5 disabled:text-white/20 text-white rounded-lg transition-all disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2 text-[11px] text-white/20 px-1">
              <span>Enter to send · Shift+Enter new line</span>
              <span>{chatInputValue.length}/1000</span>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: PREVIEW PANEL ─── */}
        <div className="flex-1 flex flex-col bg-[#09090b] overflow-hidden">

          {/* Screen tabs */}
          {hasScreens && (
            <div className="flex items-center gap-1 px-6 pt-4 pb-2 overflow-x-auto scrollbar-none">
              {screens.map((screen, i) => (
                <button
                  key={i}
                  onClick={() => onScreenChange(i)}
                  className={`relative px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    i === currentScreen
                      ? "bg-white/[0.08] text-white"
                      : "text-white/35 hover:text-white/60 hover:bg-white/[0.03]"
                  }`}
                >
                  {i === currentScreen && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/[0.08] rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{screen.name}</span>
                </button>
              ))}
              
              {/* Prev/Next arrows for many screens */}
              {screens.length > 1 && (
                <div className="flex items-center gap-1 ml-auto pl-2">
                  <button
                    onClick={() => onScreenChange(Math.max(0, currentScreen - 1))}
                    disabled={currentScreen === 0}
                    className="p-1.5 text-white/20 hover:text-white/60 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onScreenChange(Math.min(screens.length - 1, currentScreen + 1))}
                    disabled={currentScreen === screens.length - 1}
                    className="p-1.5 text-white/20 hover:text-white/60 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Phone preview */}
          <div className="flex-1 flex items-center justify-center p-6 relative">
            {hasScreens ? (
              <div className="relative">
                {/* Phone frame */}
                <motion.div
                  className="relative"
                  style={{ width: 320, height: 693, maxHeight: 'calc(100vh - 200px)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Outer glow */}
                  <div className="absolute -inset-4 bg-indigo-500/5 rounded-[48px] blur-xl" />
                  
                  {/* Frame */}
                  <div className="relative w-full h-full rounded-[40px] bg-[#1a1a1e] p-[8px] shadow-2xl shadow-black/50 ring-1 ring-white/[0.08]"
                  >
                    {/* Dynamic Island */}
                    <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-10" />
                    
                    {/* Screen */}
                    <div className="w-full h-full rounded-[32px] overflow-hidden bg-[#0a0a0f] relative">
                      <AnimatePresence mode="wait">
                        <motion.iframe
                          key={currentScreen}
                          srcDoc={screens[currentScreen]?.html || ""}
                          className="w-full h-full border-none"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          sandbox="allow-same-origin allow-scripts"
                          style={{ backgroundColor: "#0a0a0f", colorScheme: "dark" }}
                        />
                      </AnimatePresence>

                      {/* Generating overlay */}
                      {isGenerating && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                        >
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
                            <p className="text-white/60 text-sm">Generating...</p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full" />
                  </div>
                </motion.div>

                {/* Fullscreen button */}
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="absolute -right-12 top-4 p-2 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-lg transition-all"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Empty preview state */
              <div className="text-center max-w-sm">
                <div className="w-24 h-24 bg-white/[0.02] border border-white/[0.06] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Smartphone className="w-12 h-12 text-white/10" />
                </div>
                <h3 className="text-lg font-medium text-white/40 mb-2">No preview yet</h3>
                <p className="text-sm text-white/20 leading-relaxed">
                  Describe what you want to build in the chat panel and your app preview will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ MODALS ═══ */}

      {/* Fullscreen Preview */}
      <AnimatePresence>
        {isFullscreen && hasScreens && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-8"
            onClick={() => setIsFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-[400px] aspect-[9/19.5] bg-[#1a1a1e] rounded-[44px] p-[10px] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute -top-12 right-0 p-2 text-white/50 hover:text-white bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-full h-full rounded-[34px] overflow-hidden">
                <iframe
                  srcDoc={screens[currentScreen]?.html || ""}
                  className="w-full h-full border-none"
                  sandbox="allow-same-origin allow-scripts"
                  style={{ backgroundColor: "#0a0a0f" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <ModalOverlay onClose={() => setShowExport(false)}>
            <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Export App</h3>
                <button onClick={() => setShowExport(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <ExportOption
                  icon={<FileArchive className="w-5 h-5 text-blue-400" />}
                  title="Download ZIP"
                  desc="HTML bundle — open index.html"
                  onClick={handleExportZip}
                  disabled={isExporting}
                  color="blue"
                />
                <ExportOption
                  icon={<Globe className="w-5 h-5 text-green-400" />}
                  title="Download PWA"
                  desc="Offline-ready — deploy anywhere"
                  onClick={handleExportPWA}
                  disabled={isExporting}
                  color="green"
                />
                <div className="opacity-40 cursor-not-allowed">
                  <ExportOption
                    icon={<SmartphoneIcon className="w-5 h-5 text-purple-400" />}
                    title="Android APK"
                    desc="Coming soon"
                    onClick={() => {}}
                    disabled
                    color="purple"
                  />
                </div>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <ModalOverlay onClose={() => setShowQR(false)}>
            <div className="bg-[#141416] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm text-center">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Share Preview</h3>
                <button onClick={() => setShowQR(false)} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="bg-white p-4 rounded-xl inline-block mb-4">
                <QRCodeCanvas value={previewUrl} size={180} level="M" />
              </div>
              <p className="text-white/40 text-sm mb-4">Scan to preview on any device</p>
              <button
                onClick={async () => { await navigator.clipboard.writeText(previewUrl); toast.success("Copied!"); }}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Copy link
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sub-components ───

function ToolbarButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 text-white/40 hover:text-white/80 hover:bg-white/[0.05] rounded-lg text-xs font-medium transition-all"
    >
      {icon} <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "system") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <span className="text-[11px] text-white/25 bg-white/[0.03] px-3 py-1 rounded-full">
          {message.content}
        </span>
      </motion.div>
    );
  }

  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${
        isUser
          ? "bg-indigo-500 rounded-2xl rounded-br-md px-4 py-2.5"
          : "bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-md px-4 py-3"
      }`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>
            <span className="text-[11px] text-white/30 font-medium">AppForge AI</span>
          </div>
        )}
        <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "text-white" : "text-white/70"}`}>
          {message.content}
        </p>
        {message.model && (
          <div className="flex items-center gap-2 mt-2 text-[10px] text-white/20">
            <span>{message.model}</span>
            {message.tokens_used && <span>· {message.tokens_used} tokens</span>}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function ExportOption({ icon, title, desc, onClick, disabled, color }: {
  icon: React.ReactNode; title: string; desc: string;
  onClick: () => void; disabled?: boolean; color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.1] rounded-xl transition-all text-left disabled:cursor-not-allowed`}
    >
      <div className={`w-10 h-10 bg-${color}-500/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-medium text-white">{title}</h4>
        <p className="text-xs text-white/35">{desc}</p>
      </div>
    </button>
  );
}
