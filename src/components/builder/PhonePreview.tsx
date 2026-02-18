"use client";

import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";
import { ScreenNavigator } from "./ScreenNavigator";
import { PHONE_FRAMES } from "@/config/constants";

interface Screen {
  name: string;
  html: string;
}

interface PhonePreviewProps {
  screens: Screen[];
  currentScreen: number;
  deviceFrame: string;
  onScreenChange: (index: number) => void;
}

export function PhonePreview({ screens, currentScreen, deviceFrame, onScreenChange }: PhonePreviewProps) {
  const getDeviceFrameConfig = () => {
    return PHONE_FRAMES.find(frame => frame.id === deviceFrame) || PHONE_FRAMES[0];
  };

  const currentFrameConfig = getDeviceFrameConfig();

  return (
    <div className="flex-1 flex items-center justify-center">
      <motion.div
        key={deviceFrame}
        className="relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          width: currentFrameConfig.width + (currentFrameConfig.bezel * 2),
          height: currentFrameConfig.height + (currentFrameConfig.bezel * 2),
          maxHeight: 'calc(100vh - 200px)',
        }}
      >
        {/* Phone Frame */}
        <div className="phone-frame w-full h-full">
          <div className="phone-screen w-full h-full relative overflow-hidden">
            {screens.length > 0 ? (
              <motion.iframe
                key={currentScreen}
                srcDoc={screens[currentScreen]?.html || ''}
                className="w-full h-full border-none"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                sandbox="allow-same-origin allow-scripts"
                style={{ 
                  backgroundColor: '#0a0a0f',
                  colorScheme: 'dark'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <div className="text-center text-white/60">
                  <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Describe your app to see preview</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Screen Navigator */}
        <ScreenNavigator 
          screens={screens}
          currentScreen={currentScreen}
          onScreenChange={onScreenChange}
        />
      </motion.div>
    </div>
  );
}