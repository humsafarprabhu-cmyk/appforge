"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20" gradient>
            <CardContent className="py-16 px-8">
              <h2 className="text-4xl font-bold mb-6">
                <span className="gradient-text">Ready to build your first app?</span>
              </h2>
              <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
                Join thousands of makers who are already building amazing apps with AI. 
                Start for free, no credit card required.
              </p>
              <Link href="/try">
                <Button size="xl" className="mr-4">
                  <Sparkles className="mr-2 w-5 h-5" />
                  Start Building Now
                </Button>
              </Link>
              <Button variant="ghost" size="xl">
                Talk to Sales
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}