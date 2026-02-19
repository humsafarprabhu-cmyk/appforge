import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { OPENAI_MODEL, MAX_CODE_TOKENS } from '@/config/constants';

export const maxDuration = 60;

interface GenerateRequest {
  prompt: string;
  appId: string;
  messages?: { role: string; content: string }[];
  currentScreens?: { name: string; html: string }[];
  appName?: string;
  category?: string;
  mode?: 'initial' | 'update' | 'onboarding' | 'generate';
}

// ─── ONBOARDING SYSTEM PROMPT ────────────────────────────────────────────────
const ONBOARDING_SYSTEM_PROMPT = `You are AppForge AI, an expert mobile app architect. The user just described an app idea. Your job is to ask 3-4 smart, specific questions to understand their vision before building.

Rules:
- Acknowledge their idea enthusiastically in 1-2 sentences
- Ask exactly 3-4 questions that will dramatically improve the generated app
- Questions should cover: key features, target audience, data needs, and visual style
- Keep questions concise and specific to their app idea
- Do NOT ask generic questions — tailor them to the specific app type
- Each question MUST have a type: "checkbox" (multiple selection), "radio" (single selection), or "text" (free input)
- checkbox and radio questions MUST have an "options" array with 3-6 choices
- text questions MUST have a "placeholder" string

Respond ONLY with valid JSON:
{
  "type": "questions",
  "appName": "Suggested App Name",
  "description": "Brief exciting description of what you'll build",
  "acknowledgment": "Your enthusiastic 1-2 sentence acknowledgment",
  "questions": [
    { "id": "q1", "text": "What features do you want?", "type": "checkbox", "options": ["Feature A", "Feature B", "Feature C", "Feature D", "Feature E"] },
    { "id": "q2", "text": "Who is your target audience?", "type": "radio", "options": ["Option A", "Option B", "Option C", "Option D"] },
    { "id": "q3", "text": "What visual style?", "type": "radio", "options": ["Minimal & clean", "Colorful & playful", "Dark & professional", "Glassmorphism"] },
    { "id": "q4", "text": "Any specific requirements?", "type": "text", "placeholder": "E.g., offline support, markdown editing..." }
  ]
}`;

// ─── THE SYSTEM PROMPT ───────────────────────────────────────────────────────
function getGenerationSystemPrompt(mode: 'initial' | 'update', currentScreens?: { name: string; html: string }[]) {
  const screenContext = mode === 'update' && currentScreens
    ? `\n\nCURRENT SCREENS (update based on request, return ALL):\n${currentScreens.map(s => `"${s.name}": ${s.html.substring(0, 500)}...`).join('\n')}`
    : '';

  return `You are AppForge AI — you generate PRODUCTION-QUALITY mobile app screens. Real apps, not prototypes.
${screenContext}

RESPONSE FORMAT (strict JSON):
{"type":"screens","appName":"Name","description":"Brief desc","screens":[{"name":"ScreenName","html":"<!DOCTYPE html>..."}]}

Generate EXACTLY 3 screens. Name them contextually (e.g. Dashboard/Workouts/Profile for fitness, not Feature1/Feature2).

EACH SCREEN is a self-contained HTML5 document with:
- Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"><\/script>
- Inter font via Google Fonts
- Dark theme: body bg #050507, white text
- Glassmorphism cards: rgba(255,255,255,0.04) bg, backdrop-filter: blur(24px), subtle borders
- Status bar at top (9:41, signal/wifi/battery as inline SVG)
- Bottom nav (3 items with SVG icons, active=#6366f1, inactive=rgba(255,255,255,0.4))
- CSS animations: fadeInUp on cards
- Working JavaScript: buttons show toasts, forms save to localStorage, toggles work
- Real sample data (real names, numbers, dates — NO placeholder text)
- SVG charts where relevant (pie with stroke-dasharray, bar/line charts)
- 44px min touch targets
- 100-150 lines per screen — concise but rich

RULES:
- NO placeholder text ("[Chart]", "Lorem ipsum") — real content only
- ALL buttons must have onclick handlers
- SVG icons only in navigation (no emoji)
- Each screen must feel like a different page of the same app
- Include toast notification system in each screen`;
}

// ─── HELPER FUNCTIONS ────────────────────────────────────────────────────────

function detectCategory(prompt: string, explicitCategory?: string): string {
  if (explicitCategory && explicitCategory !== 'custom') return explicitCategory;
  const p = prompt.toLowerCase();
  const map: [string, string[]][] = [
    ['fitness', ['fitness', 'workout', 'health', 'exercise', 'gym', 'training', 'yoga', 'running']],
    ['food', ['food', 'recipe', 'cooking', 'meal', 'restaurant', 'kitchen', 'chef', 'diet', 'nutrition']],
    ['education', ['education', 'learning', 'study', 'course', 'student', 'school', 'teach', 'tutor', 'quiz']],
    ['productivity', ['task', 'todo', 'productivity', 'organize', 'calendar', 'note', 'project', 'planner']],
    ['ecommerce', ['shop', 'store', 'ecommerce', 'product', 'cart', 'buy', 'sell', 'marketplace', 'order']],
    ['social', ['social', 'chat', 'message', 'friend', 'community', 'post', 'feed', 'network', 'connect']],
    ['finance', ['finance', 'money', 'bank', 'budget', 'invest', 'crypto', 'payment', 'expense', 'income', 'wallet']],
    ['travel', ['travel', 'trip', 'booking', 'hotel', 'flight', 'vacation', 'destination', 'explore']],
    ['music', ['music', 'song', 'playlist', 'audio', 'podcast', 'streaming', 'player', 'album']],
    ['weather', ['weather', 'forecast', 'climate', 'temperature']],
  ];
  for (const [cat, keywords] of map) {
    if (keywords.some(k => p.includes(k))) return cat;
  }
  return 'productivity';
}

function generateAppName(prompt: string): string {
  const p = prompt.toLowerCase();
  const names: Record<string, string> = {
    fitness: 'FitForge', food: 'ChefMate', education: 'LearnHub', productivity: 'FlowState',
    ecommerce: 'ShopVault', social: 'Nexus', finance: 'WealthPilot', travel: 'Wanderly',
    music: 'SoundWave', weather: 'SkyCast',
  };
  const cat = detectCategory(p);
  return names[cat] || 'MyApp';
}

function generateDescription(prompt: string): string {
  return `A beautifully crafted mobile app for ${prompt.toLowerCase().slice(0, 100)}.`;
}

// ─── MAIN API HANDLER ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, appId, messages, currentScreens, appName, category, mode } = body;

    if (!prompt || !appId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Determine actual mode
    const isOnboarding = mode === 'onboarding';
    const isUpdate = !isOnboarding && (mode === 'update' || (currentScreens && currentScreens.length > 0));
    const generationMode = isUpdate ? 'update' : 'initial';

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, message: 'OpenAI API key not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ─── ONBOARDING MODE ───────────────────────────────────────────
    if (isOnboarding) {
      const completion = await openai.chat.completions.create({
        model: OPENAI_MODEL || 'gpt-4o',
        messages: [
          { role: 'system', content: ONBOARDING_SYSTEM_PROMPT },
          { role: 'user', content: `App idea: ${prompt}` },
        ],
        max_tokens: 1000,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('No response from AI');

      const result = JSON.parse(content);
      // Normalize questions: support both old string[] and new object[] formats
      const questions = (result.questions || []).map((q: string | { id: string; text: string; type: string; options?: string[]; placeholder?: string }, i: number) => {
        if (typeof q === 'string') {
          return { id: `q${i + 1}`, text: q, type: 'text', placeholder: 'Type your answer...' };
        }
        return q;
      });
      return NextResponse.json({
        success: true,
        type: 'questions',
        appName: result.appName || generateAppName(prompt),
        description: result.description || generateDescription(prompt),
        acknowledgment: result.acknowledgment || '',
        questions,
      });
    }

    // ─── GENERATION MODE (initial or update) ──────────────────────
    const systemPrompt = getGenerationSystemPrompt(generationMode, currentScreens);

    // Build conversation
    const conversationMessages: { role: 'user' | 'assistant' | 'system'; content: string }[] = [];
    if (messages && messages.length > 0) {
      conversationMessages.push(
        ...messages.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        }))
      );
    }

    const detectedCategory = detectCategory(prompt, category);
    conversationMessages.push({
      role: 'user',
      content: isUpdate
        ? `Update the app: ${prompt}\n\nReturn ALL screens (changed + unchanged) in the JSON format.`
        : `Build a mobile app: ${prompt}\n\nApp category: ${detectedCategory}\nGenerate exactly 3 screens with context-aware names for this type of app. Each screen must be 100-150 lines of production-quality HTML with working JavaScript, SVG charts where relevant, glassmorphism UI, and real sample data. Follow ALL rules in the system prompt.`,
    });

    console.log(`[AppForge] Generating ${generationMode} for: ${prompt.substring(0, 80)}...`);

    // Use streaming to avoid Vercel timeout — send SSE headers immediately, 
    // then stream from OpenAI, accumulate JSON, parse and send complete event
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial progress immediately to keep connection alive
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            progress: 5,
            message: 'Starting AI generation...',
          })}\n\n`));

          const openaiStream = await openai.chat.completions.create({
            model: OPENAI_MODEL || 'gpt-4o',
            messages: [{ role: 'system', content: systemPrompt }, ...conversationMessages],
            max_tokens: MAX_CODE_TOKENS || 16000,
            temperature: 0.7,
            response_format: { type: 'json_object' },
            stream: true,
          });

          let accumulated = '';
          let chunkCount = 0;
          const totalExpectedChunks = 800; // rough estimate

          for await (const chunk of openaiStream) {
            const content = chunk.choices[0]?.delta?.content || '';
            accumulated += content;
            chunkCount++;

            // Send progress updates every 40 chunks to keep connection alive
            if (chunkCount % 40 === 0) {
              const progress = Math.min(85, 5 + (chunkCount / totalExpectedChunks) * 80);
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'progress',
                progress: Math.round(progress),
                message: `Generating app code... (${Math.round(progress)}%)`,
              })}\n\n`));
            }
          }

          if (!accumulated) throw new Error('No content in AI response');

          const aiResult = JSON.parse(accumulated);
          if (!aiResult.screens || !Array.isArray(aiResult.screens)) {
            throw new Error('Invalid response format — no screens array');
          }

          console.log(`[AppForge] Generated ${aiResult.screens.length} screens successfully`);

          // Send screen-by-screen progress
          for (let i = 0; i < aiResult.screens.length; i++) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              progress: 85 + ((i + 1) / aiResult.screens.length) * 10,
              message: `Processing ${aiResult.screens[i].name || `screen ${i + 1}`}...`,
            })}\n\n`));
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            screens: aiResult.screens,
            appName: aiResult.appName || appName || generateAppName(prompt),
            description: aiResult.description || generateDescription(prompt),
            success: true,
          })}\n\n`));
        } catch (e) {
          console.error('[AppForge] Streaming error:', e);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            message: e instanceof Error ? e.message : 'Generation failed',
          })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[AppForge] Generation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate app',
        screens: [],
        appName: 'My App',
        description: 'Generation failed',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'AppForge AI Generation API v2.0 — Production Quality' }, { status: 200 });
}
