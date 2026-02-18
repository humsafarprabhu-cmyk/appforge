"use client";

import { Code2, Twitter, Github, MessageSquare, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AppForge</span>
            </div>
            <p className="text-muted max-w-md mb-6">
              The fastest way to build mobile apps with AI. From idea to app store in minutes, not months.
            </p>
            <div className="flex space-x-4">
              <Link href="https://twitter.com/appforgeai" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://github.com/appforge-ai" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-500/20 hover:text-gray-400 transition-colors">
                  <Github className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="https://discord.gg/appforge" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-indigo-500/20 hover:text-indigo-400 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <div className="space-y-2">
              <Link href="/" className="block text-muted hover:text-white transition-colors">Home</Link>
              <Link href="/pricing" className="block text-muted hover:text-white transition-colors">Pricing</Link>
              <Link href="/dashboard" className="block text-muted hover:text-white transition-colors">Dashboard</Link>
              <Link href="/login" className="block text-muted hover:text-white transition-colors">Login</Link>
              <Link href="/blog" className="block text-muted hover:text-white transition-colors">Blog</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <div className="space-y-2">
              <Link href="/terms" className="block text-muted hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="block text-muted hover:text-white transition-colors">Privacy</Link>
              <Link href="mailto:support@appforge.ai" className="block text-muted hover:text-white transition-colors">Contact</Link>
              <Link href="/blog" className="block text-muted hover:text-white transition-colors">Resources</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-muted text-sm">
                © 2026 AppForge. All rights reserved.
              </p>
              <div className="flex items-center text-muted text-sm">
                <span>Built with</span>
                <Heart className="w-4 h-4 mx-1 text-red-500 fill-red-500" />
                <span>by AppForge team</span>
              </div>
            </div>
            
            <div className="flex space-x-6 text-sm text-muted">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="mailto:support@appforge.ai" className="hover:text-white transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}