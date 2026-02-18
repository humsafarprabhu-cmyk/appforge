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
    setCurrentScreen,
    setDeviceFrame,
    setTheme,
    setChatInputValue,
    initializeDemoData
  } = useBuilderStore();

  // Initialize data on mount
  useEffect(() => {
    if (appId === 'demo') {
      initializeDemoData();
    } else {
      setAppId(appId);
    }
  }, [appId, initializeDemoData, setAppId]);

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

  const handleQRCode = () => {
    toast.info('QR Code feature coming soon!');
  };

  const handleDownload = () => {
    toast.info('Download feature coming soon!');
  };

  const handlePublish = () => {
    toast.info('Publish feature coming soon!');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Top Bar */}
      <BuilderTopBar
        appName={appName}
        appVersion={screens.length}
        onAppNameChange={setAppName}
      />

      {/* Main Content */}
      <div className="flex w-full pt-20">
        {/* Left Panel - Chat Interface */}
        <ChatPanel
          messages={messages}
          isGenerating={isGenerating}
          chatInputValue={chatInputValue}
          onChatInputChange={setChatInputValue}
          onSendMessage={handleSendMessage}
          isExpanded={isChatExpanded}
        />

        {/* Right Panel - Phone Preview */}
        <div className={`flex-1 p-6 ${isChatExpanded ? 'w-1/2' : 'w-3/5'}`}>
          <div className="flex flex-col h-full">
            {/* Device Controls */}
            <DeviceSelector
              deviceFrame={deviceFrame}
              theme={theme}
              onDeviceChange={(device) => setDeviceFrame(device as any)}
              onThemeChange={(theme) => setTheme(theme as any)}
            />

            {/* Phone Preview */}
            <PhonePreview
              screens={screens}
              currentScreen={currentScreen}
              deviceFrame={deviceFrame}
              onScreenChange={setCurrentScreen}
            />

            {/* Action Bar */}
            <ActionBar
              screensCount={screens.length}
              onQRCode={handleQRCode}
              onDownload={handleDownload}
              onPublish={handlePublish}
            />
          </div>
        </div>
      </div>
    </div>
  );
}