"use client";

import { Users, UserPlus } from "lucide-react";

interface UsersPanelProps {
  appId: string;
}

export function UsersPanel({ appId }: UsersPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Users className="w-10 h-10 text-white/20 mb-3" />
      <p className="text-white/40 text-sm">No users yet</p>
      <p className="text-white/25 text-xs mt-1 max-w-[240px]">
        Share your app&apos;s live URL — users who sign up will appear here
      </p>
      <div className="mt-4 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <p className="text-xs text-white/30 font-mono">
          appforge.app/{appId}
        </p>
      </div>
    </div>
  );
}
