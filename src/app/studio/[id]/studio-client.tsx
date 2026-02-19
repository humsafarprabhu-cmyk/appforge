"use client";

import { useEffect, useCallback, useRef } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { StudioLayout } from "@/components/studio/StudioLayout";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface StudioClientProps {
  id: string;
}

export function StudioClient({ id: appId }: StudioClientProps) {
  const supabase = createClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    appName,
    appDescription,
    screens,
    setAppId,
    setAppName,
    setAppDescription,
    generateApp,
    addScreen,
    clearScreens,
    addMessage,
    clearMessages,
    loadState,
    saveState,
  } = useBuilderStore();

  // Load from Supabase
  const loadFromSupabase = useCallback(async () => {
    if (appId === "try-mode") return;
    try {
      const { data: app, error } = await supabase
        .from("apps")
        .select("*")
        .eq("id", appId)
        .single();

      if (error || !app) {
        loadState();
        return;
      }

      setAppName(app.name);
      setAppDescription(app.description || "");

      if (app.screens && Array.isArray(app.screens) && app.screens.length > 0) {
        clearScreens();
        (app.screens as { name: string; html: string }[]).forEach((s) => addScreen(s));
      } else {
        loadState();
      }

      // Load chat history
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("app_id", appId)
        .order("created_at", { ascending: true });

      if (msgs && msgs.length > 0) {
        clearMessages();
        msgs.forEach((m) =>
          addMessage({
            app_id: m.app_id,
            role: m.role,
            content: m.content,
            version_number: m.version_number,
            tokens_used: m.tokens_used,
            model: m.model,
          })
        );
      }
    } catch (err) {
      console.error("Supabase load error:", err);
      loadState();
    }
  }, [appId]);

  // Save to Supabase
  const saveToSupabase = useCallback(async () => {
    if (appId === "try-mode") return;
    try {
      await supabase
        .from("apps")
        .update({
          name: appName,
          description: appDescription,
          screens: screens.map((s) => ({ name: s.name, html: s.html })),
          status: screens.length > 0 ? "ready" : "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", appId);
    } catch (err) {
      console.error("Save error:", err);
    }
  }, [appId, appName, appDescription, screens]);

  // Auto-save
  useEffect(() => {
    if (screens.length === 0 || appId === "try-mode") return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase();
      saveState();
    }, 2000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [screens, saveToSupabase, saveState, appId]);

  // Init
  useEffect(() => {
    setAppId(appId);
    if (appId !== "try-mode") {
      loadFromSupabase();
    }
  }, [appId]);

  // Handle send
  const handleSendMessage = useCallback(
    async (message: string) => {
      // Save user message to Supabase
      if (appId !== "try-mode") {
        supabase.auth.getUser().then(({ data }) => {
          if (data.user) {
            supabase.from("chat_messages").insert({
              app_id: appId,
              user_id: data.user.id,
              role: "user",
              content: message,
              version_number: screens.length > 0 ? 2 : 1,
            });
          }
        });
      }

      try {
        await generateApp(message);
        if (appId !== "try-mode") await saveToSupabase();
        toast.success("App updated!");
      } catch {
        toast.error("Failed. Try again.");
      }
    },
    [appId, screens, generateApp, saveToSupabase]
  );

  return <StudioLayout appId={appId} onSendMessage={handleSendMessage} />;
}
