"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Smartphone, Maximize2, X } from "lucide-react";
import { ScreenNavigator } from "./ScreenNavigator";
import { PHONE_FRAMES } from "@/config/constants";

interface Screen {
  name: string;
  html: string;
  isActive?: boolean;
}

interface PhonePreviewProps {
  screens: Screen[];
  currentScreen: number;
  deviceFrame: string;
  isGenerating?: boolean;
  onScreenChange: (index: number) => void;
}

export function PhonePreview({ screens, currentScreen, deviceFrame, isGenerating, onScreenChange }: PhonePreviewProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const getDeviceFrameConfig = () => {
    return PHONE_FRAMES.find(frame => frame.id === deviceFrame) || PHONE_FRAMES[0];
  };

  const currentFrameConfig = getDeviceFrameConfig();

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Screen Name Display */}
        {screens.length > 0 && (
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-lg font-medium text-white">{screens[currentScreen]?.name}</h3>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Fullscreen Preview"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}

        <motion.div
          key={deviceFrame}
          className="relative phone-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            width: currentFrameConfig.width + (currentFrameConfig.bezel * 2),
            height: currentFrameConfig.height + (currentFrameConfig.bezel * 2),
            maxHeight: 'calc(100vh - 320px)',
            maxWidth: '100%',
            aspectRatio: `${currentFrameConfig.width} / ${currentFrameConfig.height}`,
            transform: 'scale(min(1, (100vw - 120px) / ' + (currentFrameConfig.width + (currentFrameConfig.bezel * 2)) + ', (100vh - 360px) / ' + (currentFrameConfig.height + (currentFrameConfig.bezel * 2)) + '))',
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 20px 40px rgba(99, 102, 241, 0.15))',
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
                  exit={{ opacity: 0, x: -20 }}
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

              {/* Loading Overlay */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-center text-white">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm">Generating...</p>
                  </div>
                </motion.div>
              )}

              {/* Updated badge flash for changed screens */}
              {screens[currentScreen]?.isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg"
                >
                  Updated
                </motion.div>
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

      {/* Fullscreen Modal */}
      {isFullscreen && screens.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setIsFullscreen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-gray-900 rounded-2xl overflow-hidden max-w-md w-full aspect-[9/19] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Fullscreen iframe */}
            <iframe
              srcDoc={screens[currentScreen]?.html || ''}
              className="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts"
              style={{ 
                backgroundColor: '#0a0a0f',
                colorScheme: 'dark'
              }}
            />
          </motion.div>
        </motion.div>
      )}
    </>
  );
}