export const APP_NAME = 'AppForge';
export const APP_DESCRIPTION = 'Describe your app. It\'s on your phone in 2 minutes.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const OPENAI_MODEL = 'gpt-4o';
export const MAX_CODE_TOKENS = 8000;
export const MAX_CHAT_TOKENS = 4000;

export const BUILD_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
export const PREVIEW_REFRESH_DELAY_MS = 2000;

export const PHONE_FRAMES = [
  { id: 'iphone15', name: 'iPhone 15 Pro', width: 393, height: 852, bezel: 12 },
  { id: 'pixel8', name: 'Pixel 8', width: 412, height: 915, bezel: 10 },
  { id: 'samsung', name: 'Galaxy S24', width: 360, height: 780, bezel: 8 },
] as const;

export const DEFAULT_PHONE_FRAME = 'iphone15';

export const DEFAULT_APP_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  accent: '#06b6d4',
  background: '#0a0a0f',
  surface: 'rgba(255,255,255,0.05)',
  text: '#ffffff',
  textSecondary: '#a1a1aa',
};

export const PACKAGE_NAME_PREFIX = 'com.appforge';

export const SUPPORT_EMAIL = 'support@appforge.ai';
