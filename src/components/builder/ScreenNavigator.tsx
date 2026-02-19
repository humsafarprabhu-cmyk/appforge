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
      className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 w-full max-w-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-1 bg-surface/80 backdrop-blur-xl rounded-full px-2 py-1.5 border border-border/50">
        {screens.map((screen, index) => (
          <button
            key={index}
            onClick={() => onScreenChange(index)}
            className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              index === currentScreen 
                ? 'text-white' 
                : 'text-white/50 hover:text-white/80'
            }`}
          >
            {index === currentScreen && (
              <motion.div
                layoutId="activeScreen"
                className="absolute inset-0 bg-primary/30 border border-primary/50 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10 truncate max-w-[80px] block">
              {screen.name}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
