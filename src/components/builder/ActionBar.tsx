"use client";

import { useState } from "react";
import { QrCode, Download, Rocket, Share2, Copy, X } from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface ActionBarProps {
  screensCount: number;
  appId: string;
  appName: string;
}

export function ActionBar({ screensCount, appId, appName }: ActionBarProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  
  const previewUrl = `${window.location.origin}/preview/${appId}`;

  const handleQRCode = () => {
    setShowQRModal(true);
  };

  const handleDownload = () => {
    setShowDownloadModal(true);
  };

  const handlePublish = () => {
    toast.info('Publish feature coming soon! We\'re working on Play Store publishing.');
  };

  const handleSharePreview = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      toast.success('Preview link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      <div className="flex items-center justify-center gap-3 mt-8">
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={screensCount === 0}
          onClick={handleQRCode}
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
          Share Preview
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          disabled={screensCount === 0}
          onClick={handleDownload}
        >
          <Download className="w-4 h-4 mr-2" />
          Download APK
        </Button>
        <Button 
          size="sm" 
          disabled={screensCount === 0}
          onClick={handlePublish}
        >
          <Rocket className="w-4 h-4 mr-2" />
          Publish
        </Button>
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setShowQRModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass p-8 text-center max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Share Your App</h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-1 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                <QRCodeCanvas 
                  value={previewUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              
              <p className="text-white/80 text-sm mb-4">
                Scan this QR code to open your app preview on any device
              </p>
              
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-3 mb-4">
                <span className="text-white/80 text-xs flex-1 break-all">{previewUrl}</span>
                <button
                  onClick={handleSharePreview}
                  className="p-1 text-white/60 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setShowDownloadModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="glass p-8 text-center max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Download APK</h3>
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="p-1 text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-6xl mb-4">📱</div>
              
              <h4 className="text-lg font-medium text-white mb-2">APK builds coming soon!</h4>
              <p className="text-white/80 text-sm mb-6">
                We're working on converting your app to a native Android APK. For now, you can preview your app in the browser and share it using the QR code.
              </p>
              
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDownloadModal(false);
                    setShowQRModal(true);
                  }}
                  className="flex-1"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Share QR Code
                </Button>
                <Button
                  onClick={() => setShowDownloadModal(false)}
                  className="flex-1"
                >
                  Got it
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}