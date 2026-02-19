"use client";

import { motion } from "framer-motion";
import { Zap, Shield, Clock, Sparkles } from "lucide-react";

export function SocialProof() {
  const stats = [
    { icon: <Zap className="w-5 h-5 text-yellow-400" />, value: "2 min", label: "Average build time" },
    { icon: <Shield className="w-5 h-5 text-green-400" />, value: "100%", label: "Client-side privacy" },
    { icon: <Clock className="w-5 h-5 text-blue-400" />, value: "3", label: "Screens per app" },
    { icon: <Sparkles className="w-5 h-5 text-purple-400" />, value: "GPT-4o", label: "Powered by" },
  ];

  return (
    <section className="py-16 px-6 border-t border-b border-border/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-center mb-2">{stat.icon}</div>
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-muted">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}