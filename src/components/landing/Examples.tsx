'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const examples = [
  {
    id: "fitness",
    name: "FitTracker Pro",
    description: "Track workouts, monitor progress, and achieve your fitness goals with personalized training plans.",
    category: "Health & Fitness",
    gradient: "from-blue-500 via-purple-500 to-pink-500",
    icon: "💪",
    features: ["Workout Tracking", "Progress Analytics", "Goal Setting"]
  },
  {
    id: "food",
    name: "RecipeBook",
    description: "Discover amazing recipes, plan meals, and become a master chef with step-by-step guidance.",
    category: "Food & Drink",
    gradient: "from-orange-500 via-red-500 to-pink-500",
    icon: "🍳",
    features: ["Recipe Discovery", "Meal Planning", "Cooking Timer"]
  },
  {
    id: "productivity",
    name: "TaskMaster",
    description: "Organize your life with smart task management, project tracking, and productivity insights.",
    category: "Productivity",
    gradient: "from-green-500 via-teal-500 to-blue-500",
    icon: "✅",
    features: ["Task Management", "Project Tracking", "Analytics"]
  },
  {
    id: "education",
    name: "StudyBuddy",
    description: "Learn faster with interactive courses, flashcards, and personalized study schedules.",
    category: "Education",
    gradient: "from-indigo-500 via-purple-500 to-pink-500",
    icon: "📚",
    features: ["Interactive Courses", "Flashcards", "Progress Tracking"]
  },
  {
    id: "ecommerce",
    name: "ShopApp",
    description: "Create your online store with beautiful product displays and seamless checkout experience.",
    category: "E-commerce",
    gradient: "from-pink-500 via-rose-500 to-orange-500",
    icon: "🛍️",
    features: ["Product Catalog", "Shopping Cart", "Order Management"]
  },
  {
    id: "social",
    name: "ConnectMe",
    description: "Build communities and connect people with social features, messaging, and content sharing.",
    category: "Social",
    gradient: "from-purple-500 via-pink-500 to-red-500",
    icon: "👥",
    features: ["Social Feed", "Messaging", "Community Groups"]
  }
];

export function Examples() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Badge variant="outline" className="mb-4">
              Example Templates
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Apps Built with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AppForge
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get inspired by these example apps. Each one was built in minutes using our AI-powered platform.
              Click "Try this template" to start with any of these as your foundation.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {examples.map((example, index) => (
            <motion.div
              key={example.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 group-hover:border-border group-hover:bg-card/80 h-full flex flex-col">
                {/* Phone Mockup */}
                <div className="relative mb-6 mx-auto">
                  <div className="w-48 h-96 bg-gray-900 rounded-3xl p-2 shadow-2xl">
                    <div className="w-full h-full rounded-2xl overflow-hidden relative">
                      {/* Phone screen with gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${example.gradient} opacity-90`} />
                      
                      {/* Status bar */}
                      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-white text-xs font-medium">
                        <span>9:41</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-2 bg-white/60 rounded-sm"></div>
                          <div className="w-6 h-3 border border-white/60 rounded-sm">
                            <div className="w-4 h-2 bg-white rounded-sm ml-0.5 mt-0.5"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* App content */}
                      <div className="absolute inset-0 pt-12 pb-20 px-4 flex flex-col items-center justify-center text-white">
                        <div className="text-6xl mb-4 animate-bounce">{example.icon}</div>
                        <h3 className="text-lg font-bold mb-2">{example.name}</h3>
                        <div className="w-16 h-1 bg-white/30 rounded-full mb-4"></div>
                        <div className="space-y-2 w-full">
                          {example.features.slice(0, 2).map((feature, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur rounded-lg p-2 text-xs text-center">
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Bottom nav */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-black/20 backdrop-blur flex items-center justify-around px-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-white/30 rounded-full"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* App info */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{example.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {example.category}
                    </Badge>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 flex-1">
                    {example.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {example.features.map((feature, i) => (
                      <span
                        key={i}
                        className="text-xs bg-background/50 border border-border/50 rounded-full px-2 py-1"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* CTA Button */}
                  <Link href={`/builder/demo?template=${example.id}`}>
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Try this template
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-muted-foreground mb-6">
            Don't see what you're looking for? Create something completely custom!
          </p>
          <Link href="/try">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl">
              Build Your Own App
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}