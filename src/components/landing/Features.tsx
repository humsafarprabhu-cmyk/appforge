"use client";

import { motion } from "framer-motion";
import { Zap, Layers, Star, Shield, Github, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function Features() {
  const features = [
    {
      title: "AI-Powered Code Gen",
      description: "Advanced AI generates production-ready React Native code from natural language descriptions.",
      icon: <Zap className="w-6 h-6" />,
      color: "primary"
    },
    {
      title: "Firebase Built-in",
      description: "Automatic database, authentication, and hosting setup. No configuration required.",
      icon: <Layers className="w-6 h-6" />,
      color: "secondary"
    },
    {
      title: "AdMob Ready",
      description: "Monetize your apps instantly with built-in ad integration and revenue optimization.",
      icon: <Star className="w-6 h-6" />,
      color: "success"
    },
    {
      title: "Play Store Managed",
      description: "We handle app store submissions, updates, and compliance for you automatically.",
      icon: <Shield className="w-6 h-6" />,
      color: "primary"
    },
    {
      title: "Version Control",
      description: "Full git history, branching, and collaboration tools built right into the platform.",
      icon: <Github className="w-6 h-6" />,
      color: "secondary"
    },
    {
      title: "Zero Code Required",
      description: "Build complex apps without writing a single line of code. AI handles everything.",
      icon: <Sparkles className="w-6 h-6" />,
      color: "success"
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Everything you need to build, deploy, and scale your mobile apps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full" hover>
                <CardHeader>
                  <div className="w-12 h-12 bg-surface rounded-xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}