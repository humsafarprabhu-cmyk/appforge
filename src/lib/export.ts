'use client';

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface AppScreen {
  name: string;
  html: string;
}

export async function exportAsZip(
  appName: string,
  screens: AppScreen[],
  description: string = ''
) {
  const zip = new JSZip();
  const slug = appName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Generate index.html with navigation between screens
  const indexHtml = generateIndexHtml(appName, screens);
  zip.file('index.html', indexHtml);

  // Individual screen files
  screens.forEach((screen, i) => {
    zip.file(`screens/${screen.name.toLowerCase().replace(/\s+/g, '-')}.html`, screen.html);
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

function generateIndexHtml(appName: string, screens: AppScreen[]): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${appName}</title>
  <link rel="manifest" href="/manifest.json">
  <meta name="theme-color" content="#6366f1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; background: #0a0a0f; overflow: hidden; }
    .screen { display: none; width: 100vw; height: 100vh; overflow-y: auto; }
    .screen.active { display: block; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  ${screens.map((screen, i) => `
  <div class="screen${i === 0 ? ' active' : ''}" id="screen-${i}">
    <iframe srcdoc="${escapeHtml(screen.html)}"></iframe>
  </div>`).join('\n')}

  <script>
    let current = 0;
    const screens = document.querySelectorAll('.screen');
    
    window.navigateTo = function(index) {
      screens[current].classList.remove('active');
      current = Math.max(0, Math.min(index, screens.length - 1));
      screens[current].classList.add('active');
    };

    // Swipe navigation
    let startX = 0;
    document.addEventListener('touchstart', e => startX = e.touches[0].clientX);
    document.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        navigateTo(current + (diff > 0 ? 1 : -1));
      }
    });
  </script>
</body>
</html>`;
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

  zip.file('index.html', generateIndexHtml(appName, screens));
  screens.forEach((screen) => {
    zip.file(`screens/${screen.name.toLowerCase().replace(/\s+/g, '-')}.html`, screen.html);
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
