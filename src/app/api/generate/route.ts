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

Generate complete HTML pages for mobile app screens based on user requirements. Each screen should:

1. Use inline CSS for styling (no external stylesheets except CDNs)
2. Include Tailwind CSS via CDN: https://cdn.tailwindcss.com
3. Use dark mode design (#0a0a0f background, glass cards with rgba(255,255,255,0.03) bg)
4. Include modern gradients and glass morphism effects
5. Use Inter font from Google Fonts CDN
6. Include Lucide icons via CDN: https://unpkg.com/lucide@latest/dist/umd/lucide.js
7. Be mobile-first and responsive
8. Include smooth CSS animations and transitions
9. Use proper semantic HTML structure
10. Be self-contained with no external dependencies except CDNs
11. MINIMUM 5 screens per app
12. Each screen should be 150+ lines of HTML with rich content

Respond with JSON containing:
{
  "screens": [{"name": "Screen Name", "html": "complete HTML"}],
  "appName": "Generated App Name",
  "description": "Brief app description"
}

Make the design beautiful, modern, and user-friendly. Use gradients, backdrop-blur, and contemporary UI patterns. Each screen should be feature-rich and interactive.`;

// Mock templates for fallback
const APP_TEMPLATES = {
  fitness: {
    screens: [
      {
        name: 'Dashboard',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FitTracker Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <style>
        body { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .float { animation: float 6s ease-in-out infinite; }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <div class="gradient-bg min-h-screen p-6">
        <div class="max-w-md mx-auto">
            <!-- Header -->
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold mb-2">FitTracker</h1>
                <p class="text-white/80">Welcome back, Alex!</p>
            </div>
            
            <!-- Progress Card -->
            <div class="glass rounded-3xl p-6 mb-6 float">
                <h3 class="text-xl font-semibold mb-4">Today's Progress</h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span>Steps</span>
                            <span>8,543 / 10,000</span>
                        </div>
                        <div class="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div class="h-full w-4/5 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
                        </div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-2">
                            <span>Calories</span>
                            <span>1,240 / 2,000</span>
                        </div>
                        <div class="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div class="h-full w-3/5 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="glass rounded-3xl p-6 mb-6">
                <h3 class="text-xl font-semibold mb-4">Quick Actions</h3>
                <div class="grid grid-cols-2 gap-4">
                    <button class="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl font-medium hover:scale-105 transition-transform">
                        Start Workout
                    </button>
                    <button class="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl font-medium hover:scale-105 transition-transform">
                        Log Food
                    </button>
                    <button class="bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-2xl font-medium hover:scale-105 transition-transform">
                        View Stats
                    </button>
                    <button class="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-2xl font-medium hover:scale-105 transition-transform">
                        Profile
                    </button>
                </div>
            </div>

            <!-- Weekly Summary -->
            <div class="glass rounded-3xl p-6">
                <h3 class="text-xl font-semibold mb-4">This Week</h3>
                <div class="space-y-3">
                    <div class="flex justify-between items-center">
                        <span class="text-sm">Workouts completed</span>
                        <span class="font-semibold">5 of 6</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm">Average heart rate</span>
                        <span class="font-semibold">142 bpm</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm">Total distance</span>
                        <span class="font-semibold">23.4 km</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`
      },
      {
        name: 'Workouts',
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workouts</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .glass { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); }
        .gradient-bg { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <div class="gradient-bg min-h-screen p-6">
        <div class="max-w-md mx-auto">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold mb-2">Workouts</h1>
                <p class="text-white/80">Choose your training</p>
            </div>
            
            <div class="space-y-4">
                <div class="glass rounded-3xl p-6 hover:scale-105 transition-transform cursor-pointer">
                    <div class="flex items-center mb-3">
                        <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                            💪
                        </div>
                        <div>
                            <h3 class="font-semibold">Strength Training</h3>
                            <p class="text-sm text-white/70">45 min • Upper body</p>
                        </div>
                    </div>
                    <p class="text-sm text-white/80">Build muscle with weights and resistance training</p>
                </div>

                <div class="glass rounded-3xl p-6 hover:scale-105 transition-transform cursor-pointer">
                    <div class="flex items-center mb-3">
                        <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                            🏃
                        </div>
                        <div>
                            <h3 class="font-semibold">Cardio</h3>
                            <p class="text-sm text-white/70">30 min • High intensity</p>
                        </div>
                    </div>
                    <p class="text-sm text-white/80">Improve endurance and burn calories</p>
                </div>

                <div class="glass rounded-3xl p-6 hover:scale-105 transition-transform cursor-pointer">
                    <div class="flex items-center mb-3">
                        <div class="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                            🧘
                        </div>
                        <div>
                            <h3 class="font-semibold">Yoga</h3>
                            <p class="text-sm text-white/70">60 min • Relaxing</p>
                        </div>
                    </div>
                    <p class="text-sm text-white/80">Flexibility and mindfulness practice</p>
                </div>
            </div>

            <div class="mt-8">
                <button class="w-full bg-gradient-to-r from-green-500 to-teal-500 p-4 rounded-2xl font-semibold text-lg hover:scale-105 transition-transform">
                    Start Custom Workout
                </button>
            </div>
        </div>
    </div>
</body>
</html>`
      }
    ]
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
          max_tokens: MAX_CODE_TOKENS || 4000,
          temperature: 0.7,
        });

        const result = JSON.parse(completion.choices[0].message?.content || '{}');
        
        if (result.screens && Array.isArray(result.screens)) {
          return NextResponse.json({
            ...result,
            success: true
          });
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
    
    const response: GenerateResponse = {
      screens: template.screens,
      appName: appName || generateAppName(prompt),
      description: generateDescription(prompt),
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
  
  if (lowerPrompt.includes('fitness') || lowerPrompt.includes('workout') || lowerPrompt.includes('health') || lowerPrompt.includes('exercise')) {
    return 'fitness';
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