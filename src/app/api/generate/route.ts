import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OPENAI_MODEL, MAX_CODE_TOKENS } from '@/config/constants';

interface GenerateRequest {
  prompt: string;
  appId: string;
  currentCode?: string;
  appName?: string;
  category?: string;
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
const SYSTEM_PROMPT = `You are an expert mobile app developer specialized in creating modern, responsive web-based mobile applications. 

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
    return `
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold mb-3">${getTitle(category, 'Home')}</h1>
        <p class="text-white/80">Welcome back!</p>
      </div>
      
      <div class="glass rounded-3xl p-6 mb-6 float">
        <h3 class="text-xl font-semibold mb-4">Today's Overview</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-white/80">Activity</span>
            <span class="font-semibold">85%</span>
          </div>
          <div class="h-2 bg-white/20 rounded-full overflow-hidden">
            <div class="h-full w-4/5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-6">
        <div class="glass rounded-3xl p-4 text-center hover:scale-105 transition-transform">
          <div class="text-3xl mb-2">📈</div>
          <div class="font-semibold">Analytics</div>
        </div>
        <div class="glass rounded-3xl p-4 text-center hover:scale-105 transition-transform">
          <div class="text-3xl mb-2">🎯</div>
          <div class="font-semibold">Goals</div>
        </div>
      </div>

      <button class="w-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
        Get Started
      </button>
    `;
  }
  
  if (screenType === 'Profile') {
    return `
      <div class="text-center mb-8">
        <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl">
          👤
        </div>
        <h2 class="text-2xl font-bold mb-2">Alex Johnson</h2>
        <p class="text-white/70">Premium Member</p>
      </div>

      <div class="glass rounded-3xl p-6 mb-6">
        <h3 class="text-xl font-semibold mb-4">Statistics</h3>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold">124</div>
            <div class="text-sm text-white/70">Activities</div>
          </div>
          <div>
            <div class="text-2xl font-bold">89%</div>
            <div class="text-sm text-white/70">Success Rate</div>
          </div>
          <div>
            <div class="text-2xl font-bold">15</div>
            <div class="text-sm text-white/70">Streak</div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div class="glass rounded-2xl p-4 flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              ✏️
            </div>
            <span>Edit Profile</span>
          </div>
          <div class="text-white/60">›</div>
        </div>
        
        <div class="glass rounded-2xl p-4 flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
              🏆
            </div>
            <span>Achievements</span>
          </div>
          <div class="text-white/60">›</div>
        </div>
      </div>
    `;
  }

  if (screenType === 'Settings') {
    return `
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-3">Settings</h1>
        <p class="text-white/70">Customize your app experience</p>
      </div>

      <div class="space-y-6">
        <div class="glass rounded-3xl p-6">
          <h3 class="text-lg font-semibold mb-4">Preferences</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span>Dark Mode</span>
              <div class="w-12 h-6 bg-green-500 rounded-full flex items-center px-1">
                <div class="w-4 h-4 bg-white rounded-full ml-auto"></div>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span>Notifications</span>
              <div class="w-12 h-6 bg-gray-600 rounded-full flex items-center px-1">
                <div class="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="glass rounded-3xl p-6">
          <h3 class="text-lg font-semibold mb-4">Account</h3>
          <div class="space-y-3">
            <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors">
              Privacy Policy
            </button>
            <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors">
              Terms of Service
            </button>
            <button class="w-full text-left p-3 hover:bg-white/10 rounded-xl transition-colors text-red-400">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // Feature1 and Feature2 screens - category specific
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
    const { prompt, appId, currentCode, appName, category } = body;

    if (!prompt || !appId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try using OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
          model: OPENAI_MODEL || 'gpt-4o',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { 
              role: 'user', 
              content: `Create a mobile app: ${prompt}${category ? ` (Category: ${category})` : ''}${currentCode ? `\nCurrent code context: ${currentCode.slice(0, 1000)}...` : ''}` 
            },
          ],
          max_tokens: MAX_CODE_TOKENS || 16000,
          temperature: 0.7,
          response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0].message?.content || '{}';
        
        try {
          const result = JSON.parse(responseContent);
          
          if (result.screens && Array.isArray(result.screens) && result.screens.length === 5) {
            return NextResponse.json({
              ...result,
              success: true
            });
          } else {
            console.warn('OpenAI response missing required screens array or incorrect length');
          }
        } catch (parseError) {
          console.error('Failed to parse OpenAI response JSON:', parseError);
          console.log('Raw response:', responseContent.slice(0, 500));
        }
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        // Fall through to mock implementation
      }
    }

    // Mock implementation fallback
    await new Promise(resolve => setTimeout(resolve, 2000));

    const detectedCategory = detectCategory(prompt, category);
    const template = APP_TEMPLATES[detectedCategory as keyof typeof APP_TEMPLATES] || APP_TEMPLATES.fitness;
    
    // Generate all 5 screens using the template system
    const screens = [
      { name: 'Home', html: generateScreenTemplate(detectedCategory, 'Home') },
      { name: 'Feature1', html: generateScreenTemplate(detectedCategory, 'Feature1') },
      { name: 'Feature2', html: generateScreenTemplate(detectedCategory, 'Feature2') },
      { name: 'Profile', html: generateScreenTemplate(detectedCategory, 'Profile') },
      { name: 'Settings', html: generateScreenTemplate(detectedCategory, 'Settings') }
    ];
    
    const response: GenerateResponse = {
      screens,
      appName: appName || template.appName || generateAppName(prompt),
      description: template.description || generateDescription(prompt),
      success: true
    };

    return NextResponse.json(response);

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