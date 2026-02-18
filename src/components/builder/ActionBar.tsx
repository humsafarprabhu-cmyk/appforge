"use client";

import { QrCode, Download, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  screensCount: number;
  onQRCode: () => void;
  onDownload: () => void;
  onPublish: () => void;
}

export function ActionBar({ screensCount, onQRCode, onDownload, onPublish }: ActionBarProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <Button 
        variant="secondary" 
        size="sm" 
        disabled={screensCount === 0}
        onClick={onQRCode}
      >
        <QrCode className="w-4 h-4 mr-2" />
        QR Code
      </Button>
      <Button 
        variant="secondary" 
        size="sm" 
        disabled={screensCount === 0}
        onClick={onDownload}
      >
        <Download className="w-4 h-4 mr-2" />
        Download APK
      </Button>
      <Button 
        size="sm" 
        disabled={screensCount === 0}
        onClick={onPublish}
      >
        <Rocket className="w-4 h-4 mr-2" />
        Publish
      </Button>
    </div>
  );
}