"use client";

import { useState } from "react";
import { ArrowLeft, Settings, Save, Edit2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface BuilderTopBarProps {
  appName: string;
  appVersion: number;
  onAppNameChange: (name: string) => void;
}

export function BuilderTopBar({ appName, appVersion, onAppNameChange }: BuilderTopBarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempAppName, setTempAppName] = useState(appName);

  const handleSaveName = () => {
    onAppNameChange(tempAppName);
    setIsEditingName(false);
    toast.success('App name updated');
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-30 navbar-glass px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempAppName}
                  onChange={(e) => setTempAppName(e.target.value)}
                  className="w-48"
                  onBlur={handleSaveName}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={() => {
                  setIsEditingName(true);
                  setTempAppName(appName);
                }}
              >
                <h1 className="text-xl font-bold text-white">{appName}</h1>
                <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
            
            <Badge variant="secondary" size="sm">
              v{Math.max(1, appVersion)}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}