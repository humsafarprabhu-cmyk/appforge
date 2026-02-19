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
            <Link href="/try">
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

        {/* Interactive Demo Animation */}
        <motion.div 
          className="relative max-w-6xl mx-auto"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Chat Interface Animation */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground ml-2">AppForge Builder</span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <motion.div 
                    className="bg-muted/50 rounded-lg p-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                  >
                    <div className="text-sm text-muted-foreground mb-1">You:</div>
                    <div className="text-sm">I want to build a fitness tracking app with workout logging</div>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-primary/10 border-l-4 border-primary rounded-lg p-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.2, duration: 0.6 }}
                  >
                    <div className="text-sm text-primary mb-1">AppForge AI:</div>
                    <div className="text-sm">Perfect! I'll create a fitness app with:</div>
                    <motion.ul 
                      className="text-xs mt-2 space-y-1 text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.8, duration: 0.8 }}
                    >
                      {['• Workout logging interface', '• Progress tracking charts', '• User profile system', '• Modern dark theme design'].map((item, i) => (
                        <motion.li 
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2.8 + i * 0.2, duration: 0.4 }}
                        >
                          {item}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </motion.div>
                </div>
                
                <motion.div 
                  className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3.8, duration: 0.5 }}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">App generated successfully!</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Phone Preview with Progressive Content */}
            <motion.div 
              className="relative flex justify-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <div className="phone-frame w-80 h-[640px] relative overflow-hidden">
                {/* Phone Screen Background */}
                <motion.div 
                  className="phone-screen w-full h-full bg-gradient-to-b from-slate-900 to-slate-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  {/* Status Bar */}
                  <motion.div 
                    className="flex justify-between items-center p-3 text-white text-xs"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.5 }}
                  >
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                      <div className="w-6 h-3 border border-white/60 rounded-sm">
                        <div className="w-4 h-2 bg-white rounded-sm ml-0.5 mt-0.5"></div>
                      </div>
                    </div>
                  </motion.div>

                  {/* App Header */}
                  <motion.div 
                    className="text-center py-6 px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                  >
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.6, type: "spring", stiffness: 200 }}
                    >
                      💪
                    </motion.div>
                    <motion.h3 
                      className="text-white text-xl font-bold"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.8, duration: 0.5 }}
                    >
                      FitTracker Pro
                    </motion.h3>
                  </motion.div>

                  {/* App Content - Staggered Animation */}
                  <div className="px-4 space-y-4">
                    {[
                      { delay: 2.0, content: "Today's Progress", icon: "📊" },
                      { delay: 2.3, content: "Start Workout", icon: "🏃" },
                      { delay: 2.6, content: "View Stats", icon: "📈" }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: item.delay, duration: 0.5 }}
                      >
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-white font-medium">{item.content}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom Navigation */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 bg-black/20 backdrop-blur h-20 flex items-center justify-around px-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2.8, duration: 0.5 }}
                  >
                    {['🏠', '💪', '📊', '👤'].map((icon, i) => (
                      <motion.div
                        key={i}
                        className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.8 + i * 0.1, type: "spring" }}
                      >
                        {icon}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Floating Sparkles */}
                {[
                  { top: '25%', left: '10%' },
                  { top: '40%', left: '85%' },
                  { top: '60%', left: '5%' },
                  { top: '35%', left: '95%' },
                  { top: '70%', left: '50%' },
                  { top: '50%', left: '30%' },
                ].map((pos, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-yellow-400 text-xl"
                    style={{ top: pos.top, left: pos.left }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      y: [0, -30, -60]
                    }}
                    transition={{
                      delay: 2.5 + i * 0.3,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}