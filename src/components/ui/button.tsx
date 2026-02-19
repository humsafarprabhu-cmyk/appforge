"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<"button">>, HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  children: React.ReactNode;
}

const buttonVariants = {
  primary: "btn-primary text-white shadow-lg glow-primary",
  secondary: "glass glass-hover text-white border-border",
  ghost: "bg-transparent hover:bg-surface text-muted hover:text-white border-transparent",
  danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg",
  success: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg",
};

const sizeVariants = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-base rounded-xl",
  xl: "px-8 py-4 text-lg rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none",
          "pulse-on-click", // Custom CSS class for click animation
          buttonVariants[variant],
          sizeVariants[size],
          className
        )}
        disabled={disabled || loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1]
        }}
        {...props}
      >
        {loading && (
          <motion.div
            className="mr-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="spinner" />
          </motion.div>
        )}
        
        <motion.span
          className="relative z-10 inline-flex items-center"
          animate={loading ? { opacity: 0.7 } : { opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.span>

        {/* Animated shine effect for primary buttons */}
        {variant === "primary" && !disabled && (
          <motion.div
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "linear",
            }}
          />
        )}
      </motion.button>
    );
  }
);

Button.displayName = "Button";