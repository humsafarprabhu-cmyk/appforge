'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface AppScreen {
  name: string;
  html: string;
}

/**
 * Export as React Native Expo project
 */
export async function exportAsExpo(
  appName: string,
  screens: AppScreen[],
  description: string = '',
  category: string = 'productivity',
  blueprint?: any,
) {
  const { getApiBase } = await import('./api');
  const apiBase = getApiBase();

  const response = await fetch(`${apiBase}/api/export/react-native`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appName, screens, description, category, blueprint }),
  });

  if (!response.ok) throw new Error('Export failed');
  const data = await response.json();
  if (!data.success) throw new Error(data.message || 'Export failed');

  const zip = new JSZip();
  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Add all files from the assembled project
  for (const [filePath, content] of Object.entries(data.files)) {
    zip.file(filePath, content as string);
  }

  // Add placeholder assets
  zip.file('assets/icon.png', ''); // placeholder
  zip.file('assets/adaptive-icon.png', '');
  zip.file('assets/splash.png', '');
  zip.file('assets/favicon.png', '');

  // README
  zip.file('README.md', `# ${appName}

Built with [AppForge](https://appforge-swart.vercel.app) — AI Mobile App Builder

## Setup

\`\`\`bash
npm install
npx expo start
\`\`\`

## Build APK

\`\`\`bash
npx eas build --platform android --profile preview
\`\`\`

## Configuration

Edit \`src/config.ts\` to set your API keys:
- Supabase URL & anon key (for self-managed database)
- AdMob IDs (for ads)
- Stripe/Razorpay keys (for payments)

## Screens

${screens.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}
`);

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${slug}-expo.zip`);
}

export async function exportAsZip(
  appName: string,
  screens: AppScreen[],
  description: string = ''
) {
  const zip = new JSZip();
  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Generate index.html with navigation between screens
  const indexHtml = generateIndexHtml(appName, screens, false);
  zip.file('index.html', indexHtml);

  // Individual screen files (with watermark)
  screens.forEach((screen, i) => {
    zip.file(`screens/${screen.name.toLowerCase().replace(/\s+/g, '-')}.html`, injectWatermark(screen.html));
  });

  // manifest.json for PWA
  zip.file('manifest.json', JSON.stringify({
    name: appName,
    short_name: appName,
    description: description || `${appName} - Built with AppForge`,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#6366f1',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }, null, 2));

  // AppForge SDK
  try {
    const sdkRes = await fetch('/sdk/appforge-sdk.js');
    if (sdkRes.ok) {
      const sdkCode = await sdkRes.text();
      zip.file('sdk/appforge-sdk.js', sdkCode);
    }
  } catch { /* SDK fetch failed, skip */ }

  // .env.example for SDK configuration
  zip.file('.env.example', `# AppForge SDK Configuration
# Get these from your AppForge dashboard
APPFORGE_API_URL=https://your-api-url.com
APPFORGE_APP_ID=your-app-id
`);

  // README
  zip.file('README.md', `# ${appName}

Built with [AppForge](https://appforge-swart.vercel.app) — AI Mobile App Builder

## Quick Start

1. Open \`index.html\` in your browser
2. Or deploy to any static hosting (Vercel, Netlify, GitHub Pages)

## Screens

${screens.map((s, i) => `${i + 1}. ${s.name}`).join('\n')}

## Deploy as PWA

Upload all files to any static host. The \`manifest.json\` is included for PWA support.
`);

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${slug}-appforge.zip`);
}

function generateIndexHtml(appName: string, screens: AppScreen[], isPWA = false): string {
  const screenNames = screens.map(s => s.name);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <title>${appName}</title>
  ${isPWA ? '<link rel="manifest" href="manifest.json">' : ''}
  <meta name="theme-color" content="#6366f1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #0a0a0f; overflow: hidden; height: 100vh; }
    .screen { display: none; width: 100vw; height: calc(100vh - 60px); overflow-y: auto; }
    .screen.active { display: block; }
    iframe { width: 100%; height: 100%; border: none; }
    .tab-bar {
      position: fixed; bottom: 0; left: 0; right: 0; height: 60px;
      background: rgba(10,10,15,0.95); backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: space-around;
      z-index: 100; padding: 0 8px;
    }
    .tab-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      justify-content: center; gap: 2px; padding: 8px 4px;
      color: rgba(255,255,255,0.5); font-size: 10px; font-weight: 500;
      border: none; background: none; cursor: pointer; transition: color 0.2s;
    }
    .tab-btn.active { color: #6366f1; }
    .tab-btn svg { width: 20px; height: 20px; }
    .splash { position: fixed; inset: 0; background: #0a0a0f; display: flex;
      flex-direction: column; align-items: center; justify-content: center;
      z-index: 200; transition: opacity 0.5s; }
    .splash.hidden { opacity: 0; pointer-events: none; }
    .splash h1 { font-size: 28px; font-weight: 700; color: white; margin-top: 16px; }
    .splash p { color: rgba(255,255,255,0.5); font-size: 14px; margin-top: 8px; }
    .loader { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #6366f1; border-radius: 50%; animation: spin 0.8s linear infinite; margin-top: 24px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <!-- Splash Screen -->
  <div class="splash" id="splash">
    <div style="width:64px;height:64px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;display:flex;align-items:center;justify-content:center;">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></svg>
    </div>
    <h1>${appName}</h1>
    <p>Built with AppForge</p>
    <div class="loader"></div>
  </div>

  ${screens.map((screen, i) => `
  <div class="screen${i === 0 ? ' active' : ''}" id="screen-${i}">
    <iframe srcdoc="${escapeHtml(injectWatermark(screen.html))}" loading="${i === 0 ? 'eager' : 'lazy'}"></iframe>
  </div>`).join('\n')}

  <!-- Bottom Tab Bar -->
  <nav class="tab-bar">
    ${screenNames.map((name, i) => `
    <button class="tab-btn${i === 0 ? ' active' : ''}" onclick="navigateTo(${i})" data-index="${i}">
      <span style="font-size:16px">${getScreenIcon(name)}</span>
      <span>${name}</span>
    </button>`).join('')}
  </nav>

  <script>
    let current = 0;
    const screens = document.querySelectorAll('.screen');
    const tabs = document.querySelectorAll('.tab-btn');
    
    window.navigateTo = function(index) {
      screens[current].classList.remove('active');
      tabs[current].classList.remove('active');
      current = Math.max(0, Math.min(index, screens.length - 1));
      screens[current].classList.add('active');
      tabs[current].classList.add('active');
    };

    // Swipe navigation
    let startX = 0;
    document.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    document.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) navigateTo(current + (diff > 0 ? 1 : -1));
    });

    // Hide splash after load
    window.addEventListener('load', () => {
      setTimeout(() => document.getElementById('splash').classList.add('hidden'), 800);
    });

    ${isPWA ? `// Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }` : ''}
  </script>
</body>
</html>`;
}

function getScreenIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('home') || lower.includes('dashboard')) return '🏠';
  if (lower.includes('profile') || lower.includes('account')) return '👤';
  if (lower.includes('setting')) return '⚙️';
  if (lower.includes('chat') || lower.includes('message')) return '💬';
  if (lower.includes('search') || lower.includes('explore')) return '🔍';
  if (lower.includes('cart') || lower.includes('shop')) return '🛒';
  if (lower.includes('workout') || lower.includes('fitness')) return '💪';
  if (lower.includes('progress') || lower.includes('stat')) return '📊';
  return '📱';
}

const WATERMARK = '<div style="position:fixed;bottom:4px;left:0;right:0;text-align:center;font-size:10px;color:rgba(255,255,255,0.2);pointer-events:none;z-index:999;">Built with AppForge</div>';

function injectWatermark(html: string): string {
  // Insert watermark before closing </div> or at end
  if (html.includes('</body>')) {
    return html.replace('</body>', `${WATERMARK}</body>`);
  }
  return html + WATERMARK;
}

function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function exportAsPWA(
  appName: string,
  screens: AppScreen[],
  description: string = ''
) {
  // Same as ZIP but with service worker
  const zip = new JSZip();
  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  zip.file('index.html', generateIndexHtml(appName, screens, true));
  screens.forEach((screen) => {
    zip.file(`screens/${screen.name.toLowerCase().replace(/\s+/g, '-')}.html`, injectWatermark(screen.html));
  });

  zip.file('manifest.json', JSON.stringify({
    name: appName,
    short_name: appName,
    description: description || `${appName} - Built with AppForge`,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#6366f1',
  }, null, 2));

  // Basic service worker for offline support
  zip.file('sw.js', `
const CACHE = '${slug}-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
`);

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, `${slug}-pwa.zip`);
}
