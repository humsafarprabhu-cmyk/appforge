"use client";

import { motion } from "framer-motion";
import { Code2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 navbar-glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">AppForge</span>
          </motion.div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-muted hover:text-white transition-colors">Features</Link>
            <Link href="#pricing" className="text-muted hover:text-white transition-colors">Pricing</Link>
            <Link href="#examples" className="text-muted hover:text-white transition-colors">Examples</Link>
          </div>

          <Link href="/dashboard">
            <Button size="md">
              Start Building — Free
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}