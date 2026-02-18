"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, keyof HTMLMotionProps<"input">>, HTMLMotionProps<"input"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, containerClassName, label, error, icon, type = "text", ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    
    return (
      <motion.div
        className={cn("relative", containerClassName)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {label && (
          <motion.label
            className={cn(
              "block text-sm font-medium mb-2 transition-colors duration-200",
              error ? "text-red-400" : isFocused ? "text-primary" : "text-muted"
            )}
            animate={{
              color: error ? "#f87171" : isFocused ? "#6366f1" : "#a1a1aa"
            }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">
              {icon}
            </div>
          )}
          
          <motion.input
            type={type}
            className={cn(
              "w-full px-4 py-3 rounded-xl glass text-white placeholder-muted",
              "border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50",
              "hover:border-border/80",
              icon ? "pl-10" : "",
              error 
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" 
                : isFocused 
                  ? "border-primary glow-primary" 
                  : "border-border",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            whileFocus={{
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
            {...props}
          />
          
          {/* Focus ring animation */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0, scale: 1 }}
            animate={{
              opacity: isFocused ? 1 : 0,
              scale: isFocused ? 1.01 : 1,
            }}
            transition={{ duration: 0.2 }}
            style={{
              background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)",
            }}
          />
        </div>
        
        {error && (
          <motion.p
            className="mt-2 text-sm text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

Input.displayName = "Input";