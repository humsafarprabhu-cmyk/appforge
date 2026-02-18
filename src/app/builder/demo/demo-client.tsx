"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderTopBar } from "@/components/builder/BuilderTopBar";
import { ChatPanel } from "@/components/builder/ChatPanel";
import { DeviceSelector } from "@/components/builder/DeviceSelector";
import { PhonePreview } from "@/components/builder/PhonePreview";
import { ActionBar } from "@/components/builder/ActionBar";
import { toast } from "sonner";

export function DemoClient() {
  const searchParams = useSearchParams();
  const template = searchParams.get('template') || 'fitness';
  
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
    initializeTemplateData
  } = useBuilderStore();

  // Initialize template data on mount
  useEffect(() => {
    setAppId('demo');
    initializeTemplateData(template);
    
    // Show welcome toast for the template
    const templateNames = {
      fitness: 'Fitness App',
      food: 'Recipe App', 
      education: 'Education App',
      productivity: 'Task Management App',
      ecommerce: 'E-commerce App',
      social: 'Social App'
    };
    
    const templateName = templateNames[template as keyof typeof templateNames] || 'App';
    
    setTimeout(() => {
      toast.success(`Welcome! Here's a ${templateName} template. You can customize it by chatting with me.`, {
        duration: 5000,
      });
    }, 1000);
  }, [template, initializeTemplateData, setAppId]);

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
        isDemo={true}
        templateType={template}
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
            isDemo={true}
          />
        </div>

        {/* Right Panel - Preview */}
        <div className={`${isChatExpanded ? 'w-1/2' : 'w-3/5'} transition-all duration-300 flex flex-col`}>
          {/* Device Selector */}
          <div className="px-4 py-3 border-b bg-background/95 backdrop-blur-sm">
            <DeviceSelector
              deviceFrame={deviceFrame}
              onDeviceChange={(device) => setDeviceFrame(device as 'iphone15' | 'pixel8' | 'samsung')}
              theme={theme}
              onThemeChange={(theme) => setTheme(theme as 'dark' | 'light')}
            />
          </div>

          {/* Phone Preview - Flex-grow to take remaining space */}
          <div className="flex-1 overflow-auto">
            <PhonePreview
              screens={screens}
              currentScreen={currentScreen}
              onScreenChange={setCurrentScreen}
              deviceFrame={deviceFrame}
            />
          </div>
        </div>
      </div>

      {/* Action Bar - Fixed at bottom */}
      <div className="border-t border-border/50 bg-background/95 backdrop-blur-sm">
        <ActionBar
          screensCount={screens.length}
          appId="demo"
          appName={appName}
        />
      </div>
    </div>
  );
}