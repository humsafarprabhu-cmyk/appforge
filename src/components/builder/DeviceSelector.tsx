"use client";

import { Smartphone, Monitor, Tablet, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PHONE_FRAMES } from "@/config/constants";

interface DeviceSelectorProps {
  deviceFrame: string;
  theme: string;
  onDeviceChange: (device: string) => void;
  onThemeChange: (theme: string) => void;
}

export function DeviceSelector({ deviceFrame, theme, onDeviceChange, onThemeChange }: DeviceSelectorProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {PHONE_FRAMES.map((frame) => (
          <Button
            key={frame.id}
            variant={deviceFrame === frame.id ? "primary" : "ghost"}
            size="sm"
            onClick={() => onDeviceChange(frame.id)}
          >
            {frame.id === 'iphone15' && <Smartphone className="w-4 h-4 mr-1" />}
            {frame.id === 'pixel8' && <Monitor className="w-4 h-4 mr-1" />}
            {frame.id === 'samsung' && <Tablet className="w-4 h-4 mr-1" />}
            <span className="hidden md:inline">{frame.name}</span>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={theme === 'light' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onThemeChange('light')}
        >
          <Sun className="w-4 h-4" />
        </Button>
        <Button
          variant={theme === 'dark' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onThemeChange('dark')}
        >
          <Moon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}