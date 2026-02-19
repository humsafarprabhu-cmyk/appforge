"use client";

import { useState, useEffect } from "react";
import { Database, Table2, Plus, ChevronRight, Loader2 } from "lucide-react";
import type { AppBlueprint } from "@/types/app";

interface DataPanelProps {
  appId: string;
  blueprint: AppBlueprint | null;
}

export function DataPanel({ appId, blueprint }: DataPanelProps) {
  const collections = blueprint?.dataModel?.collections || [];

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Database className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">No data collections yet</p>
        <p className="text-white/25 text-xs mt-1">Generate an app — AI will create your data model</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      <div className="px-1 mb-3">
        <p className="text-xs text-white/40">
          {collections.length} collection{collections.length !== 1 ? "s" : ""} in your app
        </p>
      </div>

      {collections.map((col, i) => (
        <button
          key={i}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <Table2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/80 truncate">{col.name}</p>
            <p className="text-xs text-white/30 mt-0.5">
              {col.fields.length} fields: {col.fields.map(f => f.name).join(", ")}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
        </button>
      ))}

      <div className="pt-3 border-t border-white/[0.04]">
        <button className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 transition-all text-sm">
          <Plus className="w-4 h-4" />
          Add Collection
        </button>
      </div>

      <div className="pt-2 px-1">
        <p className="text-[11px] text-white/20">
          💡 Tip: Ask AI to add or modify collections in the chat
        </p>
      </div>
    </div>
  );
}
