"use client";

import { useState, useEffect, useCallback } from "react";
import { Database, Table2, Plus, ChevronRight, ChevronLeft, Loader2, RefreshCw, Trash2, Edit2, Eye, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { AppBlueprint } from "@/types/app";

interface DataPanelProps {
  appId: string;
  blueprint: AppBlueprint | null;
}

interface CollectionItem {
  id: string;
  data: Record<string, unknown>;
  created_at: string;
}

type ViewMode = "collections" | "items";

const TYPE_COLORS: Record<string, string> = {
  text: "text-emerald-400",
  number: "text-blue-400",
  boolean: "text-amber-400",
  date: "text-pink-400",
  json: "text-purple-400",
};

export function DataPanel({ appId, blueprint }: DataPanelProps) {
  const collections = blueprint?.dataModel?.collections || [];
  const [viewMode, setViewMode] = useState<ViewMode>("collections");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const apiBase = typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3001" : "";

  const fetchItems = useCallback(async (collectionName: string) => {
    if (appId === "try-mode") return;
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/sdk/data/${collectionName}?limit=50`, {
        headers: { "X-App-Id": appId },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [appId, apiBase]);

  const openCollection = (name: string) => {
    setSelectedCollection(name);
    setViewMode("items");
    fetchItems(name);
  };

  if (collections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Database className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/40 text-sm">No data collections yet</p>
        <p className="text-white/25 text-xs mt-1">Generate an app — AI creates your data model automatically</p>
      </div>
    );
  }

  // Items view
  if (viewMode === "items" && selectedCollection) {
    const col = collections.find(c => c.name === selectedCollection);

    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-white/[0.04]">
          <button
            onClick={() => { setViewMode("collections"); setSelectedCollection(null); setItems([]); }}
            className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/40 hover:text-white/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <p className="text-sm font-medium text-white/70">{selectedCollection}</p>
            <p className="text-[11px] text-white/30">{col?.fields.length || 0} fields · {items.length} items</p>
          </div>
          <button
            onClick={() => fetchItems(selectedCollection)}
            className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-white/60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Schema */}
        <div className="px-3 py-2 border-b border-white/[0.04]">
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-1.5">Schema</p>
          <div className="flex flex-wrap gap-1.5">
            {col?.fields.map((f, i) => (
              <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.03] text-[11px]">
                <span className={TYPE_COLORS[f.type] || "text-white/40"}>{f.type}</span>
                <span className="text-white/40">{f.name}</span>
                {f.required && <span className="text-red-400">*</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-white/20 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <Table2 className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-xs text-white/30">No items yet</p>
              <p className="text-[11px] text-white/20 mt-1">
                {appId === "try-mode" ? "Deploy your app to add data" : "Users will create data through the app"}
              </p>
            </div>
          ) : (
            items.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                className={`w-full text-left p-3 rounded-xl transition-all ${
                  expandedItem === item.id
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04]"
                }`}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-500/10 flex items-center justify-center text-[10px] font-mono text-emerald-400/60">
                    {item.id.slice(0, 4)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/60 truncate">
                      {Object.values(item.data)[0] as string || "—"}
                    </p>
                    <p className="text-[10px] text-white/20">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedItem === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 pt-2 border-t border-white/[0.04] space-y-1">
                        {Object.entries(item.data).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-[11px]">
                            <span className="text-white/30">{key}</span>
                            <span className="text-white/50 truncate ml-2 max-w-[180px]">
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                          <button className="flex-1 py-1.5 rounded-lg bg-white/[0.04] text-[11px] text-white/40 hover:text-white/60">
                            Edit
                          </button>
                          <button className="flex-1 py-1.5 rounded-lg bg-red-500/5 text-[11px] text-red-400/40 hover:text-red-400">
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-white/[0.04]">
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/50 text-sm transition-colors">
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
      </div>
    );
  }

  // Collections list view
  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 border-b border-white/[0.04]">
        <p className="text-xs text-white/40">
          {collections.length} collection{collections.length !== 1 ? "s" : ""} · AI-generated schema
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {collections.map((col, i) => (
          <motion.button
            key={i}
            onClick={() => openCollection(col.name)}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06] transition-all text-left group"
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <Table2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80 truncate">{col.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {col.fields.slice(0, 4).map((f, fi) => (
                  <span key={fi} className={`text-[10px] ${TYPE_COLORS[f.type] || "text-white/30"}`}>
                    {f.name}
                  </span>
                ))}
                {col.fields.length > 4 && (
                  <span className="text-[10px] text-white/20">+{col.fields.length - 4}</span>
                )}
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      <div className="p-3 border-t border-white/[0.04] space-y-2">
        <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/10 text-white/30 hover:text-white/50 hover:border-white/20 transition-all text-sm">
          <Plus className="w-4 h-4" />
          Add Collection
        </button>
        <p className="text-[11px] text-white/20 text-center">
          💡 &quot;Add a categories collection&quot; in chat
        </p>
      </div>
    </div>
  );
}
