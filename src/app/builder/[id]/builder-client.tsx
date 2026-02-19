"use client";

import { useEffect, useCallback, useRef } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderTopBar } from "@/components/builder/BuilderTopBar";
import { ChatPanel } from "@/components/builder/ChatPanel";
import { DeviceSelector } from "@/components/builder/DeviceSelector";
import { PhonePreview } from "@/components/builder/PhonePreview";
import { ActionBar } from "@/components/builder/ActionBar";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

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
    deviceFrame,
    theme,
    chatInputValue,
    isChatExpanded,
    setAppId,
    setAppName,
    setAppDescription,
    generateApp,
    retryGeneration,
    setCurrentScreen,
    setDeviceFrame,
    setTheme,
    setChatInputValue,
    setChatExpanded,
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
        console.error('Failed to load app:', error);
        // Fallback to localStorage
        loadState();
        return;
      }

      setAppName(app.name);
      setAppDescription(app.description || '');

      // Load screens from DB
      if (app.screens && Array.isArray(app.screens) && app.screens.length > 0) {
        clearScreens();
        (app.screens as { name: string; html: string }[]).forEach(s => addScreen(s));
      } else {
        // Fallback to localStorage  
        loadState();
      }

      // Load chat messages from DB
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

  // Save screens to Supabase (debounced)
  const saveToSupabase = useCallback(async () => {
    if (appId === 'demo') return;

    try {
      await supabase
        .from('apps')
        .update({
          name: appName,
          description: appDescription,
          screens: screens.map(s => ({ name: s.name, html: s.html })),
          status: screens.length > 0 ? 'ready' : 'draft',
        })
        .eq('id', appId);
    } catch (err) {
      console.error('Failed to save to Supabase:', err);
    }
  }, [appId, appName, appDescription, screens, supabase]);

  // Auto-save when screens change (debounced 2s)
  useEffect(() => {
    if (screens.length === 0 || appId === 'demo') return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveToSupabase();
      saveState(); // also save to localStorage as backup
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [screens, saveToSupabase, saveState, appId]);

  // Initialize data on mount
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

    // Save user message to Supabase
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
      // Save AI response + screens after generation
      if (appId !== 'demo') {
        await saveToSupabase();
      }
      toast.success('App updated successfully!');
    } catch (error) {
      toast.error('Failed to generate app. Please try again.');
      console.error('Generation error:', error);
    }
  };

  const handleRetry = async () => {
    try {
      await retryGeneration();
      toast.success('Retrying generation...');
    } catch (error) {
      toast.error('Failed to retry generation.');
      console.error('Retry error:', error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <BuilderTopBar
        appName={appName}
        appVersion={screens.length}
        onAppNameChange={setAppName}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className={`${isChatExpanded ? 'w-1/2' : 'w-2/5'} transition-all duration-300 md:flex ${isChatExpanded ? '' : 'hidden md:flex'}`}>
          <ChatPanel
            messages={messages}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            generationMessage={generationMessage}
            lastError={lastError}
            chatInputValue={chatInputValue}
            onChatInputChange={setChatInputValue}
            onSendMessage={handleSendMessage}
            onRetry={handleRetry}
            isExpanded={isChatExpanded}
          />
        </div>

        <div className={`flex-1 flex flex-col ${!isChatExpanded ? 'w-full' : ''}`}>
          <DeviceSelector
            deviceFrame={deviceFrame}
            theme={theme}
            onDeviceChange={(device) => setDeviceFrame(device as 'iphone15' | 'pixel8' | 'samsung')}
            onThemeChange={(theme) => setTheme(theme as 'dark' | 'light')}
          />

          <div className="flex-1 flex items-center justify-center p-6">
            <PhonePreview
              screens={screens}
              currentScreen={currentScreen}
              deviceFrame={deviceFrame}
              isGenerating={isGenerating}
              onScreenChange={setCurrentScreen}
            />
          </div>

          <ActionBar
            screensCount={screens.length}
            appId={appId}
            appName={appName}
          />
        </div>
      </div>

      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setChatExpanded(!isChatExpanded)}
          className="bg-primary text-white p-3 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          {isChatExpanded ? '📱' : '💬'}
        </button>
      </div>
    </div>
  );
}
