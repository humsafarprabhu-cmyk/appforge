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
  
  // Actions
  setAppId: (id: string) => void;
  setAppName: (name: string) => void;
  setAppDescription: (description: string) => void;
  
  addMessage: (message: Omit<ChatMessage, 'id' | 'created_at'>) => void;
  setIsGenerating: (generating: boolean) => void;
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
      
      appId: null,
      appName: 'My New App',
      appDescription: '',
      
      screens: [],
      currentScreen: 0,
      
      deviceFrame: 'iphone15',
      theme: 'dark',
      
      chatInputValue: '',
      isChatExpanded: false,
      
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
      
      // Generate app (real API implementation)
      generateApp: async (prompt) => {
        const { addMessage, setIsGenerating, clearScreens, addScreen, setAppName, setAppDescription, appId } = get();
        
        setIsGenerating(true);
        
        // Add user message
        addMessage({
          app_id: appId || 'new-app',
          role: 'user',
          content: prompt,
          version_number: 1,
          tokens_used: null,
          model: null,
        });

        // Add AI response message first
        addMessage({
          app_id: appId || 'new-app',
          role: 'assistant',
          content: `I'll build that for you! Creating a ${prompt.toLowerCase()} with modern design and functionality. This will include user interface, data management, and responsive design.`,
          version_number: 1,
          tokens_used: 150,
          model: 'gpt-4o',
        });
        
        try {
          // For demo app, use mock data but still call API for new apps
          if (appId === 'demo') {
            // Keep demo behavior for demo app
            await new Promise(resolve => setTimeout(resolve, 3000));
            
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
          } else {
            // Make real API call for non-demo apps
            const response = await fetch('/api/generate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt,
                appId: appId || 'new-app',
                category: 'custom', // TODO: get from app data
              }),
            });

            if (!response.ok) {
              throw new Error(`API call failed: ${response.status}`);
            }

            const result = await response.json();
            
            if (!result.success) {
              throw new Error(result.message || 'Failed to generate app');
            }

            // Clear existing screens and add new ones
            clearScreens();
            
            // Set app metadata
            if (result.appName) {
              setAppName(result.appName);
            }
            if (result.description) {
              setAppDescription(result.description);
            }

            // Add all screens from API response
            if (result.screens && Array.isArray(result.screens)) {
              result.screens.forEach((screen: { name: string; html: string }) => {
                addScreen(screen);
              });
            }
          }
          
          // Add system success message
          addMessage({
            app_id: appId || 'new-app',
            role: 'system',
            content: 'App generated successfully! Your app is ready with multiple screens.',
            version_number: 1,
            tokens_used: null,
            model: null,
          });

          // Set current screen to first screen
          set({ currentScreen: 0 });
          
        } catch (error) {
          console.error('API generation error:', error);
          
          // Add error message
          addMessage({
            app_id: appId || 'new-app',
            role: 'system',
            content: 'Failed to generate app. Please try again or contact support.',
            version_number: 1,
            tokens_used: null,
            model: null,
          });
          
          // Fallback: add a simple screen so user isn't left with nothing
          addScreen({
            name: 'Home',
            html: `
              <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif; text-align: center;">
                <h1 style="font-size: 28px; margin-bottom: 30px;">Your App</h1>
                <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; backdrop-filter: blur(10px);">
                  <p style="margin: 0;">Unable to generate custom app at this time. Please try again later.</p>
                  <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.7;">Your prompt: "${prompt}"</p>
                </div>
              </div>
            `
          });
        }
        
        setIsGenerating(false);
      },
    }),
    {
      name: 'builder-store',
    }
  )
);