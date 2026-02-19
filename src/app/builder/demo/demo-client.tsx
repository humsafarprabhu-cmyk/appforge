"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderEditor } from "@/components/builder/BuilderEditor";
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
    chatInputValue,
    setAppId,
    setAppName,
    generateApp,
    retryGeneration,
    setCurrentScreen,
    setChatInputValue,
    initializeTemplateData,
  } = useBuilderStore();

  useEffect(() => {
    setAppId('demo');
    initializeTemplateData(template);
    setTimeout(() => {
      toast.success(`Template loaded! Customize it by chatting.`, { duration: 3000 });
    }, 800);
  }, [template, initializeTemplateData, setAppId]);

  const handleSendMessage = async () => {
    if (!chatInputValue.trim() || isGenerating) return;
    const message = chatInputValue.trim();
    setChatInputValue('');
    try {
      await generateApp(message);
      toast.success('App updated!');
    } catch {
      toast.error('Generation failed. Try again.');
    }
  };

  return (
    <BuilderEditor
      appId="demo"
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
      onRetry={retryGeneration}
    />
  );
}
