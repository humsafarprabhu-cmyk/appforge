"use client";

import { Plus, Code2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

interface DashboardHeaderProps {
  onCreateApp: () => void;
}

export function DashboardHeader({ onCreateApp }: DashboardHeaderProps) {
  const { profile, user } = useAuth();
  const plan = profile?.plan || 'free';
  const initial = profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="navbar-glass">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AppForge</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-surface rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">{initial}</span>
              </div>
              <Badge variant={plan === 'free' ? 'secondary' : 'primary'} size="sm">
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </Badge>
            </div>
          </div>

          <Button onClick={onCreateApp}>
            <Plus className="w-4 h-4 mr-2" />
            Create New App
          </Button>
        </div>
      </div>
    </div>
  );
}