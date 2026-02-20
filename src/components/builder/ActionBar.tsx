"use client";

import { useState } from "react";
import { QrCode, Download, Rocket, Share2, Copy, X, FileArchive, Globe, Smartphone, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { exportAsZip, exportAsPWA } from "@/lib/export";
import { useBuilderStore } from "@/stores/builder-store";

interface ActionBarProps {
  screensCount: number;
  appId: string;
  appName: string;
}

export function ActionBar({ screensCount, appId, appName }: ActionBarProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [liveUrl, setLiveUrl] = useState<string | null>(null);
  const { screens, appDescription, lastJobId } = useBuilderStore();
  
  const previewUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/builder/demo` 
    : '';

  const handleDownloadZip = async () => {
    if (screens.length === 0) return;
    setIsExporting(true);
    try {
      await exportAsZip(appName, screens, appDescription);
      toast.success('ZIP downloaded! Open index.html to preview.');
    } catch (err) {
      toast.error('Failed to export');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPWA = async () => {
    if (screens.length === 0) return;
    setIsExporting(true);
    try {
      await exportAsPWA(appName, screens, appDescription);
      toast.success('PWA package downloaded! Deploy to any static host.');
    } catch (err) {
      toast.error('Failed to export');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeployLive = async () => {
    if (!lastJobId) {
      toast.error('Generate an app first');
      return;
    }
    setIsDeploying(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiBase}/api/deploy-preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: lastJobId }),
      });
      const data = await res.json();
      if (data.success) {
        setLiveUrl(data.url);
        toast.success('🚀 App deployed live!');
      } else {
        toast.error(data.message || 'Deploy failed');
      }
    } catch (err) {
      toast.error('Deploy failed');
      console.error(err);
    } finally {
      setIsDeploying(false);
    }
  };

  const handlePublish = () => {
    toast.info('Play Store publishing coming soon! Download ZIP or PWA for now.');
  };

  const handleSharePreview = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      toast.success('Preview link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-3 p-4 border-t border-border/50">
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={screensCount === 0}
          onClick={() => setShowQRModal(true)}
        >
          <QrCode className="w-4 h-4 mr-2" />
          QR Code
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={screensCount === 0}
          onClick={handleSharePreview}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={screensCount === 0}
          onClick={() => setShowDownloadModal(true)}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button 
          size="sm" 
          disabled={screensCount === 0 || isDeploying}
          onClick={handleDeployLive}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
        >
          {isDeploying ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Rocket className="w-4 h-4 mr-2" />
          )}
          {isDeploying ? 'Getting link...' : liveUrl ? 'Share Again' : 'Share Live'}
        </Button>
        {liveUrl && (
          <a href={liveUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </Button>
          </a>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setShowQRModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass p-8 text-center max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Share Your App</h3>
                <button onClick={() => setShowQRModal(false)} className="p-1 text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                <QRCodeCanvas value={previewUrl} size={200} level="M" includeMargin />
              </div>
              
              <p className="text-white/80 text-sm mb-4">
                Scan to preview on any device
              </p>
              
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3">
                <span className="text-white/80 text-xs flex-1 break-all truncate">{previewUrl}</span>
                <button onClick={handleSharePreview} className="p-1 text-white/60 hover:text-white">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Download/Export Modal */}
      {showDownloadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setShowDownloadModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass p-8 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Export App</h3>
                <button onClick={() => setShowDownloadModal(false)} className="p-1 text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* ZIP Download */}
                <button
                  onClick={handleDownloadZip}
                  disabled={isExporting}
                  className="w-full glass rounded-2xl p-5 text-left hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileArchive className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Download ZIP</h4>
                      <p className="text-sm text-white/60">HTML + CSS + JS bundle. Open index.html to preview.</p>
                    </div>
                  </div>
                </button>

                {/* PWA Download */}
                <button
                  onClick={handleDownloadPWA}
                  disabled={isExporting}
                  className="w-full glass rounded-2xl p-5 text-left hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">Download PWA</h4>
                      <p className="text-sm text-white/60">Progressive Web App with offline support. Deploy anywhere.</p>
                    </div>
                  </div>
                </button>

                {/* React Native Export */}
                <button
                  onClick={async () => {
                    if (screens.length === 0) return;
                    setIsExporting(true);
                    try {
                      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                      const res = await fetch(`${apiBase}/api/export/react-native`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          appName: appName || 'MyApp',
                          description: appDescription || '',
                          screens: screens.map((s: any) => ({ name: s.name, type: s.blueprint || 'dashboard', html: s.html })),
                        }),
                      });
                      const data = await res.json();
                      if (data.success && data.files) {
                        // Download as JSON (user runs npm install + eas build)
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${appName || 'app'}-react-native.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('React Native project exported! Run npm install then eas build.');
                      } else {
                        toast.error(data.message || 'Export failed');
                      }
                    } catch (err) {
                      toast.error('Export failed');
                      console.error(err);
                    } finally {
                      setIsExporting(false);
                    }
                  }}
                  disabled={isExporting}
                  className="w-full glass rounded-2xl p-5 text-left hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Smartphone className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">React Native (Expo)</h4>
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">NEW</span>
                      </div>
                      <p className="text-sm text-white/60">Full Expo project. Build APK with EAS or run locally.</p>
                    </div>
                  </div>
                </button>

                {/* Telegram Mini App */}
                <button
                  onClick={async () => {
                    if (!lastJobId) { toast.error('Generate an app first'); return; }
                    setIsExporting(true);
                    try {
                      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                      const res = await fetch(`${apiBase}/api/export/telegram-mini-app`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jobId: lastJobId, appName: appName || 'MyApp' }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        const blob = new Blob([data.files['index.html']], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `${appName || 'app'}-telegram-miniapp.html`; a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Telegram Mini App exported! Host it and link to @BotFather.');
                      } else { toast.error(data.message || 'Export failed'); }
                    } catch { toast.error('Export failed'); } finally { setIsExporting(false); }
                  }}
                  disabled={isExporting || !lastJobId}
                  className="w-full glass rounded-2xl p-5 text-left hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-2xl">✈️</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">Telegram Mini App</h4>
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">FREE</span>
                      </div>
                      <p className="text-sm text-white/60">Launch inside Telegram. Instant, no install needed.</p>
                    </div>
                  </div>
                </button>

                {/* Capacitor APK */}
                <button
                  onClick={async () => {
                    if (!lastJobId) { toast.error('Generate an app first'); return; }
                    setIsExporting(true);
                    try {
                      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                      const res = await fetch(`${apiBase}/api/export/capacitor`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jobId: lastJobId, appName: appName || 'MyApp' }),
                      });
                      const data = await res.json();
                      if (data.success) {
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `${appName || 'app'}-capacitor.json`; a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Capacitor project exported! Run npm install then npm run apk.');
                      } else { toast.error(data.message || 'Export failed'); }
                    } catch { toast.error('Export failed'); } finally { setIsExporting(false); }
                  }}
                  disabled={isExporting || !lastJobId}
                  className="w-full glass rounded-2xl p-5 text-left hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Smartphone className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">Native APK (Capacitor)</h4>
                        <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">FREE</span>
                      </div>
                      <p className="text-sm text-white/60">Full native Android APK. 5 min build with Capacitor.</p>
                    </div>
                  </div>
                </button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
