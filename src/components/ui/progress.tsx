"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">>, HTMLMotionProps<"div"> {
  value: number;
  max?: number;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
}

const variantStyles = {
  default: "from-muted to-muted/80",
  primary: "from-primary to-secondary",
  success: "from-green-500 to-emerald-500",
  warning: "from-yellow-500 to-orange-500",
  danger: "from-red-500 to-red-600",
};

const sizeStyles = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({
    className,
    value,
    max = 100,
    variant = "primary",
    size = "md",
    showValue = false,
    animated = true,
    striped = false,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <motion.div className={cn("w-full", className)} {...props} ref={ref}>
        {showValue && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">Progress</span>
            <motion.span 
              className="text-sm font-medium text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              key={percentage}
            >
              {Math.round(percentage)}%
            </motion.span>
          </div>
        )}
        
        <div
          className={cn(
            "w-full rounded-full bg-surface overflow-hidden",
            sizeStyles[size]
          )}
        >
          <motion.div
            className={cn(
              "h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out",
              variantStyles[variant],
              striped && "bg-stripes",
              animated && percentage > 0 && "animate-shimmer"
            )}
            initial={{ width: 0, opacity: 0 }}
            animate={{ 
              width: `${percentage}%`,
              opacity: 1
            }}
            transition={{
              duration: 1,
              ease: [0.4, 0, 0.2, 1],
            }}
            style={{
              backgroundSize: striped ? "20px 20px" : "200% 100%",
            }}
          />
          
          {/* Shimmer effect for active progress */}
          {animated && percentage > 0 && percentage < 100 && (
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ width: "30%" }}
              animate={{
                x: ["-100%", "400%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </div>
        
        {/* Success pulse when complete */}
        {percentage === 100 && animated && (
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/30 to-emerald-500/30"
            initial={{ scale: 1, opacity: 0 }}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: 3,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    );
  }
);

Progress.displayName = "Progress";

// Circular progress variant
export const CircularProgress = forwardRef<HTMLDivElement, Omit<ProgressProps, 'size'> & { size?: number }>(
  ({
    className,
    value,
    max = 100,
    variant = "primary",
    size = 120,
    showValue = true,
    animated = true,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <motion.div
        className={cn("relative flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        ref={ref}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={4}
            fill="none"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: animated ? strokeDashoffset : circumference - (percentage / 100) * circumference }}
            transition={{
              duration: 1.5,
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        
        {showValue && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <span className="text-xl font-bold text-white">
              {Math.round(percentage)}%
            </span>
          </motion.div>
        )}
      </motion.div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";