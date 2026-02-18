"use client";

import { Code2, Twitter, Github, Globe } from "lucide-react";
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
              <Button variant="ghost" size="sm" className="p-2">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Github className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Globe className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <div className="space-y-2">
              <Link href="#" className="block text-muted hover:text-white transition-colors">Features</Link>
              <Link href="#" className="block text-muted hover:text-white transition-colors">Pricing</Link>
              <Link href="#" className="block text-muted hover:text-white transition-colors">Examples</Link>
              <Link href="#" className="block text-muted hover:text-white transition-colors">API</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <div className="space-y-2">
              <Link href="#" className="block text-muted hover:text-white transition-colors">About</Link>
              <Link href="#" className="block text-muted hover:text-white transition-colors">Blog</Link>
              <Link href="#" className="block text-muted hover:text-white transition-colors">Careers</Link>
              <Link href="#" className="block text-muted hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted text-sm">
            © 2024 AppForge. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-muted mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}