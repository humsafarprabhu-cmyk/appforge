"use client";

import { useEffect, useCallback, useRef } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { BuilderEditor } from "@/components/builder/BuilderEditor";

interface BuilderClientProps {
  id: string;
}

export function BuilderClient({ id: appId }: BuilderClientProps) {
  const supabase = createClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    messages,
    isGenerating,
    generationProgress,
    generationMessage,
    lastError,
    appName,
    appDescription,
    screens,
    currentScreen,
    chatInputValue,
    setAppId,
    setAppName,
    setAppDescription,
    generateApp,
    retryGeneration,
    setCurrentScreen,
    setChatInputValue,
    initializeDemoData,
    loadState,
    addScreen,
    clearScreens,
    addMessage,
    clearMessages,
    saveState,
  } = useBuilderStore();

  // Load app from Supabase on mount
  const loadFromSupabase = useCallback(async () => {
    if (appId === 'demo') return;
    try {
      const { data: app, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();

      if (error || !app) {
        loadState();
        return;
      }

      setAppName(app.name);
      setAppDescription(app.description || '');

      if (app.screens && Array.isArray(app.screens) && app.screens.length > 0) {
        clearScreens();
        (app.screens as { name: string; html: string }[]).forEach(s => addScreen(s));
      } else {
        loadState();
      }

      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: true });

      if (msgs && msgs.length > 0) {
        clearMessages();
        msgs.forEach(m => addMessage({
          app_id: m.app_id,
          role: m.role,
          content: m.content,
          version_number: m.version_number,
          tokens_used: m.tokens_used,
          model: m.model,
        }));
      }
    } catch (err) {
      console.error('Supabase load error:', err);
      loadState();
    }
  }, [appId, supabase, loadState, setAppName, setAppDescription, clearScreens, addScreen, clearMessages, addMessage]);

  const saveToSupabase = useCallback(async () => {
    if (appId === 'demo') return;
    try {
      const { error } = await supabase
        .from('apps')
        .update({
          name: appName,
          description: appDescription,
          screens: screens.map(s => ({ name: s.name, html: s.html })),
          status: screens.length > 0 ? 'ready' : 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appId);
      if (error) console.error('Supabase save error:', error.message);
    } catch (err) {
      console.error('Failed to save to Supabase:', err);
    }
  }, [appId, appName, appDescription, screens, supabase]);

  // Auto-save when screens change
  useEffect(() => {
    if (screens.length === 0 || appId === 'demo') return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase();
      saveState();
    }, 2000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [screens, saveToSupabase, saveState, appId]);

  useEffect(() => {
    if (appId === 'demo') {
      initializeDemoData();
    } else {
      setAppId(appId);
      loadFromSupabase();
    }
  }, [appId, initializeDemoData, setAppId, loadFromSupabase]);

  const handleSendMessage = async () => {
    if (!chatInputValue.trim() || isGenerating) return;
    const message = chatInputValue.trim();
    setChatInputValue('');

    if (appId !== 'demo') {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) {
          supabase.from('chat_messages').insert({
            app_id: appId,
            user_id: data.user.id,
            role: 'user',
            content: message,
            version_number: screens.length > 0 ? 2 : 1,
          });
        }
      });
    }
    
    try {
      await generateApp(message);
      if (appId !== 'demo') await saveToSupabase();
      toast.success('App updated successfully!');
    } catch (error) {
      toast.error('Failed to generate. Try again.');
    }
  };

  const handleRetry = async () => {
    try {
      await retryGeneration();
    } catch (error) {
      toast.error('Retry failed.');
    }
  };

  return (
    <BuilderEditor
      appId={appId}
      appName={appName}
      screens={screens}
      currentScreen={currentScreen}
      messages={messages}
      isGenerating={isGenerating}
      generationProgress={generationProgress}
      generationMessage={generationMessage}
      lastError={lastError}
      chatInputValue={chatInputValue}
      onAppNameChange={setAppName}
      onScreenChange={setCurrentScreen}
      onChatInputChange={setChatInputValue}
      onSendMessage={handleSendMessage}
      onRetry={handleRetry}
    />
  );
}
