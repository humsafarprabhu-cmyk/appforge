"use client";

import { useEffect } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderTopBar } from "@/components/builder/BuilderTopBar";
import { ChatPanel } from "@/components/builder/ChatPanel";
import { DeviceSelector } from "@/components/builder/DeviceSelector";
import { PhonePreview } from "@/components/builder/PhonePreview";
import { ActionBar } from "@/components/builder/ActionBar";
import { toast } from "sonner";

interface BuilderClientProps {
  id: string;
}

export function BuilderClient({ id: appId }: BuilderClientProps) {
  const {
    messages,
    isGenerating,
    generationProgress,
    generationMessage,
    lastError,
    appName,
    screens,
    currentScreen,
    deviceFrame,
    theme,
    chatInputValue,
    isChatExpanded,
    setAppId,
    setAppName,
    generateApp,
    retryGeneration,
    setCurrentScreen,
    setDeviceFrame,
    setTheme,
    setChatInputValue,
    setChatExpanded,
    initializeDemoData,
    loadState
  } = useBuilderStore();

  // Initialize data on mount
  useEffect(() => {
    if (appId === 'demo') {
      initializeDemoData();
    } else {
      setAppId(appId);
      // Load saved state from localStorage
      setTimeout(() => loadState(), 100); // Small delay to ensure appId is set
    }
  }, [appId, initializeDemoData, setAppId, loadState]);

  const handleSendMessage = async () => {
    if (!chatInputValue.trim() || isGenerating) return;
    
    const message = chatInputValue.trim();
    setChatInputValue('');
    
    try {
      await generateApp(message);
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
      {/* Top Bar - Fixed height */}
      <BuilderTopBar
        appName={appName}
        appVersion={screens.length}
        onAppNameChange={setAppName}
      />

      {/* Main Content - Flex row taking remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Chat Interface */}
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

        {/* Right Panel - Phone Preview */}
        <div className={`flex-1 flex flex-col ${!isChatExpanded ? 'w-full' : ''}`}>
          {/* Device Controls */}
          <DeviceSelector
            deviceFrame={deviceFrame}
            theme={theme}
            onDeviceChange={(device) => setDeviceFrame(device as any)}
            onThemeChange={(theme) => setTheme(theme as any)}
          />

          {/* Phone Preview */}
          <div className="flex-1 flex items-center justify-center p-6">
            <PhonePreview
              screens={screens}
              currentScreen={currentScreen}
              deviceFrame={deviceFrame}
              isGenerating={isGenerating}
              onScreenChange={setCurrentScreen}
            />
          </div>

          {/* Action Bar */}
          <ActionBar
            screensCount={screens.length}
            appId={appId}
            appName={appName}
          />
        </div>
      </div>

      {/* Mobile Tab Toggle - Only visible on small screens */}
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