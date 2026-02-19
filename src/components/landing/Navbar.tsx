"use client";

import { motion } from "framer-motion";
import { Code2, ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.nav 
      className="fixed top-0 w-full z-50 navbar-glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.div 
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AppForge</span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-muted hover:text-white transition-colors text-sm">Features</Link>
            <Link href="/pricing" className="text-muted hover:text-white transition-colors text-sm">Pricing</Link>
            <Link href="/#examples" className="text-muted hover:text-white transition-colors text-sm">Examples</Link>
            <Link href="/blog" className="text-muted hover:text-white transition-colors text-sm">Blog</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">
                Start Building — Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 space-y-3"
          >
            <Link href="/#features" className="block text-muted hover:text-white py-2" onClick={() => setMobileOpen(false)}>Features</Link>
            <Link href="/pricing" className="block text-muted hover:text-white py-2" onClick={() => setMobileOpen(false)}>Pricing</Link>
            <Link href="/#examples" className="block text-muted hover:text-white py-2" onClick={() => setMobileOpen(false)}>Examples</Link>
            <Link href="/blog" className="block text-muted hover:text-white py-2" onClick={() => setMobileOpen(false)}>Blog</Link>
            <div className="flex gap-3 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="secondary" size="sm" className="w-full">Log In</Button>
              </Link>
              <Link href="/signup" className="flex-1">
                <Button size="sm" className="w-full">Sign Up</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
