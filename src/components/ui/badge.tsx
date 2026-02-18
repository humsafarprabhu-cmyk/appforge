"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface BadgeProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">>, HTMLMotionProps<"div"> {
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
  children: React.ReactNode;
}

const badgeVariants = {
  default: "bg-surface text-muted border-border",
  primary: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg glow-primary",
  secondary: "bg-gradient-to-r from-secondary to-primary text-white shadow-lg",
  success: "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg",
  warning: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg",
  danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg",
  outline: "bg-transparent border-2 border-border text-muted hover:border-primary hover:text-primary",
};

const sizeVariants = {
  sm: "px-2 py-0.5 text-xs rounded-lg",
  md: "px-3 py-1 text-sm rounded-xl",
  lg: "px-4 py-2 text-base rounded-xl",
};

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", pulse = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium border transition-all duration-300",
          badgeVariants[variant],
          sizeVariants[size],
          pulse && "animate-pulse",
          className
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{
          duration: 0.2,
          ease: "easeOut"
        }}
        {...props}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {children}
        </motion.span>

        {/* Pulsing effect for important badges */}
        {pulse && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-75"
            style={{
              background: variant === "primary" 
                ? "linear-gradient(90deg, #6366f1, #8b5cf6)" 
                : "currentColor"
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.75, 0.5, 0.75],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    );
  }
);

Badge.displayName = "Badge";