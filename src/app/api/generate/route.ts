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

Respond ONLY with valid JSON:
{
  "type": "questions",
  "appName": "Suggested App Name",
  "description": "Brief exciting description of what you'll build",
  "acknowledgment": "Your enthusiastic 1-2 sentence acknowledgment",
  "questions": [
    "First specific question?",
    "Second specific question?",
    "Third specific question?",
    "Fourth specific question (optional)?"
  ]
}`;

// ─── THE MEGA SYSTEM PROMPT ──────────────────────────────────────────────────
function getGenerationSystemPrompt(mode: 'initial' | 'update', currentScreens?: { name: string; html: string }[]) {
  const screenContext = mode === 'update' && currentScreens
    ? `\n\nCURRENT APP SCREENS (update these based on user request, return ALL screens):\n${currentScreens.map(s => `Screen "${s.name}": ${s.html.substring(0, 800)}...`).join('\n\n')}`
    : '';

  return `You are AppForge AI — the world's best mobile app generator. You produce PRODUCTION-QUALITY apps that look like they belong on the App Store. NOT college projects. NOT prototypes. REAL apps.

${screenContext}

═══════════════════════════════════════════════════════════
RESPONSE FORMAT — STRICT JSON ONLY
═══════════════════════════════════════════════════════════

{
  "type": "screens",
  "appName": "App Name",
  "description": "Brief app description",
  "screens": [
    { "name": "ContextualName", "html": "<!DOCTYPE html>..." },
    { "name": "ContextualName2", "html": "<!DOCTYPE html>..." },
    { "name": "ContextualName3", "html": "<!DOCTYPE html>..." },
    { "name": "ContextualName4", "html": "<!DOCTYPE html>..." },
    { "name": "ContextualName5", "html": "<!DOCTYPE html>..." }
  ]
}

═══════════════════════════════════════════════════════════
SCREEN NAMING — CONTEXT-AWARE, NEVER GENERIC
═══════════════════════════════════════════════════════════

NEVER use "Feature1", "Feature2". Name screens based on the app type:
- Fitness → Dashboard, Workouts, Progress, Profile, Settings
- E-commerce → Home, Shop, Cart, Orders, Account
- Finance → Overview, Transactions, Budget, Reports, Settings
- Social → Feed, Explore, Messages, Notifications, Profile
- Food/Recipe → Home, Recipes, Meal Plan, Grocery List, Profile
- Music → Now Playing, Library, Search, Playlists, Profile
- Travel → Explore, Trips, Bookings, Saved, Profile
- Health → Dashboard, Medications, Appointments, Records, Profile
- News → Headlines, Trending, Saved, Categories, Profile
- Weather → Today, Hourly, Weekly, Radar, Settings

Generate EXACTLY 5 screens unless updating existing screens.

═══════════════════════════════════════════════════════════
HTML TEMPLATE — EVERY SCREEN MUST FOLLOW THIS STRUCTURE
═══════════════════════════════════════════════════════════

Each screen is a COMPLETE self-contained HTML5 document:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Screen Name</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background: #050507; color: #fff; overflow-x: hidden; min-height: 100vh; }
    
    /* Glassmorphism */
    .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(24px) saturate(1.8); -webkit-backdrop-filter: blur(24px) saturate(1.8); border: 1px solid rgba(255,255,255,0.06); }
    .glass-strong { background: rgba(255,255,255,0.08); backdrop-filter: blur(40px) saturate(2); -webkit-backdrop-filter: blur(40px) saturate(2); border: 1px solid rgba(255,255,255,0.1); }
    
    /* Animations */
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 40px rgba(99,102,241,0.6); } }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .animate-in { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
    .delay-1 { animation-delay: 0.1s; }
    .delay-2 { animation-delay: 0.2s; }
    .delay-3 { animation-delay: 0.3s; }
    .delay-4 { animation-delay: 0.4s; }
    .delay-5 { animation-delay: 0.5s; }
    
    /* Touch feedback */
    .touch-btn { transition: all 0.15s ease; }
    .touch-btn:active { transform: scale(0.96); opacity: 0.8; }
    
    /* Custom scrollbar */
    ::-webkit-scrollbar { width: 0; height: 0; }
    
    /* Toast notification */
    .toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%) translateY(100px); background: rgba(255,255,255,0.12); backdrop-filter: blur(20px); padding: 12px 24px; border-radius: 100px; font-size: 14px; z-index: 100; transition: transform 0.3s ease, opacity 0.3s ease; opacity: 0; pointer-events: none; border: 1px solid rgba(255,255,255,0.08); }
    .toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
    
    /* Toggle switch */
    .toggle { width: 48px; height: 28px; border-radius: 14px; background: rgba(255,255,255,0.15); position: relative; cursor: pointer; transition: background 0.3s; }
    .toggle.active { background: #6366f1; }
    .toggle::after { content: ''; position: absolute; width: 22px; height: 22px; border-radius: 50%; background: white; top: 3px; left: 3px; transition: transform 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.3); }
    .toggle.active::after { transform: translateX(20px); }
  </style>
</head>
<body>
  <!-- STATUS BAR -->
  <div style="position:sticky;top:0;z-index:50;padding:8px 24px 8px;display:flex;justify-content:space-between;align-items:center;background:rgba(5,5,7,0.85);backdrop-filter:blur(20px);">
    <span style="font-size:15px;font-weight:600;letter-spacing:-0.3px;">9:41</span>
    <div style="display:flex;gap:6px;align-items:center;">
      <svg width="16" height="12" fill="white"><rect x="0" y="3" width="3" height="9" rx="1" opacity="0.4"/><rect x="4.5" y="2" width="3" height="10" rx="1" opacity="0.6"/><rect x="9" y="1" width="3" height="11" rx="1" opacity="0.8"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>
      <svg width="15" height="12" fill="white"><path d="M7.5 2.5C9.8 2.5 11.8 3.5 13.2 5L14.5 3.7C12.7 1.9 10.2 0.8 7.5 0.8S2.3 1.9 0.5 3.7L1.8 5C3.2 3.5 5.2 2.5 7.5 2.5ZM7.5 6.2C8.9 6.2 10.2 6.8 11.1 7.7L12.4 6.4C11.1 5.1 9.4 4.4 7.5 4.4S3.9 5.1 2.6 6.4L3.9 7.7C4.8 6.8 6.1 6.2 7.5 6.2ZM9.3 9.8L7.5 12L5.7 9.8C6.2 9.3 6.8 9 7.5 9S8.8 9.3 9.3 9.8Z"/></svg>
      <svg width="25" height="12" fill="white"><rect x="0" y="1" width="21" height="10" rx="2" stroke="white" stroke-width="1" fill="none" opacity="0.4"/><rect x="22" y="3.5" width="2" height="5" rx="1" opacity="0.4"/><rect x="1.5" y="2.5" width="16" height="7" rx="1" fill="#34D399"/></svg>
    </div>
  </div>

  <!-- MAIN CONTENT (add padding for status bar + bottom nav) -->
  <main style="padding: 8px 20px 100px; min-height: calc(100vh - 44px);">
    <!-- YOUR RICH CONTENT HERE — 300+ LINES MINIMUM -->
  </main>

  <!-- BOTTOM NAVIGATION -->
  <nav style="position:fixed;bottom:0;left:0;right:0;background:rgba(5,5,7,0.92);backdrop-filter:blur(30px);border-top:1px solid rgba(255,255,255,0.06);padding:8px 0 24px;z-index:50;">
    <div style="display:flex;justify-content:space-around;align-items:center;">
      <!-- 5 nav items with SVG icons, labels, and active state color (#6366f1 for active, rgba(255,255,255,0.4) for inactive) -->
    </div>
  </nav>

  <!-- TOAST -->
  <div id="toast" class="toast"></div>

  <script>
    // Toast function
    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }
    
    // Toggle function
    document.querySelectorAll('.toggle').forEach(el => {
      el.addEventListener('click', () => {
        el.classList.toggle('active');
        showToast(el.classList.contains('active') ? 'Enabled' : 'Disabled');
      });
    });
    
    // All buttons show feedback
    document.querySelectorAll('.touch-btn').forEach(el => {
      if (!el.onclick) {
        el.addEventListener('click', () => showToast('Action triggered'));
      }
    });
  </script>
</body>
</html>

═══════════════════════════════════════════════════════════
ABSOLUTE RULES — VIOLATION = FAILURE
═══════════════════════════════════════════════════════════

1. NEVER use placeholder text: "[Chart]", "[Image]", "[Placeholder]", "Lorem ipsum" — INSTANT FAIL
2. ALWAYS generate WORKING JavaScript — buttons do things, forms save data, toggles toggle
3. ALWAYS use inline SVG for charts/graphs — draw actual pie charts, bar charts, line charts with real paths
4. ALWAYS include bottom navigation with SVG icons on EVERY screen, with the current screen highlighted in #6366f1
5. ALWAYS use glassmorphism: backdrop-blur, semi-transparent backgrounds, subtle borders
6. ALWAYS include the status bar (9:41, signal, wifi, battery) at top
7. ALWAYS use realistic sample data — real names (Sarah Chen, Marcus Johnson), real numbers, real dates
8. ALWAYS make buttons do something: showToast(), toggle state, show/hide elements, update counters
9. MINIMUM 300 lines per screen HTML — rich, detailed, interactive content
10. Each screen must feel like a COMPLETELY DIFFERENT page of a real app
11. Use Inter font via Google Fonts CDN
12. Use Tailwind CSS via CDN
13. Dark mode by default (#050507 background) with proper contrast
14. 44px minimum touch targets for all interactive elements
15. Use CSS animations: fadeInUp on cards, smooth transitions on interactions
16. LocalStorage for form data persistence where applicable
17. SVG icons only — no emoji for navigation, minimal emoji in content

═══════════════════════════════════════════════════════════
SVG CHART REFERENCE — USE THESE PATTERNS
═══════════════════════════════════════════════════════════

PIE CHART (use stroke-dasharray for segments):
<svg viewBox="0 0 36 36" width="120" height="120">
  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="3"/>
  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" stroke-width="3" stroke-dasharray="40 60" stroke-dashoffset="25" stroke-linecap="round"/>
  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="25 75" stroke-dashoffset="-15" stroke-linecap="round"/>
  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#06b6d4" stroke-width="3" stroke-dasharray="20 80" stroke-dashoffset="-40" stroke-linecap="round"/>
</svg>

BAR CHART:
<svg viewBox="0 0 200 100" width="100%" height="120" preserveAspectRatio="none">
  <rect x="10" y="60" width="20" height="40" rx="4" fill="#6366f1" opacity="0.8"/>
  <rect x="40" y="30" width="20" height="70" rx="4" fill="#6366f1"/>
  <rect x="70" y="45" width="20" height="55" rx="4" fill="#6366f1" opacity="0.9"/>
  <!-- more bars... -->
</svg>

LINE CHART:
<svg viewBox="0 0 200 80" width="100%" height="100" preserveAspectRatio="none">
  <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/><stop offset="100%" stop-color="#6366f1" stop-opacity="0"/></linearGradient></defs>
  <path d="M0,60 L40,45 L80,50 L120,25 L160,30 L200,15" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round"/>
  <path d="M0,60 L40,45 L80,50 L120,25 L160,30 L200,15 L200,80 L0,80Z" fill="url(#lg)"/>
</svg>

═══════════════════════════════════════════════════════════
INTERACTIVE PATTERNS — COPY THESE
═══════════════════════════════════════════════════════════

WORKING FORM WITH LOCALSTORAGE:
<form id="myForm" onsubmit="saveForm(event)">
  <input type="text" id="nameInput" placeholder="Your name" value="" 
    style="width:100%;padding:14px 18px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;color:#fff;font-size:16px;outline:none;"
    onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='rgba(255,255,255,0.1)'">
  <button type="submit" class="touch-btn" style="width:100%;padding:16px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border:none;border-radius:14px;color:#fff;font-size:16px;font-weight:600;margin-top:12px;cursor:pointer;">Save</button>
</form>
<script>
  // Load saved data
  const saved = JSON.parse(localStorage.getItem('formData') || '{}');
  if (saved.name) document.getElementById('nameInput').value = saved.name;
  
  function saveForm(e) {
    e.preventDefault();
    const data = { name: document.getElementById('nameInput').value };
    localStorage.setItem('formData', JSON.stringify(data));
    showToast('Saved successfully!');
  }
</script>

COUNTER WITH STATE:
<div style="display:flex;align-items:center;gap:16px;">
  <button onclick="updateCount(-1)" class="touch-btn" style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:20px;cursor:pointer;">−</button>
  <span id="counter" style="font-size:24px;font-weight:700;min-width:40px;text-align:center;">0</span>
  <button onclick="updateCount(1)" class="touch-btn" style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:20px;cursor:pointer;">+</button>
</div>
<script>
  let count = parseInt(localStorage.getItem('counter') || '0');
  document.getElementById('counter').textContent = count;
  function updateCount(n) { count += n; document.getElementById('counter').textContent = count; localStorage.setItem('counter', count); }
</script>

TAB SWITCHER:
<div style="display:flex;gap:4px;background:rgba(255,255,255,0.06);border-radius:12px;padding:4px;">
  <button onclick="switchTab('daily')" id="tab-daily" class="touch-btn tab-btn active-tab" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;background:#6366f1;color:#fff;">Daily</button>
  <button onclick="switchTab('weekly')" id="tab-weekly" class="touch-btn tab-btn" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;background:transparent;color:rgba(255,255,255,0.5);">Weekly</button>
  <button onclick="switchTab('monthly')" id="tab-monthly" class="touch-btn tab-btn" style="flex:1;padding:10px;border:none;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all 0.2s;background:transparent;color:rgba(255,255,255,0.5);">Monthly</button>
</div>
<script>
function switchTab(id) {
  document.querySelectorAll('.tab-btn').forEach(b => { b.style.background = 'transparent'; b.style.color = 'rgba(255,255,255,0.5)'; });
  document.getElementById('tab-'+id).style.background = '#6366f1';
  document.getElementById('tab-'+id).style.color = '#fff';
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
  const el = document.getElementById('content-'+id);
  if (el) el.style.display = 'block';
  showToast(id.charAt(0).toUpperCase() + id.slice(1) + ' view');
}
</script>

═══════════════════════════════════════════════════════════
QUALITY CHECKLIST (self-verify before responding)
═══════════════════════════════════════════════════════════
□ Each screen is 300+ lines of HTML
□ No placeholder text anywhere
□ Bottom nav present on every screen with correct active state
□ Status bar present on every screen
□ All charts use real SVG (not text placeholders)
□ All buttons have onclick handlers
□ Forms save to localStorage
□ Toggles visually switch state
□ Animations on card entrance
□ Glass morphism on card elements
□ Real sample data throughout
□ Screen names are contextual (not Feature1/Feature2)
□ Inter font loaded
□ Tailwind CSS loaded
□ Dark background (#050507)
□ Touch targets ≥ 44px`;
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
      return NextResponse.json({
        success: true,
        type: 'questions',
        appName: result.appName || generateAppName(prompt),
        description: result.description || generateDescription(prompt),
        acknowledgment: result.acknowledgment || '',
        questions: result.questions || [],
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
        : `Build a mobile app: ${prompt}\n\nApp category: ${detectedCategory}\nGenerate exactly 5 screens with context-aware names for this type of app. Each screen must be 300+ lines of production-quality HTML with working JavaScript, SVG charts where relevant, glassmorphism UI, and real sample data. Follow ALL rules in the system prompt.`,
    });

    console.log(`[AppForge] Generating ${generationMode} for: ${prompt.substring(0, 80)}...`);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL || 'gpt-4o',
      messages: [{ role: 'system', content: systemPrompt }, ...conversationMessages],
      max_tokens: MAX_CODE_TOKENS || 16000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) throw new Error('No content in AI response');

    const aiResult = JSON.parse(responseContent);
    if (!aiResult.screens || !Array.isArray(aiResult.screens)) {
      throw new Error('Invalid response format — no screens array');
    }

    console.log(`[AppForge] Generated ${aiResult.screens.length} screens successfully`);

    // Stream the result to the frontend
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for (let i = 0; i < aiResult.screens.length; i++) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'progress',
              progress: ((i + 1) / aiResult.screens.length) * 90,
              message: `Processing ${aiResult.screens[i].name || `screen ${i + 1}`}...`,
            })}\n\n`));
            await new Promise(r => setTimeout(r, 150));
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
