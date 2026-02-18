"use client";

import { motion } from "framer-motion";

export function SocialProof() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <p className="text-muted mb-8">Trusted by 1,000+ makers worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
            <div className="text-xl font-semibold">ProductHunt</div>
            <div className="text-xl font-semibold">HackerNews</div>
            <div className="text-xl font-semibold">Indie Hackers</div>
            <div className="text-xl font-semibold">Dev.to</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}