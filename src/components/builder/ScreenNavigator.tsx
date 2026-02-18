"use client";

import { motion } from "framer-motion";

interface Screen {
  name: string;
  html: string;
}

interface ScreenNavigatorProps {
  screens: Screen[];
  currentScreen: number;
  onScreenChange: (index: number) => void;
}

export function ScreenNavigator({ screens, currentScreen, onScreenChange }: ScreenNavigatorProps) {
  if (screens.length <= 1) return null;

  return (
    <motion.div
      className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 bg-surface/80 backdrop-blur-sm rounded-full px-4 py-2">
        {screens.map((screen, index) => (
          <button
            key={index}
            onClick={() => onScreenChange(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentScreen 
                ? 'bg-primary scale-125' 
                : 'bg-white/30 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
      <div className="text-center mt-2 text-xs text-muted">
        {screens[currentScreen]?.name || `Screen ${currentScreen + 1}`}
      </div>
    </motion.div>
  );
}