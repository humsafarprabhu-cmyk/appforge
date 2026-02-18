"use client";

import { HTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, keyof HTMLMotionProps<"div">>, HTMLMotionProps<"div"> {
  hover?: boolean;
  glow?: boolean;
  gradient?: boolean;
  children: React.ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, glow = false, gradient = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative rounded-2xl p-6",
          gradient 
            ? "bg-gradient-to-br from-surface to-surface/50" 
            : "glass",
          hover && "glass-hover cursor-pointer",
          glow && "glow-primary",
          className
        )}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={hover ? { 
          y: -4, 
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        } : undefined}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }}
        {...props}
      >
        {gradient && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent opacity-50" />
        )}
        
        <div className="relative z-10">
          {children}
        </div>

        {/* Subtle animated border for hover effect */}
        {hover && (
          <motion.div
            className="absolute inset-0 rounded-2xl opacity-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)",
              filter: "blur(1px)",
            }}
            whileHover={{ 
              opacity: 0.5,
              transition: { duration: 0.3 }
            }}
          />
        )}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

// Additional Card sub-components for better composition
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mb-4", className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-xl font-semibold text-white mb-2", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-muted", className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("mt-4 pt-4 border-t border-border/50", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";