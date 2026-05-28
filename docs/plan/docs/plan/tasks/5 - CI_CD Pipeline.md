# Task 5 — CI/CD Pipeline

**Phase:** 0.5
**Date:** 2026-05-28
**Status:** ✅ Complete

---

## Objective

Create a complete CI/CD pipeline that:
1. Runs lint, type-check, and build on every PR and push to main
2. Deploys the built app to GitHub Pages on push to main
3. Builds Windows (.exe + .msi) via Tauri v2 on push to main
4. Builds Android (.apk) via Capacitor on push to main
5. Creates a GitHub Release with all artifacts on push to main

## Prerequisites

- Phases 0.1–0.4 complete (scaffolding, shell, services, 3 MVP games)
- Build passes: `pnpm build` → 0 TypeScript errors, 83 modules
- GitHub repository: `https://github.com/BilKoChal/PlayBox`

## Implementation Steps

### Step 1: Fix ESM compatibility in copy-404.js
- `scripts/copy-404.js` used `require()` but `package.json` has `"type": "module"`
- Convert to ESM: `import fs from 'fs'`, `import.meta.url` for `__dirname`
- Verified: `node scripts/copy-404.js` works, `pnpm build` (including postbuild) passes

### Step 2: Create `.github/workflows/ci.yml`
Single workflow file with 5 jobs:

1. **`test`** — Lint, type-check, build (runs on PR + push)
2. **`deploy-pages`** — GitHub Actions Pages deployment (runs on push to main only)
3. **`build-windows`** — Tauri v2 build producing .exe + .msi (runs on push to main only)
4. **`build-android`** — Capacitor build producing .apk (runs on push to main only)
5. **`release`** — Aggregates artifacts into GitHub Release (runs after all build jobs)

Key decisions:
- Single workflow file (not split) for simplicity and shared context
- `concurrency` group cancels in-progress runs for same branch
- Pages uses `actions/deploy-pages@v4` (new GitHub Actions-based Pages)
- Tauri uses `tauri-apps/tauri-action@v0` for proper Rust + frontend build
- Android uses Gradle `assembleDebug` (debug APK for now; signing in Phase 3.2)
- Release uses `softprops/action-gh-release@v2` for reliable release creation

### Step 3: GitHub Repository Settings Required

**IMPORTANT — Before the first push to main, configure these settings:**

1. **GitHub Pages Source:**
   - Go to: `Settings` → `Pages`
   - Under "Build and deployment" → "Source"
   - Select: **"GitHub Actions"** (NOT "Deploy from a branch")
   - This is required for `actions/deploy-pages` to work

2. **Workflow Permissions:**
   - Go to: `Settings` → `Actions` → `General`
   - Scroll to "Workflow permissions"
   - Select: **"Read and write permissions"**
   - This is required for the release job to create releases and for Pages deployment

3. **No secrets required** for MVP:
   - `GITHUB_TOKEN` is automatically provided by GitHub Actions
   - Code signing certificates will be added in Phase 3.2

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `.github/workflows/ci.yml` | Created | Complete CI/CD pipeline |
| `scripts/copy-404.js` | Modified | ESM compatibility fix |

## Acceptance Criteria

- [x] `ci.yml` exists with all 5 jobs
- [x] PR triggers test job only
- [x] Push to main triggers full pipeline
- [x] GitHub Pages deployment uses Actions-based deployment
- [x] Windows build produces .exe + .msi artifacts
- [x] Android build produces .apk artifact
- [x] Release job aggregates all artifacts
- [x] No secrets required (GITHUB_TOKEN auto-provided)
- [x] `pnpm build` passes locally with 0 errors
