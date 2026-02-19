# AppForge AI Generation System — Complete Rewrite Plan

## Problem
Current generation produces "college project" quality apps:
- Static HTML with no interactivity
- Generic screen names (Feature1, Feature2)
- Placeholder content ("[Pie Chart Placeholder]")
- No working navigation between screens
- No forms, inputs, or data management
- Looks nothing like a real mobile app

## Target: 10/10 Production Quality
Apps should look and feel like REAL apps from the App Store. Users should be able to:
- Tap buttons and see responses
- Navigate between screens via bottom nav
- Fill forms and see data
- Toggle switches
- See charts/graphs rendered (SVG)
- Experience smooth animations
- Get an app that's ready to publish as PWA/APK

## Architecture Changes

### 1. Smart Onboarding Chat (Pre-Generation)
Before generating ANY code, the AI agent asks:
- "What's your app about?" (already exists)
- "Do you need user login/authentication?"
- "Should user data be saved between sessions?"
- "What are the main screens you want?" (let user name them)
- "Any specific features? (notifications, payments, dark/light mode)"
- "What's the color scheme? (or let AI choose)"

The AI builds a SPEC before generating code.

### 2. Mega System Prompt (The Secret Sauce)
The system prompt must include:
- 2026 mobile UI design patterns (glassmorphism, micro-interactions)
- A complete component reference (how to build navbars, cards, lists, forms, charts)
- CSS animation library (transitions, transforms, keyframes)
- SVG chart templates (pie, bar, line — no placeholders!)
- Working JavaScript for interactivity
- LocalStorage patterns for data persistence
- Bottom navigation that ACTUALLY switches screens (via JS)
- Proper status bar, safe areas, scrolling
- Touch-friendly hit targets (min 44px)

### 3. Screen Generation Rules
- Screen names come from the app type (not "Feature1")
  - Fitness → Dashboard, Workouts, Progress, Profile, Settings
  - E-commerce → Home, Products, Cart, Orders, Account
  - Finance → Overview, Transactions, Budget, Reports, Settings
- Each screen 300+ lines minimum
- Every screen must have working JavaScript
- Bottom nav highlights current screen
- Smooth page transitions

### 4. Interactive Emulator
- iframe renders self-contained HTML+CSS+JS
- JavaScript inside iframe handles:
  - Button clicks → show responses/modals
  - Form submissions → save to localStorage
  - Navigation → switch visible sections
  - Animations → CSS transitions + requestAnimationFrame
  - Charts → SVG-based, no external libs
  - Toggles/switches → visual state changes
- The preview IS the app — same code exports to PWA/APK

### 5. Data Persistence (Edit Mode)
- Screens saved to Supabase as JSONB (already working with params fix)
- Chat history saved to Supabase chat_messages table
- When user returns: load screens + chat history
- AI gets full context of previous conversation
- User can say "change the header to blue" and AI updates only that

### 6. Version History
- Each generation creates a new version
- User can see version history
- Rollback to any previous version

## Implementation Order
1. Rewrite system prompt → MASSIVE quality jump
2. Add onboarding chat flow → smart requirement gathering
3. Fix screen naming → context-aware names
4. Add interactivity to generated HTML → working JS
5. Fix data persistence → screens load on re-edit
6. Add version history → rollback capability
