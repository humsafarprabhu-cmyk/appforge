"use client";

import { motion } from "framer-motion";
import { Smartphone, Activity, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsOverviewProps {
  stats: {
    totalApps: number;
    totalBuilds: number;
    activePWAs: number;
  };
}

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
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export function StatsOverview({ stats }: StatsOverviewProps) {
  const statItems = [
    {
      label: "Total Apps",
      value: stats.totalApps,
      icon: <Smartphone className="w-6 h-6 text-primary" />,
      color: "primary"
    },
    {
      label: "Total Builds",
      value: stats.totalBuilds,
      icon: <Activity className="w-6 h-6 text-secondary" />,
      color: "secondary"
    },
    {
      label: "Active PWAs",
      value: stats.activePWAs,
      icon: <Globe className="w-6 h-6 text-accent" />,
      color: "accent"
    }
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
    >
      {statItems.map((stat, index) => (
        <motion.div key={stat.label} variants={fadeInUp}>
          <Card className="glass-hover" hover>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}/20 rounded-xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}