"use client";

import { motion } from "framer-motion";
import { Calendar, Globe, Code2, Play, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { App } from "@/types/app";

interface AppCardProps {
  app: App;
  onDelete: (app: App) => void;
  fadeInUp: any;
}

export function AppCard({ app, onDelete, fadeInUp }: AppCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'building': return 'warning';
      case 'ready': return 'primary';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'building': return 'Building';
      case 'ready': return 'Ready';
      case 'draft': return 'Draft';
      default: return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div variants={fadeInUp}>
      <Card className="h-full glass-hover group" hover>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg"
                style={{ 
                  background: `linear-gradient(135deg, ${app.color_primary}, ${app.color_secondary})` 
                }}
              >
                {app.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-lg">{app.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={getStatusColor(app.status) as any} 
                    size="sm"
                  >
                    {getStatusText(app.status)}
                  </Badge>
                  <span className="text-xs text-muted">v{app.current_version}</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle menu here
                }}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {app.description && (
            <CardDescription className="line-clamp-2">
              {app.description}
            </CardDescription>
          )}

          {/* App Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted">
              <Calendar className="w-4 h-4" />
              <span>Updated {formatDate(app.updated_at)}</span>
            </div>
            {app.pwa_enabled && (
              <div className="flex items-center gap-2 text-accent">
                <Globe className="w-4 h-4" />
                <span>PWA Active</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Link href={`/builder/${app.id}`} className="flex-1">
              <Button size="sm" className="w-full">
                <Code2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            
            {app.status === 'published' && (
              <Button variant="secondary" size="sm">
                <Play className="w-4 h-4" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(app);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}