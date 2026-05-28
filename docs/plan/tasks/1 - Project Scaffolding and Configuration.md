# Task 1 — Project Scaffolding & Configuration (Phase 0, Sub-Phase 0.1)

**Task ID:** 1  
**Phase:** 0.1  
**Status:** In Progress  
**Created:** 2026-05-28  

---

## Objective

Initialize the PlayBox project from scratch: create the Vite + React + TypeScript project, configure all tooling (Tailwind CSS, ESLint, Prettier), set up the folder structure, define the canonical `PlayBoxGame` interface, configure Tauri v2 for Windows builds, Capacitor for Android builds, create PWA manifest, and write build/utility scripts.

---

## Prerequisites

- ✅ Planning docs complete (`docs/plan/PlayBox_plan.md`, `docs/plan/PlayBox_synthesis.md`)
- ✅ Research reports complete (`docs/reports/`)
- ✅ Git repo initialized with `main` branch

---

## Step-by-Step Implementation

### Step 1: Create `package.json`
- Define project name, version (0.1.0), scripts (dev, build, preview, lint, format, test)
- Dependencies: react@19, react-dom@19, react-router-dom@7, kaboom@3000, phaser@3.80, fuse.js@7, dexie@4
- DevDependencies: vite@6, @vitejs/plugin-react, typescript@5.6, tailwindcss@4, @tailwindcss/vite, eslint, prettier, vitest, @types/react, @types/react-dom

### Step 2: Create `vite.config.ts`
- React plugin
- `manualChunks` for engine splitting (kaboom chunk, phaser chunk)
- Base path for GitHub Pages (`/PlayBox/`)
- PWA plugin placeholder (configured in Phase 0.6)

### Step 3: Create `tsconfig.json`
- Strict mode enabled
- JSX preserve for React
- Path aliases (`@/` → `src/`)
- Module resolution bundler

### Step 4: Create `tailwind.config.ts` + `postcss.config.js`
- PlayBox design tokens: candy palette (Sunshine Yellow #FFB830, Candy Blue #4DA8DA, etc.)
- Nunito + Quicksand font families
- Dark mode class-based
- Custom animations (hover-lift, heart-bounce, shimmer, confetti)

### Step 5: Create ESLint + Prettier configs
- `.eslintrc.cjs` with React + TypeScript rules
- `.prettierrc` with consistent formatting

### Step 6: Create `index.html`
- Font preconnects for Google Fonts (Nunito, Quicksand)
- Root div with id="root"
- Meta viewport for mobile

### Step 7: Create `src/types/game.ts`
- Canonical `PlayBoxGame` interface (from Engine Specialist report)
- `GameMetadata`, `MountOptions`, `GameUtilities`, `Difficulty` types
- `GameCategory` enum with 8 categories

### Step 8: Create `src/` folder structure + entry files
- `src/main.tsx` — React entry point
- `src/App.tsx` — Root with router + providers placeholder
- `src/styles/globals.css` — Tailwind directives + custom CSS properties
- Empty directories with `.gitkeep`: components/(layout,game,ui,feedback), hooks, contexts, pages, lib, games

### Step 9: Create PWA manifest + public assets
- `public/manifest.json` — PWA manifest with PlayBox branding
- `public/icons/` — placeholder directory
- `public/robots.txt`

### Step 10: Create scripts
- `scripts/generate-game-registry.ts` — scans `src/games/` and generates `src/game-registry.generated.ts`
- `scripts/copy-404.js` — copies index.html to 404.html for SPA routing on GitHub Pages

### Step 11: Create `src-tauri/` (Tauri v2)
- `Cargo.toml` with Tauri dependencies
- `tauri.conf.json` with app config (window size, title, etc.)
- `src/main.rs` + `src/lib.rs` — Rust entry points
- `icons/` placeholder

### Step 12: Create `android/` + `capacitor.config.ts` (Capacitor)
- `capacitor.config.ts` — Capacitor configuration
- `android/app/build.gradle` — Android app build config
- `android/build.gradle` — Root Android build config
- `android/settings.gradle` — Android settings
- `android/app/src/main/AndroidManifest.xml` — Android manifest

### Step 13: Install dependencies
- Run `pnpm install` to install all packages

---

## Files to Create

| File | Purpose |
|------|---------|
| `package.json` | Project manifest & dependencies |
| `pnpm-lock.yaml` | Lock file (generated) |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` | Vite build configuration |
| `tailwind.config.ts` | Tailwind CSS with PlayBox tokens |
| `postcss.config.js` | PostCSS configuration |
| `.eslintrc.cjs` | ESLint configuration |
| `.prettierrc` | Prettier configuration |
| `index.html` | SPA entry HTML |
| `src/main.tsx` | React entry point |
| `src/App.tsx` | Root component |
| `src/types/game.ts` | PlayBoxGame interface |
| `src/styles/globals.css` | Global styles |
| `public/manifest.json` | PWA manifest |
| `public/robots.txt` | Robots file |
| `scripts/generate-game-registry.ts` | Game registry generator |
| `scripts/copy-404.js` | SPA routing fix |
| `src-tauri/Cargo.toml` | Tauri Rust manifest |
| `src-tauri/tauri.conf.json` | Tauri app config |
| `src-tauri/src/main.rs` | Tauri Rust main |
| `src-tauri/src/lib.rs` | Tauri Rust lib |
| `capacitor.config.ts` | Capacitor config |
| `android/app/build.gradle` | Android app build |
| `android/build.gradle` | Android root build |
| `android/settings.gradle` | Android settings |

---

## Testing Approach

- Run `pnpm build` to verify the project compiles without errors
- Run `pnpm lint` to verify ESLint passes
- Verify `src/types/game.ts` compiles with strict TypeScript

---

## Acceptance Criteria

- [ ] `pnpm install` completes without errors
- [ ] `pnpm build` completes without errors
- [ ] `pnpm lint` passes with zero errors
- [ ] All directories from the plan structure exist
- [ ] `PlayBoxGame` interface is defined with all required fields
- [ ] Tauri v2 configuration is valid
- [ ] Capacitor configuration is valid
- [ ] PWA manifest is valid JSON
- [ ] Scripts are executable
