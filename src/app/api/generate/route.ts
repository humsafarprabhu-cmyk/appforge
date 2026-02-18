import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OPENAI_MODEL, MAX_CODE_TOKENS } from '@/config/constants';

// Use Edge Runtime for longer timeout (300s vs 10s on serverless)
export const runtime = 'edge';
export const maxDuration = 60;

interface GenerateRequest {
  prompt: string;
  appId: string;
  messages?: { role: string; content: string }[]; // chat history for context
  currentScreens?: { name: string; html: string }[]; // existing screens
  appName?: string;
  category?: string;
  mode?: 'initial' | 'update';
}

interface GeneratedScreen {
  name: string;
  html: string;
}

interface GenerateResponse {
  screens: GeneratedScreen[];
  appName: string;
  description: string;
  success: boolean;
  message?: string;
}

// System prompt for AI generation
function getSystemPrompt(mode: 'initial' | 'update', currentScreens?: { name: string; html: string }[]) {
  if (mode === 'update' && currentScreens) {
    return `You are an expert mobile app developer specialized in creating modern, responsive web-based mobile applications.

CONTEXT: Here are the current screens of the app:
${currentScreens.map(screen => `Screen "${screen.name}": ${screen.html.slice(0, 500)}...`).join('\n\n')}

The user wants to make changes to the app. You must:
1. Update ONLY the screens that need changes based on the user's request
2. Return ALL screens in the response (changed + unchanged)
3. Maintain consistency across all screens (same nav bar, same color scheme, same header style)
4. Keep the same screen names and structure
5. Only modify the content/functionality that the user specifically requested

Each screen MUST be:
- A complete HTML5 document starting with <!DOCTYPE html>
- Include proper <head> section with meta tags and title
- Include <body> with full app content
- MUST include: <script src="https://cdn.tailwindcss.com"></script> in head
- MUST include Inter font: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
- Use dark theme colors: bg-[#0a0a0f] or bg-gray-950
- Glass cards: bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
- Gradients on headers and CTAs: bg-gradient-to-r from-blue-500 to-purple-600
- Each screen MINIMUM 150+ lines of HTML with rich, interactive content
- Include bottom navigation bar on every screen
- Include status bar at top with time and battery icons
- Interactive elements like buttons, inputs, toggles with proper hover/focus states
- Use modern CSS animations and transitions
- Mobile-first responsive design
- Self-contained with no external dependencies except CDNs mentioned

Return ALL ${currentScreens.length} screens in this exact format:
{
  "screens": [
    ${currentScreens.map(screen => `{"name": "${screen.name}", "html": "complete HTML5 document"}`).join(',\n    ')}
  ],
  "appName": "App Name",
  "description": "Brief app description"
}`;
  } else {
    return `You are an expert mobile app developer specialized in creating modern, responsive web-based mobile applications. 

Generate EXACTLY 5 complete HTML pages for mobile app screens based on user requirements. Each screen MUST be:

1. A complete HTML5 document starting with <!DOCTYPE html>
2. Include proper <head> section with meta tags and title
3. Include <body> with full app content
4. MUST include: <script src="https://cdn.tailwindcss.com"></script> in head
5. MUST include Inter font: <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
6. Use dark theme colors: bg-[#0a0a0f] or bg-gray-950
7. Glass cards: bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl
8. Gradients on headers and CTAs: bg-gradient-to-r from-blue-500 to-purple-600
9. Each screen MINIMUM 200+ lines of HTML with rich, interactive content
10. EXACTLY 5 screens with these names: Home, Feature1, Feature2, Profile, Settings
11. Include bottom navigation bar on every screen
12. Include status bar at top with time and battery icons
13. Interactive elements like buttons, inputs, toggles with proper hover/focus states
14. Use modern CSS animations and transitions
15. Mobile-first responsive design
16. Self-contained with no external dependencies except CDNs mentioned

The 5 screens must be:
- Home: Main dashboard/overview screen
- Feature1: Primary feature of the app
- Feature2: Secondary feature of the app  
- Profile: User profile/account screen
- Settings: App settings and configuration

Each screen should feel like a real, polished mobile app with attention to detail, proper spacing, beautiful typography, and smooth interactions.

Respond ONLY with valid JSON in this exact format:
{
  "screens": [
    {"name": "Home", "html": "complete HTML5 document"},
    {"name": "Feature1", "html": "complete HTML5 document"},
    {"name": "Feature2", "html": "complete HTML5 document"},
    {"name": "Profile", "html": "complete HTML5 document"},
    {"name": "Settings", "html": "complete HTML5 document"}
  ],
  "appName": "Generated App Name",
  "description": "Brief app description"
}`;
  }
}

// Generate HTML template for a given screen
function generateScreenTemplate(category: string, screenType: string): string {
  const baseTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(255,255,255,0.05); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); }
        .gradient-bg { {{GRADIENT}} }
        .status-bar { position: fixed; top: 0; left: 0; right: 0; height: 44px; background: rgba(0,0,0,0.9); z-index: 50; }
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; height: 80px; background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); z-index: 50; }
        .content { padding-top: 60px; padding-bottom: 96px; }
        .float { animation: float 6s ease-in-out infinite; }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body class="bg-[#0a0a0f] text-white min-h-screen">
    <!-- Status Bar -->
    <div class="status-bar flex items-center justify-between px-6 text-white text-sm">
        <div>9:41</div>
        <div class="flex items-center gap-1">
            <div class="w-4 h-2 bg-white rounded-sm opacity-60"></div>
            <div class="w-6 h-3 border border-white rounded-sm opacity-80">
                <div class="w-4 h-2 bg-white rounded-sm ml-0.5 mt-0.5"></div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="gradient-bg min-h-screen">
        <div class="content max-w-md mx-auto p-6">
            {{CONTENT}}
        </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-nav flex items-center justify-around px-4">
        {{NAV}}
    </div>
</body>
</html>`;

  // Define content and navigation based on category and screen type
  const content = getScreenContent(category, screenType);
  const gradient = getGradient(category);
  const title = getTitle(category, screenType);
  const nav = getBottomNav(category);

  return baseTemplate
    .replace('{{TITLE}}', title)
    .replace('{{GRADIENT}}', gradient)
    .replace('{{CONTENT}}', content)
    .replace('{{NAV}}', nav);
}

function getGradient(category: string): string {
  const gradients = {
    fitness: 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    food: 'background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);',
    education: 'background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);',
    productivity: 'background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);',
    ecommerce: 'background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);',
    social: 'background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);'
  };
  return gradients[category as keyof typeof gradients] || gradients.fitness;
}

function getTitle(category: string, screenType: string): string {
  const titles = {
    fitness: { Home: 'FitTracker', Feature1: 'Workouts', Feature2: 'Progress', Profile: 'Profile', Settings: 'Settings' },
    food: { Home: 'RecipeBook', Feature1: 'Recipes', Feature2: 'Meal Planner', Profile: 'Profile', Settings: 'Settings' },
    education: { Home: 'StudyBuddy', Feature1: 'Courses', Feature2: 'Flashcards', Profile: 'Profile', Settings: 'Settings' },
    productivity: { Home: 'TaskMaster', Feature1: 'Tasks', Feature2: 'Calendar', Profile: 'Profile', Settings: 'Settings' },
    ecommerce: { Home: 'ShopApp', Feature1: 'Products', Feature2: 'Cart', Profile: 'Profile', Settings: 'Settings' },
    social: { Home: 'ConnectMe', Feature1: 'Posts', Feature2: 'Messages', Profile: 'Profile', Settings: 'Settings' }
  };
  return titles[category as keyof typeof titles]?.[screenType as keyof (typeof titles)[keyof typeof titles]] || 'App';
}

function getBottomNav(category: string): string {
  const icons = {
    fitness: ['🏠', '💪', '📊', '👤', '⚙️'],
    food: ['🏠', '🍳', '📅', '👤', '⚙️'],
    education: ['🏠', '📚', '📋', '👤', '⚙️'],
    productivity: ['🏠', '✅', '📅', '👤', '⚙️'],
    ecommerce: ['🏠', '🛍️', '🛒', '👤', '⚙️'],
    social: ['🏠', '📝', '💬', '👤', '⚙️']
  };
  
  const categoryIcons = icons[category as keyof typeof icons] || icons.fitness;
  
  return categoryIcons.map((icon, index) => 
    `<button class="flex flex-col items-center p-2 text-white/60 hover:text-white transition-colors">
      <div class="text-2xl mb-1">${icon}</div>
      <div class="text-xs"></div>
    </button>`
  ).join('');
}

function getScreenContent(category: string, screenType: string): string {
  if (screenType === 'Home') {
    const homeContent = {
      fitness: `
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-3xl">💪</span>
          </div>
          <h1 class="text-4xl font-bold mb-3">FitTracker Pro</h1>
          <p class="text-white/80">Your fitness journey starts here!</p>
        </div>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="glass rounded-2xl p-4 text-center">
            <div class="text-2xl font-bold text-green-400 mb-1">12,450</div>
            <div class="text-xs text-white/70">Steps Today</div>
            <div class="w-full bg-white/20 rounded-full h-1 mt-2">
              <div class="bg-green-400 h-1 rounded-full w-3/4"></div>
            </div>
          </div>
          <div class="glass rounded-2xl p-4 text-center">
            <div class="text-2xl font-bold text-blue-400 mb-1">420</div>
            <div class="text-xs text-white/70">Calories Burned</div>
            <div class="w-full bg-white/20 rounded-full h-1 mt-2">
              <div class="bg-blue-400 h-1 rounded-full w-2/3"></div>
            </div>
          </div>
        </div>

        <!-- Today's Workout -->
        <div class="glass rounded-3xl p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">Today's Workout</h3>
            <span class="text-sm bg-green-500/20 text-green-400 px-3 py-1 rounded-full">Active</span>
          </div>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-4">
                  <span class="text-xl">🏃</span>
                </div>
                <div>
                  <div class="font-semibold">Morning Run</div>
                  <div class="text-sm text-white/60">30 minutes • 5.2 km</div>
                </div>
              </div>
              <div class="text-green-400 font-semibold">✓</div>
            </div>
            <div class="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div class="flex items-center">
                <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                  <span class="text-xl">💪</span>
                </div>
                <div>
                  <div class="font-semibold">Upper Body Strength</div>
                  <div class="text-sm text-white/60">45 minutes • 8 exercises</div>
                </div>
              </div>
              <div class="text-white/40">○</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <button class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform">
            <div class="text-3xl mb-2">🎯</div>
            <div class="font-semibold text-sm">Set Goals</div>
          </button>
          <button class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform">
            <div class="text-3xl mb-2">📊</div>
            <div class="font-semibold text-sm">View Progress</div>
          </button>
        </div>

        <!-- Start Workout Button -->
        <button class="w-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform shadow-lg">
          Start New Workout
        </button>
      `,
      food: `
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-3xl">🍳</span>
          </div>
          <h1 class="text-4xl font-bold mb-3">RecipeBook</h1>
          <p class="text-white/80">Discover amazing recipes today</p>
        </div>
        
        <!-- Featured Recipe -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Recipe of the Day</h3>
          <div class="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-4 mb-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h4 class="font-semibold text-lg">Spicy Thai Curry</h4>
                <div class="flex items-center text-sm text-white/60">
                  <span>⭐ 4.8</span>
                  <span class="mx-2">•</span>
                  <span>30 min</span>
                  <span class="mx-2">•</span>
                  <span>🌶️ Medium</span>
                </div>
              </div>
              <div class="text-3xl">🍛</div>
            </div>
            <p class="text-sm text-white/80 mb-3">A delicious and authentic Thai curry with coconut milk, vegetables, and aromatic spices.</p>
            <button class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
              Start Cooking
            </button>
          </div>
        </div>

        <!-- Categories -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Popular Categories</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform">
              <div class="text-2xl mb-2">🥗</div>
              <div class="font-semibold text-sm">Healthy</div>
              <div class="text-xs text-white/60">245 recipes</div>
            </div>
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform">
              <div class="text-2xl mb-2">🍰</div>
              <div class="font-semibold text-sm">Desserts</div>
              <div class="text-xs text-white/60">189 recipes</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Recently Cooked</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="text-lg mr-3">🍝</div>
                <div class="text-sm">Pasta Carbonara</div>
              </div>
              <div class="text-xs text-white/60">2 days ago</div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="text-lg mr-3">🥘</div>
                <div class="text-sm">Chicken Tikka</div>
              </div>
              <div class="text-xs text-white/60">5 days ago</div>
            </div>
          </div>
        </div>

        <button class="w-full bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Explore Recipes
        </button>
      `,
      education: `
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-3xl">📚</span>
          </div>
          <h1 class="text-4xl font-bold mb-3">StudyBuddy</h1>
          <p class="text-white/80">Learn something new today!</p>
        </div>
        
        <!-- Progress Overview -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Today's Progress</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-white/80">Study Streak</span>
              <div class="flex items-center">
                <span class="font-semibold mr-2">7 days</span>
                <span class="text-xl">🔥</span>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-white/80">Lessons Completed</span>
              <span class="font-semibold">12/15</span>
            </div>
            <div class="h-2 bg-white/20 rounded-full overflow-hidden">
              <div class="h-full w-4/5 bg-gradient-to-r from-indigo-400 to-cyan-400 rounded-full"></div>
            </div>
          </div>
        </div>

        <!-- Current Courses -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Continue Learning</h3>
          <div class="space-y-4">
            <div class="glass rounded-2xl p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                    <span class="text-lg">🧮</span>
                  </div>
                  <div>
                    <div class="font-semibold">Advanced Mathematics</div>
                    <div class="text-xs text-white/60">Chapter 5: Calculus</div>
                  </div>
                </div>
                <div class="text-blue-400 text-sm font-semibold">75%</div>
              </div>
              <div class="w-full bg-white/20 rounded-full h-1">
                <div class="bg-blue-400 h-1 rounded-full w-3/4"></div>
              </div>
            </div>
            
            <div class="glass rounded-2xl p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                    <span class="text-lg">🧪</span>
                  </div>
                  <div>
                    <div class="font-semibold">Chemistry Basics</div>
                    <div class="text-xs text-white/60">Lab 3: Reactions</div>
                  </div>
                </div>
                <div class="text-green-400 text-sm font-semibold">42%</div>
              </div>
              <div class="w-full bg-white/20 rounded-full h-1">
                <div class="bg-green-400 h-1 rounded-full w-2/5"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Study Goals -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Daily Goals</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-white/80">📖 Read 3 chapters</span>
              <span class="text-green-400">✓</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-white/80">✍️ Complete 2 exercises</span>
              <span class="text-yellow-400">1/2</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-white/80">⏰ Study for 2 hours</span>
              <span class="text-white/40">0/2</span>
            </div>
          </div>
        </div>

        <button class="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Start Learning
        </button>
      `,
      productivity: `
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-3xl">✅</span>
          </div>
          <h1 class="text-4xl font-bold mb-3">TaskMaster</h1>
          <p class="text-white/80">Organize your productivity</p>
        </div>
        
        <!-- Today's Summary -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Today's Overview</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-green-400">8</div>
              <div class="text-xs text-white/60">Completed</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-yellow-400">3</div>
              <div class="text-xs text-white/60">In Progress</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-400">2</div>
              <div class="text-xs text-white/60">Overdue</div>
            </div>
          </div>
        </div>

        <!-- Urgent Tasks -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center">
            <span class="text-red-400 mr-2">🔥</span>
            Urgent Tasks
          </h3>
          <div class="space-y-3">
            <div class="glass rounded-2xl p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input type="checkbox" class="mr-3 w-5 h-5 rounded border-white/30">
                  <div>
                    <div class="font-semibold">Prepare presentation</div>
                    <div class="text-xs text-red-400">Due: Today 2:00 PM</div>
                  </div>
                </div>
                <div class="text-red-400">🔴</div>
              </div>
            </div>
            
            <div class="glass rounded-2xl p-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input type="checkbox" class="mr-3 w-5 h-5 rounded border-white/30">
                  <div>
                    <div class="font-semibold">Review budget report</div>
                    <div class="text-xs text-yellow-400">Due: Tomorrow</div>
                  </div>
                </div>
                <div class="text-yellow-400">🟡</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Projects -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Recent Projects</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-sm">📊</span>
                </div>
                <div class="text-sm">Q4 Analytics</div>
              </div>
              <div class="text-xs text-white/60">85% complete</div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-sm">🎨</span>
                </div>
                <div class="text-sm">Brand Redesign</div>
              </div>
              <div class="text-xs text-white/60">60% complete</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <button class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform">
            <div class="text-2xl mb-2">➕</div>
            <div class="font-semibold text-sm">Add Task</div>
          </button>
          <button class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform">
            <div class="text-2xl mb-2">📅</div>
            <div class="font-semibold text-sm">Calendar</div>
          </button>
        </div>

        <button class="w-full bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Create New Task
        </button>
      `,
      ecommerce: `
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-3xl">🛍️</span>
          </div>
          <h1 class="text-4xl font-bold mb-3">ShopApp</h1>
          <p class="text-white/80">Discover amazing products</p>
        </div>
        
        <!-- Search Bar -->
        <div class="glass rounded-2xl p-4 mb-6">
          <div class="flex items-center">
            <span class="text-xl mr-3">🔍</span>
            <input type="text" placeholder="Search products..." class="flex-1 bg-transparent text-white placeholder-white/60 outline-none">
            <button class="bg-pink-500 text-white px-4 py-2 rounded-lg text-sm font-semibold ml-3">Search</button>
          </div>
        </div>

        <!-- Featured Products -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Featured Products</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="glass rounded-2xl p-4 hover:scale-105 transition-transform">
              <div class="w-full h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl mb-3 flex items-center justify-center">
                <span class="text-3xl">📱</span>
              </div>
              <div class="font-semibold text-sm mb-1">Smartphone Pro</div>
              <div class="text-pink-400 font-bold text-lg">$899</div>
              <div class="text-xs text-white/60">⭐ 4.8 (124 reviews)</div>
            </div>
            
            <div class="glass rounded-2xl p-4 hover:scale-105 transition-transform">
              <div class="w-full h-24 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl mb-3 flex items-center justify-center">
                <span class="text-3xl">🎧</span>
              </div>
              <div class="font-semibold text-sm mb-1">Wireless Earbuds</div>
              <div class="text-pink-400 font-bold text-lg">$199</div>
              <div class="text-xs text-white/60">⭐ 4.6 (89 reviews)</div>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Shop by Category</h3>
          <div class="grid grid-cols-4 gap-3">
            <div class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
              <div class="text-2xl mb-1">👕</div>
              <div class="text-xs">Fashion</div>
            </div>
            <div class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
              <div class="text-2xl mb-1">💻</div>
              <div class="text-xs">Tech</div>
            </div>
            <div class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
              <div class="text-2xl mb-1">🏠</div>
              <div class="text-xs">Home</div>
            </div>
            <div class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
              <div class="text-2xl mb-1">⚽</div>
              <div class="text-xs">Sports</div>
            </div>
          </div>
        </div>

        <!-- Your Orders -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Recent Orders</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-green-400 text-xs">✓</span>
                </div>
                <div class="text-sm">Bluetooth Speaker</div>
              </div>
              <div class="text-xs text-green-400">Delivered</div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-yellow-400 text-xs">📦</span>
                </div>
                <div class="text-sm">Gaming Mouse</div>
              </div>
              <div class="text-xs text-yellow-400">Shipping</div>
            </div>
          </div>
        </div>

        <button class="w-full bg-gradient-to-r from-pink-500 to-rose-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          View Cart (3 items)
        </button>
      `,
      social: `
        <div class="text-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-3xl">👥</span>
          </div>
          <h1 class="text-4xl font-bold mb-3">ConnectMe</h1>
          <p class="text-white/80">Stay connected with friends</p>
        </div>
        
        <!-- Stories -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Stories</h3>
          <div class="flex space-x-4 overflow-x-auto pb-2">
            <div class="flex-shrink-0 text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-1 mb-2">
                <div class="w-full h-full bg-gray-800 rounded-full flex items-center justify-center">
                  <span class="text-xl">➕</span>
                </div>
              </div>
              <div class="text-xs">Your Story</div>
            </div>
            <div class="flex-shrink-0 text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full p-1 mb-2">
                <div class="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                  <span class="text-xl">😊</span>
                </div>
              </div>
              <div class="text-xs">Emma</div>
            </div>
            <div class="flex-shrink-0 text-center">
              <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-full p-1 mb-2">
                <div class="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                  <span class="text-xl">🎉</span>
                </div>
              </div>
              <div class="text-xs">Alex</div>
            </div>
          </div>
        </div>

        <!-- Recent Posts -->
        <div class="space-y-4 mb-6">
          <div class="glass rounded-2xl p-4">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center mr-3">
                <span class="text-lg">😊</span>
              </div>
              <div>
                <div class="font-semibold text-sm">Emma Johnson</div>
                <div class="text-xs text-white/60">2 hours ago</div>
              </div>
            </div>
            <p class="text-sm text-white/80 mb-3">Just finished my morning workout! Feeling energized for the day ahead 💪</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 text-xs">
                <button class="flex items-center text-pink-400">
                  <span class="mr-1">❤️</span>
                  <span>24</span>
                </button>
                <button class="flex items-center text-white/60">
                  <span class="mr-1">💬</span>
                  <span>5</span>
                </button>
                <button class="flex items-center text-white/60">
                  <span class="mr-1">📤</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>

          <div class="glass rounded-2xl p-4">
            <div class="flex items-center mb-3">
              <div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                <span class="text-lg">🎉</span>
              </div>
              <div>
                <div class="font-semibold text-sm">Alex Chen</div>
                <div class="text-xs text-white/60">5 hours ago</div>
              </div>
            </div>
            <p class="text-sm text-white/80 mb-3">Celebrating my promotion today! Thanks to everyone who supported me 🎉</p>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 text-xs">
                <button class="flex items-center text-pink-400">
                  <span class="mr-1">❤️</span>
                  <span>156</span>
                </button>
                <button class="flex items-center text-white/60">
                  <span class="mr-1">💬</span>
                  <span>32</span>
                </button>
                <button class="flex items-center text-white/60">
                  <span class="mr-1">📤</span>
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-3 gap-3 mb-6">
          <button class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
            <div class="text-2xl mb-1">📝</div>
            <div class="text-xs">Post</div>
          </button>
          <button class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
            <div class="text-2xl mb-1">👥</div>
            <div class="text-xs">Friends</div>
          </button>
          <button class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
            <div class="text-2xl mb-1">💬</div>
            <div class="text-xs">Messages</div>
          </button>
        </div>

        <button class="w-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Create New Post
        </button>
      `
    };
    
    return homeContent[category as keyof typeof homeContent] || homeContent.fitness;
  }
  
  if (screenType === 'Profile') {
    const profileContent = {
      fitness: `
        <div class="text-center mb-8">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              💪
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Pro
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2">Alex Johnson</h2>
          <p class="text-white/70">Fitness Enthusiast • Level 12</p>
        </div>

        <!-- Stats Overview -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Your Stats</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-blue-400">124</div>
              <div class="text-sm text-white/70">Workouts</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-400">89%</div>
              <div class="text-sm text-white/70">Goal Rate</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-orange-400">15</div>
              <div class="text-sm text-white/70">Day Streak</div>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3 flex items-center">
            <span class="text-yellow-400 mr-2">🏆</span>
            Recent Achievements
          </h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">🔥</span>
                <span class="text-sm">15-Day Streak</span>
              </div>
              <span class="text-xs text-white/60">2 days ago</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">💪</span>
                <span class="text-sm">100 Workouts</span>
              </div>
              <span class="text-xs text-white/60">1 week ago</span>
            </div>
          </div>
        </div>

        <!-- Profile Options -->
        <div class="space-y-3 mb-6">
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-blue-400">✏️</span>
              </div>
              <span>Edit Profile</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
          
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-purple-400">📊</span>
              </div>
              <span>Workout History</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
          
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-green-400">🎯</span>
              </div>
              <span>Goals & Targets</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
        </div>

        <!-- Membership Info -->
        <div class="glass rounded-2xl p-4 mb-6 border border-green-500/30">
          <div class="flex items-center justify-between mb-2">
            <span class="font-semibold text-green-400">Premium Member</span>
            <span class="text-xs bg-green-500 text-white px-2 py-1 rounded-full">ACTIVE</span>
          </div>
          <p class="text-xs text-white/60">Unlimited workouts • Advanced analytics • Priority support</p>
        </div>
      `,
      food: `
        <div class="text-center mb-8">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              👨‍🍳
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
              Chef
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2">Sarah Martinez</h2>
          <p class="text-white/70">Home Chef • 89 recipes cooked</p>
        </div>

        <!-- Cooking Stats -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Cooking Journey</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-orange-400">89</div>
              <div class="text-sm text-white/70">Recipes</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-red-400">4.8</div>
              <div class="text-sm text-white/70">Avg Rating</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-yellow-400">12</div>
              <div class="text-sm text-white/70">Favorites</div>
            </div>
          </div>
        </div>

        <!-- Dietary Preferences -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Dietary Preferences</h4>
          <div class="flex flex-wrap gap-2">
            <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">Vegetarian</span>
            <span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">Low Carb</span>
            <span class="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs">Gluten Free</span>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Recently Cooked</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">🍝</span>
                <div>
                  <div class="text-sm font-medium">Pasta Carbonara</div>
                  <div class="text-xs text-white/60">⭐ 4.8 • Italian</div>
                </div>
              </div>
              <span class="text-xs text-white/60">2 days ago</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">🥗</span>
                <div>
                  <div class="text-sm font-medium">Greek Salad</div>
                  <div class="text-xs text-white/60">⭐ 4.5 • Healthy</div>
                </div>
              </div>
              <span class="text-xs text-white/60">1 week ago</span>
            </div>
          </div>
        </div>

        <!-- Profile Settings -->
        <div class="space-y-3">
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-orange-400">📝</span>
              </div>
              <span>My Recipes</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
          
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-red-400">❤️</span>
              </div>
              <span>Favorites</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
        </div>
      `,
      education: `
        <div class="text-center mb-8">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              🎓
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
              Scholar
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2">Emily Chen</h2>
          <p class="text-white/70">Computer Science Student • Grade A</p>
        </div>

        <!-- Academic Progress -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Academic Progress</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-indigo-400">15</div>
              <div class="text-sm text-white/70">Courses</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-cyan-400">92%</div>
              <div class="text-sm text-white/70">Avg Score</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-400">28</div>
              <div class="text-sm text-white/70">Day Streak</div>
            </div>
          </div>
        </div>

        <!-- Current Courses -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Current Courses</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">🧮</span>
                <div>
                  <div class="text-sm font-medium">Advanced Mathematics</div>
                  <div class="text-xs text-white/60">Progress: 85%</div>
                </div>
              </div>
              <span class="text-green-400 text-sm">A</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">💻</span>
                <div>
                  <div class="text-sm font-medium">Data Structures</div>
                  <div class="text-xs text-white/60">Progress: 92%</div>
                </div>
              </div>
              <span class="text-green-400 text-sm">A+</span>
            </div>
          </div>
        </div>

        <!-- Study Habits -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Study Statistics</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-lg font-bold text-blue-400">4.2hrs</div>
              <div class="text-xs text-white/60">Daily Average</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-bold text-purple-400">156</div>
              <div class="text-xs text-white/60">Flashcards</div>
            </div>
          </div>
        </div>

        <!-- Profile Actions -->
        <div class="space-y-3">
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-indigo-400">📚</span>
              </div>
              <span>Study History</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
          
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-cyan-400">🎯</span>
              </div>
              <span>Learning Goals</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
        </div>
      `,
      productivity: `
        <div class="text-center mb-8">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              💼
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Pro
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2">Michael Davis</h2>
          <p class="text-white/70">Project Manager • 95% completion rate</p>
        </div>

        <!-- Productivity Stats -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Productivity Insights</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-green-400">342</div>
              <div class="text-sm text-white/70">Tasks Done</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-teal-400">95%</div>
              <div class="text-sm text-white/70">On Time</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-400">12</div>
              <div class="text-sm text-white/70">Projects</div>
            </div>
          </div>
        </div>

        <!-- Current Projects -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Active Projects</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">📊</span>
                <div>
                  <div class="text-sm font-medium">Q4 Analytics Dashboard</div>
                  <div class="text-xs text-white/60">Due in 5 days</div>
                </div>
              </div>
              <span class="text-green-400 text-sm">85%</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">🎨</span>
                <div>
                  <div class="text-sm font-medium">Brand Redesign</div>
                  <div class="text-xs text-white/60">Due in 12 days</div>
                </div>
              </div>
              <span class="text-yellow-400 text-sm">60%</span>
            </div>
          </div>
        </div>

        <!-- Work Preferences -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Work Preferences</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-white/80">Preferred work hours</span>
              <span>9 AM - 6 PM</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/80">Break intervals</span>
              <span>Every 90 minutes</span>
            </div>
            <div class="flex justify-between">
              <span class="text-white/80">Notification style</span>
              <span>Minimal</span>
            </div>
          </div>
        </div>

        <!-- Profile Options -->
        <div class="space-y-3">
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-green-400">📈</span>
              </div>
              <span>Analytics</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
          
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-teal-400">⚙️</span>
              </div>
              <span>Preferences</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
        </div>
      `,
      ecommerce: `
        <div class="text-center mb-8">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              👤
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
              VIP
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2">Jessica Wilson</h2>
          <p class="text-white/70">Premium Shopper • Member since 2021</p>
        </div>

        <!-- Shopping Stats -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Shopping Summary</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-pink-400">47</div>
              <div class="text-sm text-white/70">Orders</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-rose-400">$2,340</div>
              <div class="text-sm text-white/70">Total Spent</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-purple-400">156</div>
              <div class="text-sm text-white/70">Saved Items</div>
            </div>
          </div>
        </div>

        <!-- Recent Orders -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Recent Orders</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">📱</span>
                <div>
                  <div class="text-sm font-medium">iPhone 15 Pro</div>
                  <div class="text-xs text-green-400">Delivered</div>
                </div>
              </div>
              <span class="text-sm font-bold">$999</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">🎧</span>
                <div>
                  <div class="text-sm font-medium">AirPods Pro</div>
                  <div class="text-xs text-yellow-400">In Transit</div>
                </div>
              </div>
              <span class="text-sm font-bold">$249</span>
            </div>
          </div>
        </div>

        <!-- Membership Benefits -->
        <div class="glass rounded-2xl p-4 mb-6 border border-pink-500/30">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-semibold text-pink-400">VIP Membership</h4>
            <span class="text-xs bg-pink-500 text-white px-2 py-1 rounded-full">ACTIVE</span>
          </div>
          <div class="text-sm text-white/80 space-y-1">
            <div>✓ Free shipping on all orders</div>
            <div>✓ 20% off exclusive items</div>
            <div>✓ Early access to sales</div>
          </div>
        </div>

        <!-- Profile Settings -->
        <div class="space-y-3">
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-pink-400">📦</span>
              </div>
              <span>Order History</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
          
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-rose-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-rose-400">❤️</span>
              </div>
              <span>Wishlist</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
        </div>
      `,
      social: `
        <div class="text-center mb-8">
          <div class="relative">
            <div class="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
              😊
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Online
            </div>
          </div>
          <h2 class="text-2xl font-bold mb-2">Emma Rodriguez</h2>
          <p class="text-white/70">Content Creator • 1.2K followers</p>
        </div>

        <!-- Social Stats -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Social Activity</h3>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-purple-400">1.2K</div>
              <div class="text-sm text-white/70">Followers</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-pink-400">856</div>
              <div class="text-sm text-white/70">Following</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-400">342</div>
              <div class="text-sm text-white/70">Posts</div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Recent Activity</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">❤️</span>
                <span class="text-sm">Liked 5 posts</span>
              </div>
              <span class="text-xs text-white/60">2 hours ago</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">📝</span>
                <span class="text-sm">Posted a new photo</span>
              </div>
              <span class="text-xs text-white/60">5 hours ago</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <span class="text-lg mr-3">👥</span>
                <span class="text-sm">Followed 3 people</span>
              </div>
              <span class="text-xs text-white/60">1 day ago</span>
            </div>
          </div>
        </div>

        <!-- Interests -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Interests</h4>
          <div class="flex flex-wrap gap-2">
            <span class="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs">Photography</span>
            <span class="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-xs">Travel</span>
            <span class="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">Food</span>
            <span class="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">Fitness</span>
          </div>
        </div>

        <!-- Profile Actions -->
        <div class="space-y-3">
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-purple-400">📝</span>
              </div>
              <span>My Posts</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
          
          <div class="glass rounded-2xl p-4 flex items-center justify-between hover:bg-white/10 transition-colors">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-pink-500/20 rounded-xl flex items-center justify-center mr-3">
                <span class="text-pink-400">👥</span>
              </div>
              <span>Friends</span>
            </div>
            <div class="text-white/60">›</div>
          </div>
        </div>
      `
    };

    return profileContent[category as keyof typeof profileContent] || profileContent.fitness;
  }

  if (screenType === 'Settings') {
    return `
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-3">Settings</h1>
        <p class="text-white/70">Customize your app experience</p>
      </div>

      <!-- App Preferences -->
      <div class="glass rounded-3xl p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">App Preferences</h3>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">🌙</span>
              <div>
                <div class="font-medium">Dark Mode</div>
                <div class="text-xs text-white/60">Easier on the eyes</div>
              </div>
            </div>
            <div class="w-12 h-6 bg-green-500 rounded-full flex items-center px-1 cursor-pointer">
              <div class="w-4 h-4 bg-white rounded-full ml-auto transition-all"></div>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">🔔</span>
              <div>
                <div class="font-medium">Push Notifications</div>
                <div class="text-xs text-white/60">Get updates and reminders</div>
              </div>
            </div>
            <div class="w-12 h-6 bg-blue-500 rounded-full flex items-center px-1 cursor-pointer">
              <div class="w-4 h-4 bg-white rounded-full ml-auto transition-all"></div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">🔊</span>
              <div>
                <div class="font-medium">Sound Effects</div>
                <div class="text-xs text-white/60">Audio feedback</div>
              </div>
            </div>
            <div class="w-12 h-6 bg-gray-600 rounded-full flex items-center px-1 cursor-pointer">
              <div class="w-4 h-4 bg-white rounded-full transition-all"></div>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">🌐</span>
              <div>
                <div class="font-medium">Language</div>
                <div class="text-xs text-white/60">English (US)</div>
              </div>
            </div>
            <div class="text-white/60">›</div>
          </div>
        </div>
      </div>

      <!-- Privacy & Security -->
      <div class="glass rounded-3xl p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Privacy & Security</h3>
        <div class="space-y-3">
          <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-xl mr-3">🔒</span>
              <span>Privacy Settings</span>
            </div>
            <div class="text-white/60">›</div>
          </button>
          
          <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-xl mr-3">🛡️</span>
              <span>Security & Login</span>
            </div>
            <div class="text-white/60">›</div>
          </button>
          
          <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-xl mr-3">📊</span>
              <span>Data & Analytics</span>
            </div>
            <div class="text-white/60">›</div>
          </button>
        </div>
      </div>

      <!-- Support & Legal -->
      <div class="glass rounded-3xl p-6 mb-6">
        <h3 class="text-lg font-semibold mb-4">Support & Legal</h3>
        <div class="space-y-3">
          <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-xl mr-3">❓</span>
              <span>Help Center</span>
            </div>
            <div class="text-white/60">›</div>
          </button>
          
          <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-xl mr-3">💬</span>
              <span>Contact Support</span>
            </div>
            <div class="text-white/60">›</div>
          </button>
          
          <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-xl mr-3">📄</span>
              <span>Privacy Policy</span>
            </div>
            <div class="text-white/60">›</div>
          </button>
          
          <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-xl mr-3">📋</span>
              <span>Terms of Service</span>
            </div>
            <div class="text-white/60">›</div>
          </button>
        </div>
      </div>

      <!-- App Info -->
      <div class="glass rounded-2xl p-4 mb-6">
        <h4 class="font-semibold mb-2">App Information</h4>
        <div class="text-sm text-white/70 space-y-1">
          <div class="flex justify-between">
            <span>Version</span>
            <span>2.1.0</span>
          </div>
          <div class="flex justify-between">
            <span>Build</span>
            <span>2024.01.15</span>
          </div>
          <div class="flex justify-between">
            <span>Storage Used</span>
            <span>124 MB</span>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="glass rounded-2xl p-4 border border-red-500/30">
        <h4 class="font-semibold mb-3 text-red-400">Danger Zone</h4>
        <div class="space-y-3">
          <button class="w-full text-left p-3 hover:bg-red-500/10 rounded-xl transition-colors text-red-400">
            Clear App Data
          </button>
          <button class="w-full text-left p-3 hover:bg-red-500/10 rounded-xl transition-colors text-red-400">
            Delete Account
          </button>
          <button class="w-full text-left p-3 hover:bg-red-500/10 rounded-xl transition-colors text-red-400 font-semibold">
            Sign Out
          </button>
        </div>
      </div>
    `;
  }

  // Feature1 and Feature2 screens - category specific
  const featureContent = {
    fitness: {
      Feature1: `
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-3">Workouts</h1>
          <p class="text-white/70">Choose from hundreds of workouts</p>
        </div>

        <!-- Workout Categories -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
            <div class="text-4xl mb-3">💪</div>
            <div class="font-semibold mb-1">Strength</div>
            <div class="text-xs text-white/60">45 workouts</div>
          </div>
          <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
            <div class="text-4xl mb-3">🏃</div>
            <div class="font-semibold mb-1">Cardio</div>
            <div class="text-xs text-white/60">32 workouts</div>
          </div>
        </div>

        <!-- Popular Workouts -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Popular This Week</h3>
          <div class="space-y-4">
            <div class="glass rounded-2xl p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-4">
                    <span class="text-2xl">🔥</span>
                  </div>
                  <div>
                    <div class="font-semibold">HIIT Blast</div>
                    <div class="text-xs text-white/60">20 min • High intensity</div>
                  </div>
                </div>
                <div class="text-orange-400 text-sm font-semibold">4.9★</div>
              </div>
              <p class="text-sm text-white/80 mb-3">High-intensity interval training to boost your metabolism and burn calories fast.</p>
              <button class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                Start Workout
              </button>
            </div>

            <div class="glass rounded-2xl p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                    <span class="text-2xl">💪</span>
                  </div>
                  <div>
                    <div class="font-semibold">Upper Body Power</div>
                    <div class="text-xs text-white/60">35 min • Strength</div>
                  </div>
                </div>
                <div class="text-purple-400 text-sm font-semibold">4.8★</div>
              </div>
              <p class="text-sm text-white/80 mb-3">Build muscle and strength in your chest, arms, and shoulders with this targeted routine.</p>
              <button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                Start Workout
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Start -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Quick Start</h4>
          <div class="grid grid-cols-3 gap-3">
            <button class="bg-blue-500/20 p-3 rounded-xl text-center hover:bg-blue-500/30 transition-colors">
              <div class="text-lg mb-1">⏰</div>
              <div class="text-xs">15 min</div>
            </button>
            <button class="bg-green-500/20 p-3 rounded-xl text-center hover:bg-green-500/30 transition-colors">
              <div class="text-lg mb-1">💚</div>
              <div class="text-xs">30 min</div>
            </button>
            <button class="bg-red-500/20 p-3 rounded-xl text-center hover:bg-red-500/30 transition-colors">
              <div class="text-lg mb-1">🔥</div>
              <div class="text-xs">45 min</div>
            </button>
          </div>
        </div>

        <button class="w-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Browse All Workouts
        </button>
      `,
      Feature2: `
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-3">Progress</h1>
          <p class="text-white/70">Track your fitness journey</p>
        </div>

        <!-- Weekly Overview -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">This Week</h3>
          <div class="grid grid-cols-2 gap-6">
            <div class="text-center">
              <div class="text-3xl font-bold text-green-400 mb-1">5</div>
              <div class="text-sm text-white/70">Workouts Completed</div>
              <div class="text-xs text-green-400">+2 from last week</div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-blue-400 mb-1">2.1K</div>
              <div class="text-sm text-white/70">Calories Burned</div>
              <div class="text-xs text-blue-400">+340 from last week</div>
            </div>
          </div>
        </div>

        <!-- Progress Charts -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-4">Weight Progress</h4>
          <div class="h-32 bg-white/5 rounded-xl relative overflow-hidden mb-3">
            <!-- Simulated chart -->
            <div class="absolute bottom-0 left-8 w-2 bg-blue-400 rounded-t" style="height: 40%"></div>
            <div class="absolute bottom-0 left-12 w-2 bg-blue-400 rounded-t" style="height: 45%"></div>
            <div class="absolute bottom-0 left-16 w-2 bg-blue-400 rounded-t" style="height: 38%"></div>
            <div class="absolute bottom-0 left-20 w-2 bg-blue-400 rounded-t" style="height: 52%"></div>
            <div class="absolute bottom-0 left-24 w-2 bg-blue-400 rounded-t" style="height: 48%"></div>
            <div class="absolute bottom-0 left-28 w-2 bg-blue-400 rounded-t" style="height: 55%"></div>
            <div class="absolute bottom-0 left-32 w-2 bg-green-400 rounded-t" style="height: 58%"></div>
          </div>
          <div class="text-center text-sm text-white/60">Last 7 days</div>
        </div>

        <!-- Body Measurements -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Body Measurements</h4>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-white/80">Weight</span>
              <div class="text-right">
                <div class="font-semibold">165 lbs</div>
                <div class="text-xs text-green-400">-2 lbs</div>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-white/80">Body Fat</span>
              <div class="text-right">
                <div class="font-semibold">18.2%</div>
                <div class="text-xs text-green-400">-0.8%</div>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-white/80">Muscle Mass</span>
              <div class="text-right">
                <div class="font-semibold">134 lbs</div>
                <div class="text-xs text-blue-400">+1.2 lbs</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Goals Progress -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Goal Progress</h4>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Lose 10 lbs</span>
                <span>70%</span>
              </div>
              <div class="h-2 bg-white/20 rounded-full">
                <div class="h-2 bg-green-400 rounded-full" style="width: 70%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm mb-1">
                <span>Workout 4x/week</span>
                <span>125%</span>
              </div>
              <div class="h-2 bg-white/20 rounded-full">
                <div class="h-2 bg-blue-400 rounded-full" style="width: 100%"></div>
              </div>
            </div>
          </div>
        </div>

        <button class="w-full bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          View Detailed Analytics
        </button>
      `
    },
    food: {
      Feature1: `
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-3">Recipes</h1>
          <p class="text-white/70">Discover delicious recipes</p>
        </div>

        <!-- Featured Recipe -->
        <div class="glass rounded-3xl p-6 mb-6">
          <div class="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl p-4 mb-4">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-xl font-semibold">Chef's Special</h3>
                <p class="text-sm text-white/60">Perfect for dinner</p>
              </div>
              <div class="text-4xl">🍝</div>
            </div>
            <h4 class="font-semibold mb-2">Creamy Tuscan Chicken</h4>
            <div class="flex items-center text-sm text-white/60 mb-3">
              <span>⭐ 4.9</span>
              <span class="mx-2">•</span>
              <span>45 min</span>
              <span class="mx-2">•</span>
              <span>4 servings</span>
            </div>
            <button class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-xl font-semibold">
              Cook This Recipe
            </button>
          </div>
        </div>

        <!-- Recipe Categories -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Browse by Category</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div class="text-3xl mb-2">🥗</div>
              <div class="font-semibold">Healthy</div>
              <div class="text-xs text-white/60">125 recipes</div>
            </div>
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div class="text-3xl mb-2">🍕</div>
              <div class="font-semibold">Comfort Food</div>
              <div class="text-xs text-white/60">89 recipes</div>
            </div>
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div class="text-3xl mb-2">🍰</div>
              <div class="font-semibold">Desserts</div>
              <div class="text-xs text-white/60">67 recipes</div>
            </div>
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div class="text-3xl mb-2">⚡</div>
              <div class="font-semibold">Quick & Easy</div>
              <div class="text-xs text-white/60">154 recipes</div>
            </div>
          </div>
        </div>

        <!-- Trending Recipes -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Trending Now</h3>
          <div class="space-y-3">
            <div class="glass rounded-2xl p-4 flex items-center">
              <div class="text-3xl mr-4">🌮</div>
              <div class="flex-1">
                <div class="font-semibold">Fish Tacos</div>
                <div class="text-xs text-white/60">25 min • Mexican • ⭐ 4.7</div>
              </div>
              <button class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors">
                View
              </button>
            </div>
            <div class="glass rounded-2xl p-4 flex items-center">
              <div class="text-3xl mr-4">🍜</div>
              <div class="flex-1">
                <div class="font-semibold">Ramen Bowl</div>
                <div class="text-xs text-white/60">35 min • Japanese • ⭐ 4.8</div>
              </div>
              <button class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm transition-colors">
                View
              </button>
            </div>
          </div>
        </div>

        <button class="w-full bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Explore All Recipes
        </button>
      `,
      Feature2: `
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-3">Meal Planner</h1>
          <p class="text-white/70">Plan your weekly meals</p>
        </div>

        <!-- This Week's Plan -->
        <div class="glass rounded-3xl p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-xl font-semibold">This Week</h3>
            <button class="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-lg text-sm">
              Edit Plan
            </button>
          </div>
          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-lg">🥗</span>
                </div>
                <div>
                  <div class="font-medium text-sm">Monday</div>
                  <div class="text-xs text-white/60">Caesar Salad</div>
                </div>
              </div>
              <div class="text-green-400 text-sm">✓</div>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-lg">🐟</span>
                </div>
                <div>
                  <div class="font-medium text-sm">Tuesday</div>
                  <div class="text-xs text-white/60">Grilled Salmon</div>
                </div>
              </div>
              <div class="text-white/40">○</div>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-lg">🍝</span>
                </div>
                <div>
                  <div class="font-medium text-sm">Wednesday</div>
                  <div class="text-xs text-white/60">Pasta Primavera</div>
                </div>
              </div>
              <div class="text-white/40">○</div>
            </div>
          </div>
        </div>

        <!-- Shopping List -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3 flex items-center">
            <span class="text-2xl mr-2">🛒</span>
            Shopping List
          </h4>
          <div class="space-y-2">
            <div class="flex items-center">
              <input type="checkbox" class="mr-3 w-4 h-4 rounded">
              <span class="text-sm line-through text-white/60">Chicken breast (2 lbs)</span>
            </div>
            <div class="flex items-center">
              <input type="checkbox" class="mr-3 w-4 h-4 rounded">
              <span class="text-sm">Fresh salmon (1 lb)</span>
            </div>
            <div class="flex items-center">
              <input type="checkbox" class="mr-3 w-4 h-4 rounded">
              <span class="text-sm">Mixed vegetables</span>
            </div>
            <div class="flex items-center">
              <input type="checkbox" class="mr-3 w-4 h-4 rounded">
              <span class="text-sm">Pasta (2 boxes)</span>
            </div>
          </div>
          <button class="w-full mt-3 bg-blue-500/20 text-blue-400 py-2 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
            Add Item
          </button>
        </div>

        <!-- Nutrition Summary -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Weekly Nutrition</h4>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-lg font-bold text-green-400">1,850</div>
              <div class="text-xs text-white/60">Avg Calories</div>
            </div>
            <div>
              <div class="text-lg font-bold text-blue-400">125g</div>
              <div class="text-xs text-white/60">Protein</div>
            </div>
            <div>
              <div class="text-lg font-bold text-orange-400">85g</div>
              <div class="text-xs text-white/60">Healthy Fats</div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-2 gap-3 mb-6">
          <button class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
            <div class="text-2xl mb-1">🎲</div>
            <div class="text-sm font-medium">Random Meal</div>
          </button>
          <button class="glass rounded-xl p-3 text-center hover:scale-105 transition-transform">
            <div class="text-2xl mb-1">📋</div>
            <div class="text-sm font-medium">Meal Prep</div>
          </button>
        </div>

        <button class="w-full bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Create New Plan
        </button>
      `
    },
    // Add other categories...
    education: {
      Feature1: `
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-3">Courses</h1>
          <p class="text-white/70">Expand your knowledge</p>
        </div>
        
        <!-- Continue Learning -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Continue Learning</h3>
          <div class="space-y-4">
            <div class="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-2xl p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mr-4">
                    <span class="text-2xl">🧮</span>
                  </div>
                  <div>
                    <div class="font-semibold">Advanced Mathematics</div>
                    <div class="text-xs text-white/60">Chapter 5: Calculus • 75% complete</div>
                  </div>
                </div>
              </div>
              <div class="w-full bg-white/20 rounded-full h-2 mb-3">
                <div class="bg-indigo-400 h-2 rounded-full" style="width: 75%"></div>
              </div>
              <button class="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                Continue Learning
              </button>
            </div>
          </div>
        </div>

        <!-- Browse Subjects -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Browse Subjects</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div class="text-3xl mb-2">🧪</div>
              <div class="font-semibold">Science</div>
              <div class="text-xs text-white/60">24 courses</div>
            </div>
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div class="text-3xl mb-2">📚</div>
              <div class="font-semibold">Literature</div>
              <div class="text-xs text-white/60">18 courses</div>
            </div>
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div class="text-3xl mb-2">🌍</div>
              <div class="font-semibold">History</div>
              <div class="text-xs text-white/60">15 courses</div>
            </div>
            <div class="glass rounded-2xl p-4 text-center hover:scale-105 transition-transform cursor-pointer">
              <div class="text-3xl mb-2">🎨</div>
              <div class="font-semibold">Arts</div>
              <div class="text-xs text-white/60">12 courses</div>
            </div>
          </div>
        </div>

        <!-- Recommended Courses -->
        <div class="space-y-3 mb-6">
          <div class="glass rounded-2xl p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                  <span class="text-lg">🧪</span>
                </div>
                <div>
                  <div class="font-semibold text-sm">Chemistry Basics</div>
                  <div class="text-xs text-white/60">12 lessons • Beginner</div>
                </div>
              </div>
              <button class="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs">
                Enroll
              </button>
            </div>
          </div>
        </div>

        <button class="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Browse All Courses
        </button>
      `,
      Feature2: `
        <div class="mb-8">
          <h1 class="text-3xl font-bold mb-3">Flashcards</h1>
          <p class="text-white/70">Study with smart flashcards</p>
        </div>

        <!-- Active Study Sets -->
        <div class="glass rounded-3xl p-6 mb-6">
          <h3 class="text-xl font-semibold mb-4">Study Today</h3>
          <div class="space-y-4">
            <div class="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-4">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <div class="font-semibold">Calculus Terms</div>
                  <div class="text-xs text-white/60">24 cards • Due for review</div>
                </div>
                <span class="bg-purple-500 text-white px-2 py-1 rounded-full text-xs">New</span>
              </div>
              <button class="bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold">
                Study Now
              </button>
            </div>
          </div>
        </div>

        <!-- Study Statistics -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Study Stats</h4>
          <div class="grid grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-lg font-bold text-blue-400">156</div>
              <div class="text-xs text-white/60">Cards Mastered</div>
            </div>
            <div>
              <div class="text-lg font-bold text-green-400">28</div>
              <div class="text-xs text-white/60">Day Streak</div>
            </div>
            <div>
              <div class="text-lg font-bold text-orange-400">92%</div>
              <div class="text-xs text-white/60">Accuracy</div>
            </div>
          </div>
        </div>

        <!-- Quick Review -->
        <div class="glass rounded-2xl p-4 mb-6">
          <h4 class="font-semibold mb-3">Quick Review</h4>
          <div class="bg-white/5 rounded-xl p-4 mb-3 text-center">
            <div class="text-lg mb-2">What is the derivative of x²?</div>
            <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
              Show Answer
            </button>
          </div>
          <div class="text-center text-xs text-white/60">Card 1 of 24</div>
        </div>

        <button class="w-full bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
          Create New Study Set
        </button>
      `
    },
    // Continue with other categories if needed, otherwise use default
    productivity: {
      Feature1: 'Tasks',
      Feature2: 'Calendar'
    },
    ecommerce: {
      Feature1: 'Products', 
      Feature2: 'Cart'
    },
    social: {
      Feature1: 'Posts',
      Feature2: 'Messages'  
    }
  };

  const content = featureContent[category as keyof typeof featureContent];
  if (content && typeof content === 'object' && content[screenType as keyof typeof content]) {
    return content[screenType as keyof typeof content] as string;
  }

  // Default fallback for categories without detailed content
  return `
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-3">${getTitle(category, screenType)}</h1>
      <p class="text-white/70">Discover amazing features</p>
    </div>

    <div class="space-y-4 mb-8">
      ${Array(4).fill(0).map((_, i) => `
        <div class="glass rounded-3xl p-6 hover:scale-105 transition-transform cursor-pointer">
          <div class="flex items-center mb-3">
            <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
              ${['🎯', '⭐', '🚀', '💎'][i]}
            </div>
            <div>
              <h3 class="font-semibold">Feature ${i + 1}</h3>
              <p class="text-sm text-white/70">Amazing functionality</p>
            </div>
          </div>
          <p class="text-sm text-white/80">Detailed description of this feature and its benefits</p>
        </div>
      `).join('')}
    </div>

    <button class="w-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
      Explore More
    </button>
  `;
}

// Mock templates with complete apps
const APP_TEMPLATES = {
  fitness: {
    appName: 'FitTracker',
    description: 'Complete fitness tracking app with workout logging, progress charts, and social features'
  },
  food: {
    appName: 'RecipeBook',
    description: 'Discover, save, and share delicious recipes with meal planning features'
  },
  education: {
    appName: 'StudyBuddy',
    description: 'Interactive learning platform with courses, flashcards, and progress tracking'
  },
  productivity: {
    appName: 'TaskMaster',
    description: 'Advanced productivity app with tasks, calendar, and notes management'
  },
  ecommerce: {
    appName: 'ShopApp',
    description: 'Modern e-commerce mobile app with products, cart, and order management'
  },
  social: {
    appName: 'ConnectMe',
    description: 'Social networking app with posts, messaging, and community features'
  }
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, appId, messages, currentScreens, appName, category, mode } = body;

    if (!prompt || !appId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const detectedMode = mode || (currentScreens && currentScreens.length > 0 ? 'update' : 'initial');
    const expectedScreenCount = currentScreens && currentScreens.length > 0 ? currentScreens.length : 5;

    // Try using OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        // Build conversation context
        const systemPrompt = getSystemPrompt(detectedMode, currentScreens);
        const conversationMessages = [];
        
        // Add recent chat history for context (last 10 messages)
        if (messages && messages.length > 0) {
          const recentMessages = messages.slice(-10);
          conversationMessages.push(...recentMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
          })));
        }
        
        // Add current user request
        conversationMessages.push({
          role: 'user' as const,
          content: detectedMode === 'update' 
            ? `The user wants to: ${prompt}` 
            : `Create a mobile app: ${prompt}${category ? ` (Category: ${category})` : ''}`
        });

        // Use NON-streaming OpenAI call to get complete response, then stream to frontend
        console.log('Making OpenAI API call...');
        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationMessages,
          ],
          max_tokens: MAX_CODE_TOKENS || 16000,
          temperature: 0.7,
          response_format: { type: "json_object" },
          stream: false, // Non-streaming for reliable JSON response
        });

        console.log('OpenAI response received, processing...');
        const responseContent = completion.choices[0]?.message?.content;
        
        if (!responseContent) {
          console.error('No content in OpenAI response');
          throw new Error('No content in OpenAI response');
        }

        // Parse the JSON response
        const aiResult = JSON.parse(responseContent);
        
        if (!aiResult.screens || !Array.isArray(aiResult.screens)) {
          console.error('Invalid OpenAI response format:', aiResult);
          throw new Error('Invalid response format from OpenAI');
        }

        console.log('OpenAI generated', aiResult.screens.length, 'screens successfully');

        // Set up streaming response to frontend
        const encoder = new TextEncoder();
        const readableStream = new ReadableStream({
          async start(controller) {
            try {
              // Send progress updates as we "stream" each screen to frontend
              for (let i = 0; i < aiResult.screens.length; i++) {
                const progress = ((i + 1) / aiResult.screens.length) * 90;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  type: 'progress',
                  progress,
                  message: `Processing screen ${i + 1} of ${aiResult.screens.length}...`
                })}\n\n`));
                
                // Small delay to show progress
                await new Promise(resolve => setTimeout(resolve, 200));
              }

              // Send final complete result
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'complete',
                screens: aiResult.screens,
                appName: aiResult.appName || generateAppName(prompt),
                description: aiResult.description || generateDescription(prompt),
                success: true
              })}\n\n`));
              
              controller.close();
            } catch (error) {
              console.error('Error streaming to frontend:', error);
              controller.close();
            }
          },
        });

        return new Response(readableStream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fall through to mock implementation
      }
    }

    // Mock implementation fallback with streaming
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        await handleMockFallback(controller, encoder, prompt, detectCategory(prompt, category), appName, expectedScreenCount);
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to generate app. Please try again.',
        screens: [],
        appName: 'My App',
        description: 'App generation failed'
      },
      { status: 500 }
    );
  }
}

// Helper function for mock streaming fallback
async function handleMockFallback(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  prompt: string,
  detectedCategory: string,
  appName?: string,
  expectedScreenCount: number = 5
) {
  // Send progress updates
  for (let i = 0; i < expectedScreenCount; i++) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'progress',
      progress: ((i + 1) / expectedScreenCount) * 90,
      message: `Generating screen ${i + 1} of ${expectedScreenCount}...`
    })}\n\n`));
    
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Generate final result
  const template = APP_TEMPLATES[detectedCategory as keyof typeof APP_TEMPLATES] || APP_TEMPLATES.fitness;
  
  const screens = [
    { name: 'Home', html: generateScreenTemplate(detectedCategory, 'Home') },
    { name: 'Feature1', html: generateScreenTemplate(detectedCategory, 'Feature1') },
    { name: 'Feature2', html: generateScreenTemplate(detectedCategory, 'Feature2') },
    { name: 'Profile', html: generateScreenTemplate(detectedCategory, 'Profile') },
    { name: 'Settings', html: generateScreenTemplate(detectedCategory, 'Settings') }
  ].slice(0, expectedScreenCount);
  
  const result = {
    type: 'complete',
    screens,
    appName: appName || template.appName || generateAppName(prompt),
    description: template.description || generateDescription(prompt),
    success: true
  };

  controller.enqueue(encoder.encode(`data: ${JSON.stringify(result)}\n\n`));
}

// Helper functions
function detectCategory(prompt: string, explicitCategory?: string): string {
  if (explicitCategory && explicitCategory !== 'custom') {
    return explicitCategory;
  }

  const lowerPrompt = prompt.toLowerCase();
  
  // Fitness
  if (lowerPrompt.includes('fitness') || lowerPrompt.includes('workout') || lowerPrompt.includes('health') || lowerPrompt.includes('exercise') || lowerPrompt.includes('gym')) {
    return 'fitness';
  }
  
  // Food
  if (lowerPrompt.includes('food') || lowerPrompt.includes('recipe') || lowerPrompt.includes('cooking') || lowerPrompt.includes('meal') || lowerPrompt.includes('restaurant') || lowerPrompt.includes('kitchen')) {
    return 'food';
  }
  
  // Education
  if (lowerPrompt.includes('education') || lowerPrompt.includes('learning') || lowerPrompt.includes('study') || lowerPrompt.includes('course') || lowerPrompt.includes('student') || lowerPrompt.includes('school')) {
    return 'education';
  }
  
  // Productivity
  if (lowerPrompt.includes('task') || lowerPrompt.includes('todo') || lowerPrompt.includes('productivity') || lowerPrompt.includes('organize') || lowerPrompt.includes('calendar') || lowerPrompt.includes('note')) {
    return 'productivity';
  }
  
  // E-commerce
  if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('ecommerce') || lowerPrompt.includes('product') || lowerPrompt.includes('cart') || lowerPrompt.includes('buy')) {
    return 'ecommerce';
  }
  
  // Social
  if (lowerPrompt.includes('social') || lowerPrompt.includes('chat') || lowerPrompt.includes('message') || lowerPrompt.includes('friends') || lowerPrompt.includes('community') || lowerPrompt.includes('post')) {
    return 'social';
  }
  
  return 'fitness'; // Default fallback
}

function generateAppName(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('fitness') || lowerPrompt.includes('workout')) {
    return 'FitTracker Pro';
  }
  
  const words = prompt.split(' ').filter(word => word.length > 2);
  if (words.length > 0) {
    return words[0].charAt(0).toUpperCase() + words[0].slice(1) + 'App';
  }
  
  return 'My App';
}

function generateDescription(prompt: string): string {
  return `A mobile app for ${prompt.toLowerCase()}. Built with modern design and intuitive user experience.`;
}

export async function GET() {
  return NextResponse.json(
    { message: 'AppForge Code Generation API v1.0' },
    { status: 200 }
  );
}