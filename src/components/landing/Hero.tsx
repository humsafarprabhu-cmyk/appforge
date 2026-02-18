"use client";

import { motion } from "framer-motion";
import { Play, Sparkles, Smartphone, Star, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-animated opacity-10" />
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-70 float" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl opacity-70 float-delayed" />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div 
          className="text-center mb-16"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            variants={fadeInUp}
          >
            <span className="gradient-text">Describe your app.</span><br />
            <span className="text-white">It's on your phone in</span><br />
            <span className="gradient-text">2 minutes.</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted max-w-3xl mx-auto mb-8"
            variants={fadeInUp}
          >
            Build stunning mobile apps with AI. No code, no complex tools, no months of development. 
            Just describe what you want, and watch your app come to life.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <Link href="/dashboard">
              <Button size="xl" className="w-full sm:w-auto">
                <Sparkles className="mr-2 w-5 h-5" />
                Start Building — Free
              </Button>
            </Link>
            <Button variant="secondary" size="xl" className="w-full sm:w-auto">
              <Play className="mr-2 w-5 h-5" />
              See Examples
            </Button>
          </motion.div>
        </motion.div>

        {/* Floating Phone Mockups */}
        <motion.div 
          className="relative max-w-4xl mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <motion.div className="phone-frame w-64 h-[500px] mx-auto float" whileHover={{ scale: 1.05, rotateY: 5 }}>
              <div className="phone-screen w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white text-sm">Fitness Tracker</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="phone-frame w-64 h-[500px] mx-auto float-delayed scale-110" whileHover={{ scale: 1.15, rotateY: -5 }}>
              <div className="phone-screen w-full h-full bg-gradient-to-b from-blue-900 to-purple-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white text-sm">Recipe App</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="phone-frame w-64 h-[500px] mx-auto float" whileHover={{ scale: 1.05, rotateY: -5 }}>
              <div className="phone-screen w-full h-full bg-gradient-to-b from-green-900 to-teal-800 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white text-sm">Todo List</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}