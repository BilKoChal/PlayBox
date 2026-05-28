# Worklog — Task 5: CI/CD Pipeline

**Task ID:** 5
**Phase:** 0.5
**Start Time:** 2026-05-28
**End Time:** 2026-05-28
**Status:** Complete ✅

---

## What Was Done

1. **Fixed `scripts/copy-404.js` ESM compatibility**:
   - The script used `require()` and `__dirname` but `package.json` has `"type": "module"`
   - Converted to ESM: `import fs from 'fs'`, `import path from 'path'`, `import.meta.url` for `__dirname`
   - Verified: `node scripts/copy-404.js` runs successfully, generates `dist/404.html`

2. **Created `.github/workflows/ci.yml`** — Full CI/CD pipeline with 5 jobs:
   - **test**: Lint, type-check, build on every PR and push (ubuntu-latest, Node 20, pnpm 9)
   - **deploy-pages**: GitHub Actions Pages deployment on push to main (uses `actions/deploy-pages@v4`)
   - **build-windows**: Tauri v2 build on Windows runner (produces .exe + .msi via `tauri-apps/tauri-action@v0`)
   - **build-android**: Capacitor Android build on Ubuntu (produces debug .apk via Gradle)
   - **release**: Aggregates all artifacts into GitHub Release using `softprops/action-gh-release@v2`

3. **Key design decisions**:
   - Single workflow file (not split) for simplicity — all jobs share context
   - `concurrency` group cancels in-progress runs for same branch
   - Pages uses new GitHub Actions-based deployment (NOT "deploy from branch")
   - Android builds debug APK for MVP (signing comes in Phase 3.2)
   - No secrets required beyond default `GITHUB_TOKEN`
   - `deploy-pages` adds `.nojekyll` file for proper GitHub Pages asset serving

4. **Verified build locally**:
   - `tsc -b`: 0 errors
   - `vite build`: 83 modules, 4.55s
   - `pnpm build` (including postbuild copy-404): passes

---

## Problems Encountered & Resolutions

| Problem | Resolution |
|---------|-----------|
| `scripts/copy-404.js` uses `require()` but package is ESM | Converted to ESM with `import` and `import.meta.url` |
| `pnpm tsc` fails outside project directory | Need to run from project root (`cd /home/z/my-project/PlayBox`) |
| Plan called for 6 jobs including `determine-version` | Consolidated to 5 jobs — version read from `package.json` in release job |

---

## Files Changed

### Created (1 new file):
- `.github/workflows/ci.yml` — Complete CI/CD pipeline

### Modified (1 file):
- `scripts/copy-404.js` — ESM compatibility fix (require → import)

---

## GitHub Repository Settings Required

**Before pushing to main, the user MUST configure these settings:**

1. **Pages Source**:
   - Go to: `Settings` → `Pages`
   - Under "Build and deployment" → "Source"
   - Select: **"GitHub Actions"** (NOT "Deploy from a branch")

2. **Workflow Permissions**:
   - Go to: `Settings` → `Actions` → `General`
   - Scroll to "Workflow permissions"
   - Select: **"Read and write permissions"**

3. **No secrets needed** for MVP — `GITHUB_TOKEN` is auto-provided.

---

## Tests Run & Results

| Test | Command | Result |
|------|---------|--------|
| TypeScript compilation | `tsc -b` | ✅ Pass (zero errors) |
| Vite production build | `vite build` | ✅ Pass (83 modules, 4.55s) |
| Full build (tsc + vite + copy-404) | `pnpm build` | ✅ Pass |
