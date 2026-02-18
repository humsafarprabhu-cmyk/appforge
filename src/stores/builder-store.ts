import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChatMessage } from '@/types/app';

interface AppScreen {
  name: string;
  html: string;
  isActive?: boolean;
}

interface BuilderState {
  // Chat state
  messages: ChatMessage[];
  isGenerating: boolean;
  generationProgress: number;
  generationMessage: string;
  
  // App state
  appId: string | null;
  appName: string;
  appDescription: string;
  
  // Screens state
  screens: AppScreen[];
  currentScreen: number;
  
  // Preview state
  deviceFrame: 'iphone15' | 'pixel8' | 'samsung';
  theme: 'dark' | 'light';
  
  // UI state
  chatInputValue: string;
  isChatExpanded: boolean;
  
  // Error handling
  lastError: string | null;
  
  // Actions
  setAppId: (id: string) => void;
  setAppName: (name: string) => void;
  setAppDescription: (description: string) => void;
  
  addMessage: (message: Omit<ChatMessage, 'id' | 'created_at'>) => void;
  setIsGenerating: (generating: boolean) => void;
  setGenerationProgress: (progress: number, message: string) => void;
  setLastError: (error: string | null) => void;
  clearMessages: () => void;
  
  addScreen: (screen: AppScreen) => void;
  updateScreen: (index: number, screen: Partial<AppScreen>) => void;
  setCurrentScreen: (index: number) => void;
  clearScreens: () => void;
  
  setDeviceFrame: (frame: 'iphone15' | 'pixel8' | 'samsung') => void;
  setTheme: (theme: 'dark' | 'light') => void;
  
  setChatInputValue: (value: string) => void;
  setChatExpanded: (expanded: boolean) => void;
  
  // Initialize with demo data
  initializeDemoData: () => void;
  
  // Generate app
  generateApp: (prompt: string) => Promise<void>;
  retryGeneration: () => Promise<void>;
  
  // State persistence
  saveState: () => void;
  loadState: () => void;
}

// Mock data for demo
const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    app_id: 'demo-app',
    role: 'user',
    content: 'I want to build a fitness tracking app with workout logging and progress charts',
    version_number: 1,
    tokens_used: null,
    model: null,
    created_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: '2',
    app_id: 'demo-app',
    role: 'assistant',
    content: 'Great idea! I\'ll build a comprehensive fitness tracking app for you. This will include:\n\n• Workout logging interface with exercise selection\n• Progress tracking with interactive charts\n• User authentication and profile management\n• Local data persistence\n• Modern, responsive design\n\nLet me start building this for you...',
    version_number: 1,
    tokens_used: 150,
    model: 'gpt-4o',
    created_at: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: '3',
    app_id: 'demo-app',
    role: 'system',
    content: 'App generated successfully! Your fitness tracking app is ready with 3 screens.',
    version_number: 1,
    tokens_used: null,
    model: null,
    created_at: new Date(Date.now() - 180000).toISOString(),
  },
  {
    id: '4',
    app_id: 'demo-app',
    role: 'user',
    content: 'This looks great! Can you add a social feature where users can share their workouts?',
    version_number: 1,
    tokens_used: null,
    model: null,
    created_at: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: '5',
    app_id: 'demo-app',
    role: 'assistant',
    content: 'Absolutely! I\'ll add a social sharing feature. This will include:\n\n• Share workout achievements\n• Social feed to see friends\' progress\n• Like and comment on posts\n• Privacy controls\n\nUpdating your app now...',
    version_number: 1,
    tokens_used: 120,
    model: 'gpt-4o',
    created_at: new Date(Date.now() - 60000).toISOString(),
  }
];

const DEMO_SCREENS: AppScreen[] = [
  {
    name: 'Dashboard',
    html: `
      <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin: 0 0 10px 0;">FitTracker</h1>
          <p style="opacity: 0.8; margin: 0;">Welcome back, Alex!</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 15px 0; font-size: 18px;">Today's Progress</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span>Steps</span>
            <span>8,543 / 10,000</span>
          </div>
          <div style="height: 8px; background: rgba(255,255,255,0.2); border-radius: 4px; overflow: hidden;">
            <div style="height: 100%; width: 85%; background: #4CAF50; border-radius: 4px;"></div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 15px 0; font-size: 18px;">Quick Actions</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button style="background: #2196F3; border: none; color: white; padding: 12px; border-radius: 8px; font-size: 14px;">Start Workout</button>
            <button style="background: #FF9800; border: none; color: white; padding: 12px; border-radius: 8px; font-size: 14px;">Log Food</button>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 15px 0; font-size: 18px;">Recent Workouts</h3>
          <div style="space-y: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Upper Body Strength</span>
              <span style="opacity: 0.7;">Yesterday</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>Morning Run</span>
              <span style="opacity: 0.7;">2 days ago</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Yoga Session</span>
              <span style="opacity: 0.7;">3 days ago</span>
            </div>
          </div>
        </div>
      </div>
    `,
    isActive: true
  },
  {
    name: 'Workout',
    html: `
      <div style="padding: 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); min-height: 100vh; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin: 0 0 10px 0;">Start Workout</h1>
          <p style="opacity: 0.8; margin: 0;">Choose your workout type</p>
        </div>
        
        <div style="display: grid; gap: 15px; margin-bottom: 30px;">
          <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
            <h3 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
              💪 Strength Training
            </h3>
            <p style="margin: 0; opacity: 0.8; font-size: 14px;">Build muscle with weights and resistance</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
            <h3 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
              🏃 Cardio
            </h3>
            <p style="margin: 0; opacity: 0.8; font-size: 14px;">Improve endurance and burn calories</p>
          </div>
          
          <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
            <h3 style="margin: 0 0 10px 0; display: flex; align-items: center; gap: 10px;">
              🧘 Flexibility
            </h3>
            <p style="margin: 0; opacity: 0.8; font-size: 14px;">Yoga, stretching, and mobility work</p>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 15px 0;">Quick Start</h3>
          <button style="width: 100%; background: #4CAF50; border: none; color: white; padding: 15px; border-radius: 12px; font-size: 16px; font-weight: 600;">
            Begin Workout Session
          </button>
        </div>
      </div>
    `
  },
  {
    name: 'Progress',
    html: `
      <div style="padding: 20px; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); min-height: 100vh; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 28px; margin: 0 0 10px 0;">Your Progress</h1>
          <p style="opacity: 0.8; margin: 0;">Track your fitness journey</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 15px 0;">Weekly Summary</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
            <div>
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">5</div>
              <div style="opacity: 0.7; font-size: 14px;">Workouts</div>
            </div>
            <div>
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 5px;">450</div>
              <div style="opacity: 0.7; font-size: 14px;">Calories</div>
            </div>
          </div>
        </div>

        <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; margin-bottom: 20px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 15px 0;">Weight Progress</h3>
          <div style="height: 120px; background: rgba(255,255,255,0.1); border-radius: 8px; position: relative; overflow: hidden;">
            <div style="position: absolute; bottom: 0; left: 10%; height: 60%; width: 8px; background: #4CAF50; border-radius: 4px;"></div>
            <div style="position: absolute; bottom: 0; left: 25%; height: 70%; width: 8px; background: #4CAF50; border-radius: 4px;"></div>
            <div style="position: absolute; bottom: 0; left: 40%; height: 55%; width: 8px; background: #4CAF50; border-radius: 4px;"></div>
            <div style="position: absolute; bottom: 0; left: 55%; height: 80%; width: 8px; background: #4CAF50; border-radius: 4px;"></div>
            <div style="position: absolute; bottom: 0; left: 70%; height: 90%; width: 8px; background: #4CAF50; border-radius: 4px;"></div>
            <div style="position: absolute; bottom: 0; left: 85%; height: 75%; width: 8px; background: #4CAF50; border-radius: 4px;"></div>
          </div>
          <div style="text-align: center; margin-top: 10px; opacity: 0.7; font-size: 12px;">Last 6 weeks</div>
        </div>

        <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 15px 0;">Achievements</h3>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <div style="background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 20px; font-size: 14px;">🏆 5-day streak</div>
            <div style="background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 20px; font-size: 14px;">💪 Strength goal</div>
            <div style="background: rgba(255,255,255,0.2); padding: 8px 12px; border-radius: 20px; font-size: 14px;">🔥 Calorie burner</div>
          </div>
        </div>
      </div>
    `
  }
];

export const useBuilderStore = create<BuilderState>()(
  devtools(
    (set, get) => ({
      // Initial state
      messages: [],
      isGenerating: false,
      generationProgress: 0,
      generationMessage: '',
      
      appId: null,
      appName: 'My New App',
      appDescription: '',
      
      screens: [],
      currentScreen: 0,
      
      deviceFrame: 'iphone15',
      theme: 'dark',
      
      chatInputValue: '',
      isChatExpanded: false,
      
      lastError: null,
      
      // Actions
      setAppId: (id) => set({ appId: id }),
      setAppName: (name) => set({ appName: name }),
      setAppDescription: (description) => set({ appDescription: description }),
      
      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Math.random().toString(36).slice(2),
          created_at: new Date().toISOString(),
        };
        set((state) => ({ messages: [...state.messages, newMessage] }));
      },
      
      setIsGenerating: (generating) => set({ isGenerating: generating }),
      
      setGenerationProgress: (progress, message) => set({ 
        generationProgress: progress,
        generationMessage: message 
      }),
      
      setLastError: (error) => set({ lastError: error }),
      
      clearMessages: () => set({ messages: [] }),
      
      addScreen: (screen) => set((state) => ({ 
        screens: [...state.screens, screen] 
      })),
      
      updateScreen: (index, screenUpdate) => set((state) => ({
        screens: state.screens.map((screen, i) => 
          i === index ? { ...screen, ...screenUpdate } : screen
        )
      })),
      
      setCurrentScreen: (index) => set({ currentScreen: index }),
      
      clearScreens: () => set({ screens: [] }),
      
      setDeviceFrame: (frame) => set({ deviceFrame: frame }),
      setTheme: (theme) => set({ theme }),
      
      setChatInputValue: (value) => set({ chatInputValue: value }),
      setChatExpanded: (expanded) => set({ isChatExpanded: expanded }),
      
      // Initialize with demo data
      initializeDemoData: () => set({
        messages: DEMO_MESSAGES,
        screens: DEMO_SCREENS,
        appId: 'demo-app',
        appName: 'FitTracker',
        appDescription: 'A comprehensive fitness tracking app with workout logging and progress charts',
        currentScreen: 0,
      }),
      
      // Generate app with streaming and contextual updates
      generateApp: async (prompt) => {
        const { 
          addMessage, 
          setIsGenerating, 
          setGenerationProgress, 
          setLastError,
          clearScreens, 
          addScreen, 
          updateScreen,
          setAppName, 
          setAppDescription, 
          appId, 
          messages,
          screens,
          saveState
        } = get();
        
        setIsGenerating(true);
        setGenerationProgress(0, 'Starting generation...');
        setLastError(null);
        
        // Add user message
        addMessage({
          app_id: appId || 'new-app',
          role: 'user',
          content: prompt,
          version_number: 1,
          tokens_used: null,
          model: null,
        });

        // Determine if this is an update or initial generation
        const isUpdate = screens.length > 0;
        const mode = isUpdate ? 'update' : 'initial';

        // Add AI response message
        const aiResponseContent = isUpdate 
          ? `I'll update your app based on your request. Let me modify the relevant screens while maintaining consistency across the app.`
          : `I'll build that for you! Creating a ${prompt.toLowerCase()} with modern design and functionality. This will include user interface, data management, and responsive design.`;
          
        addMessage({
          app_id: appId || 'new-app',
          role: 'assistant',
          content: aiResponseContent,
          version_number: 1,
          tokens_used: 150,
          model: 'gpt-4o',
        });
        
        try {
          // For demo app, use mock data but still call API for new apps
          if (appId === 'demo') {
            // Keep demo behavior for demo app
            for (let i = 0; i < 3; i++) {
              setGenerationProgress((i + 1) * 30, `Generating screen ${i + 1} of 3...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            if (!isUpdate) {
              clearScreens();
              addScreen({
                name: 'Home',
                html: `
                  <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                    <h1 style="text-align: center; font-size: 28px; margin-bottom: 30px;">Your App</h1>
                    <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
                      <p style="margin: 0; text-align: center;">Welcome to your new app! This is a generated screen based on your prompt: "${prompt}"</p>
                    </div>
                  </div>
                `
              });
            }
          } else {
            // Make streaming API call
            const response = await fetch('/api/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt,
                appId: appId || 'new-app',
                messages: messages.slice(-10), // Last 10 messages for context
                currentScreens: isUpdate ? screens.map(s => ({ name: s.name, html: s.html })) : undefined,
                mode,
                category: 'custom', // TODO: get from app data
              }),
            });

            if (!response.ok) {
              throw new Error(`API call failed: ${response.status}`);
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            if (!reader) {
              throw new Error('Response body is not readable');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            try {
              while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || '';
                
                for (const line of lines) {
                  if (line.startsWith('data: ')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      
                      if (data.type === 'progress') {
                        setGenerationProgress(data.progress, data.message);
                      } else if (data.type === 'complete') {
                        // Handle completion
                        if (!isUpdate) {
                          clearScreens();
                        }
                        
                        // Set app metadata
                        if (data.appName) {
                          setAppName(data.appName);
                        }
                        if (data.description) {
                          setAppDescription(data.description);
                        }

                        // Add/update screens with diff detection
                        if (data.screens && Array.isArray(data.screens)) {
                          data.screens.forEach((newScreen: { name: string; html: string }, index: number) => {
                            if (isUpdate && screens[index]) {
                              // Update mode: compare and update only if changed
                              if (screens[index].html !== newScreen.html) {
                                updateScreen(index, { ...newScreen, isActive: true });
                              }
                            } else {
                              // Initial mode: add new screen
                              addScreen(newScreen);
                            }
                          });
                        }
                      }
                    } catch (parseError) {
                      console.error('Failed to parse streaming data:', parseError);
                    }
                  }
                }
              }
            } finally {
              reader.releaseLock();
            }
          }
          
          // Add system success message
          addMessage({
            app_id: appId || 'new-app',
            role: 'system',
            content: isUpdate 
              ? 'App updated successfully! Your changes have been applied.'
              : 'App generated successfully! Your app is ready with multiple screens.',
            version_number: 1,
            tokens_used: null,
            model: null,
          });

          // Set current screen to first screen if initial generation
          if (!isUpdate) {
            set({ currentScreen: 0 });
          }
          
          // Save state to localStorage
          saveState();
          
        } catch (error) {
          console.error('API generation error:', error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setLastError(errorMessage);
          
          // Add error message
          addMessage({
            app_id: appId || 'new-app',
            role: 'system',
            content: `Failed to generate app: ${errorMessage}. You can try again or contact support.`,
            version_number: 1,
            tokens_used: null,
            model: null,
          });
          
          // For initial generation, still provide a fallback screen
          if (!isUpdate) {
            addScreen({
              name: 'Home',
              html: `
                <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center;">
                  <h1 style="font-size: 28px; margin-bottom: 30px;">Your App</h1>
                  <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
                    <p style="margin: 0;">Unable to generate app at this time. Please try again later.</p>
                    <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.7;">Your prompt: "${prompt}"</p>
                    <button style="margin-top: 15px; padding: 10px 20px; background: #4CAF50; border: none; color: white; border-radius: 8px; cursor: pointer;" onclick="window.parent.postMessage({type: 'retry'}, '*')">Retry</button>
                  </div>
                </div>
              `
            });
          }
        }
        
        setIsGenerating(false);
        setGenerationProgress(100, 'Complete!');
      },
      
      // Retry generation with the last user message
      retryGeneration: async () => {
        const { messages, generateApp } = get();
        const lastUserMessage = messages.filter(m => m.role === 'user').pop();
        if (lastUserMessage) {
          await generateApp(lastUserMessage.content);
        }
      },
      
      // Save state to localStorage
      saveState: () => {
        const { appId, appName, appDescription, screens, messages } = get();
        if (appId && appId !== 'demo') {
          const state = {
            appName,
            appDescription,
            screens,
            messages,
            timestamp: Date.now()
          };
          localStorage.setItem(`appforge_${appId}`, JSON.stringify(state));
        }
      },
      
      // Load state from localStorage
      loadState: () => {
        const { appId, setAppName, setAppDescription, clearScreens, addScreen, clearMessages, addMessage } = get();
        if (appId && appId !== 'demo') {
          const stored = localStorage.getItem(`appforge_${appId}`);
          if (stored) {
            try {
              const state = JSON.parse(stored);
              setAppName(state.appName || 'My App');
              setAppDescription(state.appDescription || '');
              
              clearScreens();
              if (state.screens) {
                state.screens.forEach((screen: AppScreen) => addScreen(screen));
              }
              
              clearMessages();
              if (state.messages) {
                state.messages.forEach((message: ChatMessage) => addMessage({
                  app_id: message.app_id,
                  role: message.role,
                  content: message.content,
                  version_number: message.version_number,
                  tokens_used: message.tokens_used,
                  model: message.model,
                }));
              }
            } catch (error) {
              console.error('Failed to load saved state:', error);
            }
          }
        }
      },
    }),
    {
      name: 'builder-store',
    }
  )
);