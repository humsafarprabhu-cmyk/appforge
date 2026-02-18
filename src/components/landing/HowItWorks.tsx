"use client";

import { motion } from "framer-motion";
import { Sparkles, Code2, Rocket } from "lucide-react";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Describe Your App",
      description: "Tell our AI what you want to build in plain English. Be as detailed or as simple as you like.",
      icon: <Sparkles className="w-8 h-8" />
    },
    {
      step: "02", 
      title: "Watch It Build Live",
      description: "See your app come to life in real-time. Our AI generates the code, UI, and functionality instantly.",
      icon: <Code2 className="w-8 h-8" />
    },
    {
      step: "03",
      title: "Download & Publish",
      description: "Get your APK instantly or let us handle publishing to Google Play Store for you.",
      icon: <Rocket className="w-8 h-8" />
    }
  ];

  return (
    <section className="py-20 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            From idea to app store in three simple steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="text-center h-full" hover glow={index === 1}>
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <div className="text-sm font-medium text-primary mb-2">Step {item.step}</div>
                  <CardTitle className="mb-4">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}