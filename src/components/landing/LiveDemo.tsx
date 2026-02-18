"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LiveDemo() {
  return (
    <section className="py-20 px-6 bg-surface/30">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">See It In Action</span>
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Watch how easy it is to build your first app
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Chat Panel Mockup */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="text-right">
                <div className="inline-block bg-primary rounded-2xl px-4 py-2 max-w-xs">
                  <p className="text-white text-sm">I want to build a fitness tracking app with workout logging and progress charts</p>
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block glass rounded-2xl px-4 py-2 max-w-xs">
                  <p className="text-white text-sm">Great idea! I'll build a fitness app with:</p>
                  <ul className="text-xs text-muted mt-2 space-y-1">
                    <li>• Workout logging interface</li>
                    <li>• Progress tracking charts</li>
                    <li>• User authentication</li>
                    <li>• Data persistence</li>
                  </ul>
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block glass rounded-2xl px-4 py-2">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p className="text-muted text-xs mt-1">Building your app...</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Phone Preview Mockup */}
          <div className="flex justify-center">
            <motion.div 
              className="phone-frame w-72 h-[600px]"
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <div className="phone-screen w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 p-4">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-white font-semibold">FitTracker</h3>
                </div>
                <div className="space-y-3">
                  <div className="glass rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Today's Workout</span>
                      <Badge variant="primary" size="sm">Active</Badge>
                    </div>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <div className="text-white text-sm mb-2">Weekly Progress</div>
                    <div className="w-full bg-surface rounded-full h-2">
                      <motion.div 
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "70%" }}
                        transition={{ delay: 1, duration: 1.5 }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}