# PlayBox CI/CD & Cross-Platform Build Specialist Report

> **Project**: PlayBox — Web-based game station platform with 50+ casual games  
> **Stack**: React + Vite + TypeScript | Tauri v2 (Windows) | Capacitor (Android)  
> **CI/CD**: GitHub Actions | GitHub Pages | GitHub Releases  
> **Author**: CI/CD & Cross-Platform Build Specialist  
> **Date**: 2026-03-04

---

## Table of Contents

1. [GitHub Actions Workflow Architecture](#1-github-actions-workflow-architecture)
2. [GitHub Pages Deployment](#2-github-pages-deployment)
3. [Tauri v2 Windows Build](#3-tauri-v2-windows-build)
4. [Capacitor Android Build](#4-capacitor-android-build)
5. [Versioning Strategy Implementation](#5-versioning-strategy-implementation)
6. [GitHub Release Management](#6-github-release-management)
7. [Workflow Optimization](#7-workflow-optimization)
8. [Branch Protection & Workflow Triggers](#8-branch-protection--workflow-triggers)
9. [Appendix: Complete Unified Workflow File](#9-appendix-complete-unified-workflow-file)

---

## 1. GitHub Actions Workflow Architecture

### 1.1 Design Philosophy

The PlayBox CI/CD pipeline follows a **fan-out / fan-in** architecture. On every push to `main`, a single workflow dispatches multiple parallel jobs: one for web deployment, one for the Windows Tauri build, and one for the Android Capacitor build. Once all platform builds complete, a final release job aggregates all artifacts into a single GitHub Release. This design maximizes parallelism, minimizes total wall-clock time, and ensures that a failure in one platform does not block the others from being published.

The architecture is intentionally kept as a **single workflow file** (`ci.yml`) rather than multiple separate workflow files. The rationale is threefold: (1) it avoids race conditions between independent workflows trying to create the same release, (2) it allows sharing a computed version number across all jobs via `outputs`, and (3) it simplifies concurrency control with a single `concurrency` group. However, we also provide a lightweight separate workflow (`deploy-pages.yml`) for the GitHub Pages deployment so that it can be triggered independently and benefit from the dedicated `actions/deploy-pages` action's concurrency management.

### 1.2 High-Level Pipeline Flow

```
Push to main
    │
    ├── [Job 1] determine-version
    │       Computes version from conventional commits
    │       Outputs: version, bump_type
    │
    ├── [Job 2] test (parallel, depends on determine-version)
    │       Lint, type-check, unit tests
    │
    ├── [Job 3] deploy-pages (parallel, depends on determine-version)
    │       Build Vite → Deploy to GitHub Pages
    │
    ├── [Job 4] build-windows (parallel, depends on test)
    │       Build Tauri v2 → .exe + .msi artifacts
    │
    ├── [Job 5] build-android (parallel, depends on test)
    │       Build Capacitor → signed .apk artifact
    │
    └── [Job 6] release (depends on build-windows + build-android)
            Create GitHub Release with all artifacts
```

### 1.3 Complete Main Workflow File — `.github/workflows/ci.yml`

```yaml
name: PlayBox CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: playbox-ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: write
  pages: write
  id-token: write

env:
  NODE_VERSION: "20"
  RUST_VERSION: "1.82"
  JAVA_VERSION: "17"

jobs:
  # ──────────────────────────────────────────────────────
  # Job 1: Determine Version
  # ──────────────────────────────────────────────────────
  determine-version:
    name: 🔢 Determine Version
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    outputs:
      version: ${{ steps.version.outputs.version }}
      bump_type: ${{ steps.version.outputs.bump_type }}
      is_release: ${{ steps.version.outputs.is_release }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Determine version bump from conventional commits
        id: version
        run: |
          # Get all commits since the last tag
          LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
          
          if [ -z "$LAST_TAG" ]; then
            COMMITS=$(git log --format="%s" HEAD)
          else
            COMMITS=$(git log --format="%s" "${LAST_TAG}..HEAD")
          fi
          
          # Default to patch bump
          BUMP_TYPE="patch"
          
          # Check for breaking changes (major) — not used during 0.x but ready for 1.0.0
          if echo "$COMMITS" | grep -qE "^[a-z]+(\(.+\))?!:"; then
            BUMP_TYPE="major"
          # Check for features (minor)
          elif echo "$COMMITS" | grep -qE "^feat(\(.+\))?:"; then
            BUMP_TYPE="minor"
          # Check for game additions — treat as minor
          elif echo "$COMMITS" | grep -qE "^feat\(game\):|game:|new game|add game"; then
            BUMP_TYPE="minor"
          fi
          
          # Read current version from package.json
          CURRENT_VERSION=$(node -p "require('./package.json').version")
          IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
          
          # Apply bump
          if [ "$BUMP_TYPE" = "major" ]; then
            MAJOR=$((MAJOR + 1))
            MINOR=0
            PATCH=0
          elif [ "$BUMP_TYPE" = "minor" ]; then
            MINOR=$((MINOR + 1))
            PATCH=0
          else
            PATCH=$((PATCH + 1))
          fi
          
          NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
          
          echo "version=${NEW_VERSION}" >> "$GITHUB_OUTPUT"
          echo "bump_type=${BUMP_TYPE}" >> "$GITHUB_OUTPUT"
          echo "is_release=true" >> "$GITHUB_OUTPUT"
          
          echo "📦 Version: ${CURRENT_VERSION} → ${NEW_VERSION} (${BUMP_TYPE} bump)"

      - name: Update package.json version
        if: github.ref == 'refs/heads/main'
        run: |
          VERSION=${{ steps.version.outputs.version }}
          node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            pkg.version = '${VERSION}';
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
          "

      - name: Commit version bump
        if: github.ref == 'refs/heads/main'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add package.json
          git diff --cached --quiet || git commit -m "chore: bump version to ${{ steps.version.outputs.version }} [skip ci]"
          git push

  # ──────────────────────────────────────────────────────
  # Job 2: Test
  # ──────────────────────────────────────────────────────
  test:
    name: 🧪 Test & Lint
    runs-on: ubuntu-latest
    needs: determine-version
    if: always() && needs.determine-version.result != 'failed'
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npx tsc --noEmit

      - name: Lint
        run: npm run lint --if-present

      - name: Unit tests
        run: npm run test --if-present

      - name: Build web (smoke test)
        run: npm run build

  # ──────────────────────────────────────────────────────
  # Job 3: Deploy to GitHub Pages
  # ──────────────────────────────────────────────────────
  deploy-pages:
    name: 🌐 Deploy to GitHub Pages
    runs-on: ubuntu-latest
    needs: [determine-version, test]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Update version in package.json
        run: |
          VERSION=${{ needs.determine-version.outputs.version }}
          node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            pkg.version = '${VERSION}';
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
          "

      - name: Build Vite app
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ needs.determine-version.outputs.version }}

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

  # ──────────────────────────────────────────────────────
  # Job 4: Build Windows (Tauri v2)
  # ──────────────────────────────────────────────────────
  build-windows:
    name: 🪟 Build Windows
    runs-on: windows-latest
    needs: [determine-version, test]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: ${{ env.RUST_VERSION }}

      - name: Rust cache
        uses: swatinem/rust-cache@v2
        with:
          workspaces: "./src-tauri -> target"

      - name: Install frontend dependencies
        run: npm ci

      - name: Update version across config files
        shell: bash
        run: |
          VERSION=${{ needs.determine-version.outputs.version }}
          # Update tauri.conf.json
          node -e "
            const fs = require('fs');
            const path = require('path');
            const tauriConfPath = path.join('src-tauri', 'tauri.conf.json');
            const conf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
            conf.version = '${VERSION}';
            fs.writeFileSync(tauriConfPath, JSON.stringify(conf, null, 2) + '\n');
          "

      - name: Build Tauri app
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # Signing — set these secrets for production signed builds
          # TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          # TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          tagName: v__VERSION__
          releaseName: "PlayBox v__VERSION__"
          releaseBody: "See the assets below to download and install PlayBox."
          releaseDraft: true
          prerelease: false
          includeDebug: false

      - name: Upload Windows artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows-artifacts
          path: |
            src-tauri/target/release/bundle/nsis/*.exe
            src-tauri/target/release/bundle/msi/*.msi
          retention-days: 5

  # ──────────────────────────────────────────────────────
  # Job 5: Build Android (Capacitor)
  # ──────────────────────────────────────────────────────
  build-android:
    name: 🤖 Build Android
    runs-on: ubuntu-latest
    needs: [determine-version, test]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: "zulu"
          java-version: ${{ env.JAVA_VERSION }}
          cache: "gradle"

      - name: Install frontend dependencies
        run: npm ci

      - name: Build Vite app
        run: npm run build

      - name: Install Capacitor CLI & sync
        run: |
          npx cap sync android

      - name: Update version in Android build.gradle
        run: |
          VERSION=${{ needs.determine-version.outputs.version }}
          VERSION_CODE=$(echo "$VERSION" | awk -F. '{printf "%d%02d%02d", $1, $2, $3}')
          sed -i "s/versionName \".*\"/versionName \"${VERSION}\"/" android/app/build.gradle
          sed -i "s/versionCode [0-9]*/versionCode ${VERSION_CODE}/" android/app/build.gradle

      - name: Build Android APK (debug — for testing)
        if: env.SIGNING_KEY_BASE64 == ''
        working-directory: android
        run: ./gradlew assembleDebug

      - name: Build Android APK (signed — for release)
        if: env.SIGNING_KEY_BASE64 != ''
        working-directory: android
        env:
          SIGNING_KEY_BASE64: ${{ secrets.ANDROID_SIGNING_KEY_BASE64 }}
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          # Decode keystore from base64 secret
          echo "$SIGNING_KEY_BASE64" | base64 --decode > android/app/release.keystore
          ./gradlew assembleRelease \
            -Pandroid.injected.signing.store.file=app/release.keystore \
            -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
            -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
            -Pandroid.injected.signing.key.password="$KEY_PASSWORD"

      - name: Upload Android artifacts
        uses: actions/upload-artifact@v4
        with:
          name: android-artifacts
          path: |
            android/app/build/outputs/apk/debug/*.apk
            android/app/build/outputs/apk/release/*.apk
          retention-days: 5

  # ──────────────────────────────────────────────────────
  # Job 6: Create Unified Release
  # ──────────────────────────────────────────────────────
  release:
    name: 🚀 Create Release
    runs-on: ubuntu-latest
    needs: [determine-version, build-windows, build-android]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Download Windows artifacts
        uses: actions/download-artifact@v4
        with:
          name: windows-artifacts
          path: artifacts/windows

      - name: Download Android artifacts
        uses: actions/download-artifact@v4
        with:
          name: android-artifacts
          path: artifacts/android

      - name: Generate release notes
        id: release_notes
        run: |
          LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
          VERSION="${{ needs.determine-version.outputs.version }}"
          
          echo "## What's Changed" > release_notes.md
          echo "" >> release_notes.md
          
          if [ -n "$LAST_TAG" ]; then
            # Categorize commits
            FEATURES=$(git log --format="- %s" "${LAST_TAG}..HEAD" --grep="^feat" 2>/dev/null || true)
            FIXES=$(git log --format="- %s" "${LAST_TAG}..HEAD" --grep="^fix" 2>/dev/null || true)
            OTHER=$(git log --format="- %s" "${LAST_TAG}..HEAD" --invert-grep --grep="^feat" --invert-grep --grep="^fix" 2>/dev/null || true)
            
            if [ -n "$FEATURES" ]; then
              echo "### 🎮 New Features" >> release_notes.md
              echo "$FEATURES" >> release_notes.md
              echo "" >> release_notes.md
            fi
            
            if [ -n "$FIXES" ]; then
              echo "### 🐛 Bug Fixes" >> release_notes.md
              echo "$FIXES" >> release_notes.md
              echo "" >> release_notes.md
            fi
            
            if [ -n "$OTHER" ]; then
              echo "### 🔧 Other Changes" >> release_notes.md
              echo "$OTHER" >> release_notes.md
              echo "" >> release_notes.md
            fi
          else
            echo "Initial release of PlayBox!" >> release_notes.md
          fi
          
          echo "" >> release_notes.md
          echo "### 📦 Downloads" >> release_notes.md
          echo "" >> release_notes.md
          echo "| Platform | File | Notes |" >> release_notes.md
          echo "|----------|------|-------|" >> release_notes.md
          echo "| Windows | PlayBox_\${VERSION}_x64-setup.exe | NSIS installer |" >> release_notes.md
          echo "| Windows | PlayBox_\${VERSION}_x64_en-US.msi | MSI installer |" >> release_notes.md
          echo "| Android | app-release.apk | Side-load APK |" >> release_notes.md
          echo "| Web | GitHub Pages | https://$(echo ${{ github.repository }} | sed 's|/|.github.io/|') |" >> release_notes.md
          
          echo "" >> release_notes.md
          echo "**Full Changelog**: https://github.com/${{ github.repository }}/compare/${LAST_TAG}...v${VERSION}" >> release_notes.md

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ needs.determine-version.outputs.version }}
          name: "PlayBox v${{ needs.determine-version.outputs.version }}"
          body_path: release_notes.md
          draft: false
          prerelease: ${{ startsWith(needs.determine-version.outputs.version, '0.') }}
          files: |
            artifacts/windows/**/*
            artifacts/android/**/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 1.4 Architecture Decisions Explained

**Why a single workflow over reusable workflows?** For a project of PlayBox's size, a single workflow keeps the version computation, artifact passing, and release logic coherent. Reusable workflows introduce complexity in passing outputs between caller and callee, and they make it harder to ensure atomic release creation. If the project grows to include iOS or macOS targets, we can refactor individual jobs into reusable workflow calls while maintaining the same fan-out / fan-in topology.

**Why `needs` dependencies are structured as they are:** The `test` job gates both `build-windows` and `build-android` to ensure we never build native packages from broken code. The `deploy-pages` job is parallel with the native builds because the web deployment is independent and can complete faster, giving users access to the web version while native installers are still compiling. The `release` job waits for both native builds to ensure all artifacts are available before creating the release.

**Why we use `actions/upload-artifact` + `actions/download-artifact` instead of `tauri-action`'s built-in release:** The `tauri-action` is configured to create a draft release with only Windows artifacts. Our dedicated `release` job then downloads all artifacts and creates the final, unified release using `softprops/action-gh-release`. This avoids the problem of multiple jobs racing to create the same release tag. An alternative approach is to have `tauri-action` not create a release at all (by omitting `tagName`), and let the `release` job handle everything uniformly.

---

## 2. GitHub Pages Deployment

### 2.1 Complete Pages Deployment Workflow — `.github/workflows/deploy-pages.yml`

While the main `ci.yml` includes an inline Pages deployment job, a separate workflow provides flexibility for manual re-deployments and ensures the Pages-specific concurrency group is correctly managed. This workflow can be triggered independently when only the web deployment needs updating (e.g., hotfixing a typo on the landing page without rebuilding native apps).

```yaml
name: Deploy to GitHub Pages

on:
  # Re-run deployment on push to main (acts as a fast-path for web-only changes)
  push:
    branches: [main]
    paths:
      - "src/**"
      - "public/**"
      - "index.html"
      - "vite.config.ts"
      - "package.json"
      - "package-lock.json"
  # Allow manual re-deployment
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
# However, do NOT cancel in-progress runs as we want these deployments to complete.
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # Build job
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_APP_VERSION: ${{ github.ref_type == 'tag' && github.ref_name || 'dev' }}

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  # Deployment job
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2.2 Repository Configuration for GitHub Pages from Actions

Before the workflow will work, the repository must be configured correctly. Navigate to **Settings → Pages** in the GitHub repository and set:

1. **Source**: Select "GitHub Actions" from the dropdown (not "Deploy from a branch"). This tells GitHub that the Pages site will be deployed via the `actions/deploy-pages` action rather than from a `gh-pages` branch.

2. **Custom domain** (optional): If you own a domain like `playbox.app`, enter it in the Custom domain field. GitHub will create a CNAME file. If no custom domain is used, the site will be available at `https://<owner>.github.io/<repo>/`.

3. **Enforce HTTPS**: Always enable this for security.

No `gh-pages` branch is needed. The entire deployment is managed through the `actions/upload-pages-artifact` and `actions/deploy-pages` actions, which use an internal GitHub artifact storage system.

### 2.3 Permissions Deep Dive

The three permissions required are:

| Permission | Why It's Needed |
|---|---|
| `contents: read` | Checkout the repository code |
| `pages: write` | Grant the `GITHUB_TOKEN` permission to write to the Pages service |
| `id-token: write` | Required for OIDC token generation, which `actions/deploy-pages` uses for authenticated deployment |

These permissions can be set at the workflow level (as shown above) or at the job level. Setting them at the workflow level is simpler, but for security-hardened repositories, you may want to scope `pages: write` and `id-token: write` only to the `deploy` job, keeping `contents: read` for the `build` job.

### 2.4 Concurrency Handling

The `concurrency` group is set to `"pages"` with `cancel-in-progress: false`. This means:

- If a new commit triggers a deployment while one is already in progress, the new run will wait for the current one to finish rather than canceling it. This is important because a canceled Pages deployment could leave the site in an inconsistent state.
- Multiple queued deployments will be collapsed — only the latest will actually run once the current one finishes.
- This is different from the main CI workflow's concurrency group, which uses `cancel-in-progress: true` to aggressively cancel superseded builds.

### 2.5 Vite Base Path Configuration

The Vite `base` option controls the base URL for all asset references in the built output. This is critical for GitHub Pages, which serves sites from a subdirectory (unless a custom domain is used).

**Option A: Subdirectory deployment (default GitHub Pages URL)**

If the repo is at `github.com/owner/playbox`, the site will be at `https://owner.github.io/playbox/`. Configure `vite.config.ts`:

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Use the repo name as the base path for GitHub Pages
  base: process.env.GITHUB_PAGES ? '/playbox/' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

Set the `GITHUB_PAGES` environment variable in the workflow:

```yaml
- name: Build
  run: npm run build
  env:
    GITHUB_PAGES: true
```

**Option B: Custom domain deployment**

If a custom domain like `playbox.app` is configured, the site is served from the root path. Set `base: '/'` unconditionally:

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/',
});
```

**Option C: Dynamic base path (recommended for flexibility)**

Use the repository name from the environment so the same config works across forks and renames:

```typescript
// vite.config.ts
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? `/${repoName}/` : '/',
});
```

### 2.6 SPA Routing on GitHub Pages

GitHub Pages does not support server-side URL rewriting, so client-side routing (React Router) will fail on direct URL access (e.g., `owner.github.io/playbox/game/2048`). The solution is to add a `404.html` that copies `index.html` and redirects:

```javascript
// In vite.config.ts or a post-build script:
// Copy index.html to 404.html so GitHub Pages serves the SPA for all routes
import fs from 'fs';

// After build:
fs.copyFileSync('dist/index.html', 'dist/404.html');
```

Add this as a `postbuild` script in `package.json`:

```json
{
  "scripts": {
    "build": "vite build",
    "postbuild": "node scripts/copy-404.js"
  }
}
```

---

## 3. Tauri v2 Windows Build

### 3.1 Tauri v2 Configuration — `src-tauri/tauri.conf.json`

Tauri v2 uses a JSON configuration file that defines the application identifier, window properties, build settings, and bundling options. For PlayBox, we wrap the Vite-built web application inside a Tauri window. The key configuration is:

```json
{
  "$schema": "https://raw.githubusercontent.com/tauri-apps/tauri/dev/crates/tauri-config-schema/schema.json",
  "productName": "PlayBox",
  "version": "0.1.0",
  "identifier": "com.playbox.app",
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "frontendDist": "../dist"
  },
  "app": {
    "withGlobalTauri": false,
    "windows": [
      {
        "title": "PlayBox — Game Station",
        "width": 1280,
        "height": 800,
        "minWidth": 800,
        "minHeight": 600,
        "resizable": true,
        "fullscreen": false,
        "decorations": true,
        "center": true
      }
    ],
    "security": {
      "csp": "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'"
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis", "msi"],
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/128x128@2x.png",
      "icons/icon.ico"
    ],
    "resources": [],
    "windows": {
      "certificateThumbprint": null,
      "digestAlgorithm": "sha256",
      "timestampUrl": "",
      "wix": null,
      "nsis": {
        "languages": ["English"],
        "displayLanguageSelector": false,
        "installMode": "currentUser",
        "installerIcon": null,
        "headerImage": null,
        "sidebarImage": null
      }
    }
  }
}
```

**Key points about this configuration:**

- `frontendDist: "../dist"` tells Tauri where to find the Vite-built output. During development, Tauri proxies through `devUrl` instead.
- `bundle.targets: ["nsis", "msi"]` instructs Tauri to produce both an NSIS-based `.exe` installer and a Windows Installer `.msi` package. You can also add `"app"` for a standalone executable or `"updater"` for auto-update bundles.
- `bundle.windows.nsis.installMode: "currentUser"` avoids requiring admin privileges for installation, which is important for a casual game platform that should be easy to install.
- The `security.csp` policy restricts resource loading to local files only. This is appropriate since PlayBox loads all games from the bundled frontend. If games need to load external assets, you will need to relax the CSP accordingly.

### 3.2 Rust Toolchain and Cargo Configuration

Tauri v2 requires a Rust toolchain. The `src-tauri/Cargo.toml` file manages Rust dependencies:

```toml
[package]
name = "playbox"
version = "0.1.0"
description = "PlayBox — Web-based Game Station"
authors = ["PlayBox Team"]
edition = "2021"

[lib]
name = "playbox_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[profile.release]
panic = "abort"
codegen-units = 1
lto = true
opt-level = "s"
strip = true
```

The release profile is optimized for small binary size: `lto = true` enables link-time optimization, `opt-level = "s"` optimizes for size, `strip = true` removes debug symbols, and `codegen-units = 1` enables better optimization at the cost of compile time (acceptable for CI).

### 3.3 Windows Build Workflow (Standalone Version)

If you prefer to run the Windows build as a separate workflow triggered by tags rather than on every push, here is the standalone version:

```yaml
name: Build Windows (Tauri)

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

jobs:
  build:
    name: Build Windows Installer
    runs-on: windows-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Install Rust stable
        uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: "1.82"

      - name: Cache Rust artifacts
        uses: swatinem/rust-cache@v2
        with:
          workspaces: "./src-tauri -> target"

      - name: Install frontend dependencies
        run: npm ci

      - name: Build Tauri application
        uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          # For signed builds, set these:
          # TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
          # TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
        with:
          tagName: ${{ github.ref_name }}
          releaseName: "PlayBox ${{ github.ref_name }}"
          releaseBody: "Windows installer for PlayBox."
          releaseDraft: true
          prerelease: false

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: windows-installers
          path: |
            src-tauri/target/release/bundle/nsis/*.exe
            src-tauri/target/release/bundle/msi/*.msi
```

### 3.4 Code Signing Considerations

For a production Windows application, code signing is strongly recommended. Without it, users will see SmartScreen warnings ("Windows protected your PC") when running the installer, which significantly reduces trust and conversion.

**Signing options for PlayBox:**

1. **No signing (development phase)**: During the `0.x` development phase, you can skip signing. Users who install from GitHub Releases will need to click "More info → Run anyway" on the SmartScreen warning. This is acceptable for early adopters and testers.

2. **Self-signed certificate**: You can generate a self-signed certificate for testing purposes. This won't eliminate SmartScreen warnings for end users (since the certificate isn't in the Trusted Publishers store), but it verifies that your build pipeline works correctly with signing.

3. **EV Code Signing Certificate**: For the `1.0.0` release, purchase an EV Code Signing certificate from a trusted CA (DigiCert, Sectigo, GlobalSign). EV certificates provide immediate SmartScreen reputation, eliminating the warning. They cost approximately $300-500/year and require identity verification.

4. **Standard Code Signing Certificate**: Less expensive ($100-300/year) but builds SmartScreen reputation gradually over time. Initially, users will still see warnings.

**Configuring signing in the workflow:**

```yaml
env:
  TAURI_SIGNING_PRIVATE_KEY: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY }}
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ${{ secrets.TAURI_SIGNING_PRIVATE_KEY_PASSWORD }}
```

Generate the signing key using `tauri signer generate`:

```bash
npm run tauri signer generate -w ~/.tauri/playbox.key
```

Store the private key as `TAURI_SIGNING_PRIVATE_KEY` and the password as `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` in GitHub repository secrets.

For Windows Authenticode signing (for `.exe` and `.msi` files), you would use `signtool.exe` in a separate step after the Tauri build, signing with a PFX certificate stored as a base64-encoded secret:

```yaml
- name: Sign Windows executables
  if: env.CERTIFICATE_BASE64 != ''
  shell: pwsh
  env:
    CERTIFICATE_BASE64: ${{ secrets.WINDOWS_CERTIFICATE_BASE64 }}
    CERTIFICATE_PASSWORD: ${{ secrets.WINDOWS_CERTIFICATE_PASSWORD }}
  run: |
    $certPath = Join-Path $env:TEMP "code_signing.pfx"
    [System.Convert]::FromBase64String($env:CERTIFICATE_BASE64) | Set-Content $certPath -AsByteStream
    & signtool sign /fd SHA256 /f $certPath /p $env:CERTIFICATE_PASSWORD /tr http://timestamp.digicert.com /td SHA256 src-tauri/target/release/bundle/nsis/*.exe
    & signtool sign /fd SHA256 /f $certPath /p $env:CERTIFICATE_PASSWORD /tr http://timestamp.digicert.com /td SHA256 src-tauri/target/release/bundle/msi/*.msi
```

### 3.5 How tauri-action Auto-Creates Releases

The `tauri-apps/tauri-action` has built-in release creation functionality. When you set `tagName`, it will:

1. Create a git tag with the specified name (using `__VERSION__` as a placeholder that gets replaced with the version from `tauri.conf.json`)
2. Create a GitHub Release associated with that tag
3. Upload the built artifacts (`.exe`, `.msi`, and update manifests) to the release

**Important caveat**: If the release already exists (e.g., because our `release` job created it first), `tauri-action` will update the existing release by adding its artifacts. However, this can cause race conditions if both jobs run simultaneously. In our unified workflow, we mitigate this by having `tauri-action` create a draft release, then the `release` job publishes the final version with all artifacts consolidated.

Alternatively, if you omit `tagName` from `tauri-action` configuration, it will skip release creation entirely and only produce local artifacts. This is the approach used in the unified `ci.yml` where we manage releases centrally in the `release` job.

---

## 4. Capacitor Android Build

### 4.1 Capacitor Project Setup

Capacitor wraps the PlayBox web application as a native Android app. The initial setup is performed once locally:

```bash
# Install Capacitor core and CLI
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init PlayBox com.playbox.app --web-dir dist

# Add Android platform
npm install @capacitor/android
npx cap add android
```

This creates an `android/` directory with a standard Android Gradle project and a `capacitor.config.ts` file.

### 4.2 Capacitor Configuration — `capacitor.config.ts`

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playbox.app',
  appName: 'PlayBox',
  webDir: 'dist',
  server: {
    // No custom URL — Capacitor loads from the bundled web assets
    androidScheme: 'https',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      showSpinner: true,
      spinnerColor: '#e94560',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a2e',
    },
  },
  android: {
    // Allow mixed content for local game assets
    allowMixedContent: true,
    // Capture back button to prevent accidental app exit
    backButtonEnabled: true,
  },
};

export default config;
```

**Key configuration points:**

- `webDir: 'dist'` points Capacitor to the Vite build output. When `npx cap sync` runs, it copies the contents of `dist/` into the Android project's assets directory.
- `appId: 'com.playbox.app'` must match the Android package name in `build.gradle` and `AndroidManifest.xml`.
- `androidScheme: 'https'` is recommended for compatibility with APIs that require a secure context (e.g., WebGL, some game APIs).
- The `SplashScreen` and `StatusBar` plugins provide a polished launch experience while the web view loads.

### 4.3 Android Project Structure

After running `npx cap add android`, the project structure looks like:

```
android/
├── app/
│   ├── build.gradle           # App-level build config (version, signing, dependencies)
│   ├── src/
│   │   ├── main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/com/playbox/app/
│   │   │   │   └── MainActivity.java
│   │   │   ├── res/
│   │   │   │   ├── mipmap-hdpi/   # App icons
│   │   │   │   ├── mipmap-mdpi/
│   │   │   │   ├── mipmap-xhdpi/
│   │   │   │   ├── mipmap-xxhdpi/
│   │   │   │   ├── mipmap-xxxhdpi/
│   │   │   │   └── values/
│   │   │   │       └── strings.xml
│   │   │   └── assets/
│   │   │       └── public/    # Vite build output gets copied here by cap sync
│   │   ├── debug/             # Debug signing config
│   │   └── release/           # Release signing config
│   └── release.keystore       # (Generated) Release signing keystore
├── build.gradle               # Project-level build config
├── settings.gradle
├── gradle.properties
└── gradlew                    # Gradle wrapper script
```

### 4.4 Android `build.gradle` (App-Level) — Key Sections

```groovy
android {
    namespace 'com.playbox.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.playbox.app"
        minSdk 24
        targetSdk 34
        versionCode 100
        versionName "0.1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            // Signing config injected by CI via -P flags
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}
```

**Notes:**
- `minSdk 24` (Android 7.0) covers ~97% of active Android devices while providing access to modern WebView features needed for games.
- `minifyEnabled true` in the release build enables R8/ProGuard optimization, which can reduce the APK size significantly. However, since PlayBox is primarily a WebView app, the main size savings come from the web asset compression in the Vite build.
- `versionCode` is derived from the semantic version as `MAJOR * 10000 + MINOR * 100 + PATCH`, ensuring each release has a unique, monotonically increasing code for Google Play.

### 4.5 Complete Android Build Workflow (Standalone Version)

```yaml
name: Build Android (Capacitor)

on:
  push:
    tags:
      - "v*"
  workflow_dispatch:

jobs:
  build:
    name: Build Android APK
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: "zulu"
          java-version: "17"
          cache: "gradle"

      - name: Install frontend dependencies
        run: npm ci

      - name: Build Vite app
        run: npm run build

      - name: Sync Capacitor
        run: npx cap sync android

      - name: Build debug APK (no signing secrets)
        if: env.SIGNING_KEY_BASE64 == ''
        working-directory: android
        run: ./gradlew assembleDebug

      - name: Decode keystore
        if: env.SIGNING_KEY_BASE64 != ''
        working-directory: android
        env:
          SIGNING_KEY_BASE64: ${{ secrets.ANDROID_SIGNING_KEY_BASE64 }}
        run: |
          echo "$SIGNING_KEY_BASE64" | base64 --decode > app/release.keystore

      - name: Build release APK (signed)
        if: env.SIGNING_KEY_BASE64 != ''
        working-directory: android
        env:
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          ./gradlew assembleRelease \
            -Pandroid.injected.signing.store.file=app/release.keystore \
            -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
            -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
            -Pandroid.injected.signing.key.password="$KEY_PASSWORD"

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: |
            android/app/build/outputs/apk/debug/*.apk
            android/app/build/outputs/apk/release/*.apk

      - name: Upload to release (if triggered by tag)
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v2
        with:
          files: android/app/build/outputs/apk/release/*.apk
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 4.6 Generating a Signed APK — Keystore Setup

To produce a release-signed APK, you need a Java keystore. Generate it locally:

```bash
keytool -genkeypair -v \
  -keystore playbox-release.keystore \
  -alias playbox \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storetype PKCS12
```

Then encode it as base64 for storage as a GitHub secret:

```bash
base64 -w 0 playbox-release.keystore > keystore_base64.txt
```

Add these secrets to the GitHub repository (**Settings → Secrets and variables → Actions**):

| Secret Name | Value |
|---|---|
| `ANDROID_SIGNING_KEY_BASE64` | Base64-encoded keystore file contents |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Key alias (e.g., `playbox`) |
| `ANDROID_KEY_PASSWORD` | Key password |

### 4.7 Gradle Build Optimization

To keep Android build times reasonable, add a `gradle.properties` with performance tuning:

```properties
# Enable Gradle daemon — not useful in CI (each run is isolated)
org.gradle.daemon=false

# Parallel project execution
org.gradle.parallel=true

# Configure JVM memory
org.gradle.jvmargs=-Xmx4096m -XX:+HeapDumpOnOutOfMemoryError

# Enable build caching
org.gradle.caching=true

# AndroidX
android.useAndroidX=true

# Non-transitive R classes for faster builds
android.nonTransitiveRClass=true
```

---

## 5. Versioning Strategy Implementation

### 5.1 Versioning Scheme Overview

PlayBox follows a structured versioning scheme during development and at release:

- **Development phase**: `0.minor.patch` — The leading `0` signals that the API and feature set are not yet stable. Minor version increments for new games and features, patch increments for bug fixes.
- **Release phase**: `1.0.0` — When the product is deemed release-ready, the version jumps to `1.0.0`. After that, standard semver applies: major for breaking changes, minor for new features/games, patch for bug fixes.

This is a pragmatic adaptation of semantic versioning that clearly communicates the project's maturity status.

### 5.2 Single Source of Truth: `package.json`

The canonical version number lives in `package.json`. All other version references are derived from it during the CI build:

```
package.json (SOURCE OF TRUTH)
    │
    ├──→ tauri.conf.json (written by CI before build)
    ├──→ build.gradle versionName/versionCode (written by CI before build)
    ├──→ Git tag (created by release job)
    └──→ Release name & notes (created by release job)
```

This approach avoids the complexity of keeping multiple files in sync manually. Developers only ever update `package.json` version (or the CI does it automatically), and the CI propagates the version to all downstream consumers.

### 5.3 Version Bump Script — `scripts/bump-version.sh`

For local development, provide a convenience script that bumps the version and updates all relevant files:

```bash
#!/usr/bin/env bash
# scripts/bump-version.sh
# Usage: ./scripts/bump-version.sh [major|minor|patch]
# Default: patch

set -euo pipefail

BUMP_TYPE="${1:-patch}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PKG_JSON="$PROJECT_ROOT/package.json"

# Read current version
CURRENT_VERSION=$(node -p "require('$PKG_JSON').version")
IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"

# Apply bump
case "$BUMP_TYPE" in
  major)
    MAJOR=$((MAJOR + 1))
    MINOR=0
    PATCH=0
    ;;
  minor)
    MINOR=$((MINOR + 1))
    PATCH=0
    ;;
  patch)
    PATCH=$((PATCH + 1))
    ;;
  *)
    echo "Unknown bump type: $BUMP_TYPE (use major, minor, or patch)"
    exit 1
    ;;
esac

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"

# Update package.json
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('$PKG_JSON', 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync('$PKG_JSON', JSON.stringify(pkg, null, 2) + '\n');
"

# Update tauri.conf.json
TAURI_CONF="$PROJECT_ROOT/src-tauri/tauri.conf.json"
if [ -f "$TAURI_CONF" ]; then
  node -e "
    const fs = require('fs');
    const conf = JSON.parse(fs.readFileSync('$TAURI_CONF', 'utf8'));
    conf.version = '$NEW_VERSION';
    fs.writeFileSync('$TAURI_CONF', JSON.stringify(conf, null, 2) + '\n');
  "
fi

# Update Android build.gradle
BUILD_GRADLE="$PROJECT_ROOT/android/app/build.gradle"
if [ -f "$BUILD_GRADLE" ]; then
  VERSION_CODE=$(printf "%d%02d%02d" "$MAJOR" "$MINOR" "$PATCH")
  sed -i "s/versionCode [0-9]*/versionCode ${VERSION_CODE}/" "$BUILD_GRADLE"
  sed -i "s/versionName \".*\"/versionName \"${NEW_VERSION}\"/" "$BUILD_GRADLE"
fi

echo "✅ Version bumped: ${CURRENT_VERSION} → ${NEW_VERSION} (${BUMP_TYPE})"
echo ""
echo "Updated files:"
echo "  - package.json"
[ -f "$TAURI_CONF" ] && echo "  - src-tauri/tauri.conf.json"
[ -f "$BUILD_GRADLE" ] && echo "  - android/app/build.gradle"
```

Make it executable:

```bash
chmod +x scripts/bump-version.sh
```

### 5.4 Conventional Commits for Automatic Version Detection

The CI pipeline uses **conventional commits** to determine the version bump automatically. The rules are:

| Commit Prefix | Bump Type | Example |
|---|---|---|
| `feat:` or `feat(scope):` | minor | `feat(game): add Sudoku game` |
| `fix:` or `fix(scope):` | patch | `fix: correct score calculation in 2048` |
| `feat!:` or any `!` suffix | major | `feat!: redesign game launcher API` |
| `chore:`, `docs:`, `style:`, `refactor:`, `test:` | patch (default) | `chore: update dependencies` |
| Commit body contains `BREAKING CHANGE:` | major | Any commit with this trailer |

**Why conventional commits?** They provide a machine-readable changelog, enable automatic semantic versioning, and make the commit history self-documenting. For a game platform, the key distinction is:

- Adding a new game → `feat(game): add Snake` → minor bump (because it's a new feature users care about)
- Fixing a game bug → `fix(2048): fix tile merge logic` → patch bump
- Adding a non-game feature → `feat(ui): add game categories filter` → minor bump
- Infrastructure change → `chore: update Vite to v6` → patch bump (users don't see this)

### 5.5 Auto-Version GitHub Action — `determine-version` Job (Detailed)

The `determine-version` job in `ci.yml` implements automatic versioning. Here is the expanded logic with better error handling and edge case coverage:

```yaml
  determine-version:
    name: 🔢 Determine Version
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    outputs:
      version: ${{ steps.version.outputs.version }}
      bump_type: ${{ steps.version.outputs.bump_type }}
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history needed for commit analysis

      - name: Determine version from conventional commits
        id: version
        run: |
          CURRENT_VERSION=$(node -p "require('./package.json').version")
          
          # Find the last version tag
          LAST_TAG=$(git tag -l 'v*' --sort=-version:refname | head -1 || echo "")
          
          if [ -z "$LAST_TAG" ]; then
            # No previous tag — analyze all commits
            COMMITS=$(git log --format="%s%n%b" HEAD)
          else
            # Only analyze commits since last tag
            COMMITS=$(git log --format="%s%n%b" "${LAST_TAG}..HEAD")
          fi
          
          # Default: patch bump for chore/docs/style/refactor commits
          BUMP_TYPE="patch"
          
          # Check for BREAKING CHANGE in commit body or ! suffix
          if echo "$COMMITS" | grep -qE "BREAKING CHANGE:|^[a-z]+(\(.+\))?!:"; then
            BUMP_TYPE="major"
          # Check for feat commits (new features/games)
          elif echo "$COMMITS" | grep -qE "^feat(\(.+\))?:"; then
            BUMP_TYPE="minor"
          fi
          
          # Parse and bump version
          IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
          
          case "$BUMP_TYPE" in
            major)
              MAJOR=$((MAJOR + 1))
              MINOR=0
              PATCH=0
              ;;
            minor)
              MINOR=$((MINOR + 1))
              PATCH=0
              ;;
            patch)
              PATCH=$((PATCH + 1))
              ;;
          esac
          
          NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
          
          # Output for downstream jobs
          echo "version=${NEW_VERSION}" >> "$GITHUB_OUTPUT"
          echo "bump_type=${BUMP_TYPE}" >> "$GITHUB_OUTPUT"
          
          echo "📊 Version Analysis:"
          echo "   Current: v${CURRENT_VERSION}"
          echo "   New:     v${NEW_VERSION}"
          echo "   Bump:    ${BUMP_TYPE}"
          echo "   Commits analyzed since ${LAST_TAG:-start}:"
          if [ -n "$LAST_TAG" ]; then
            git log --oneline "${LAST_TAG}..HEAD" | head -20
          else
            git log --oneline HEAD | head -20
          fi

      - name: Update package.json with new version
        run: |
          VERSION=${{ steps.version.outputs.version }}
          node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            pkg.version = '${VERSION}';
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
          "

      - name: Commit and push version bump
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add package.json
          git diff --cached --quiet || git commit -m "chore: bump version to ${{ steps.version.outputs.version }} [skip ci]"
          git push
```

### 5.6 Handling the 0.x → 1.0.0 Transition

When PlayBox is ready for its initial release, create a commit that explicitly sets the version:

```bash
# Manual override for 1.0.0 release
./scripts/bump-version.sh major  # This bumps 0.x.y → 1.0.0
git commit -am "release: PlayBox v1.0.0"
git tag v1.0.0
git push && git push --tags
```

Or, add a special commit message convention:

```
release: PlayBox v1.0.0
```

And extend the version detection script to recognize `release:` as a major bump trigger:

```bash
elif echo "$COMMITS" | grep -qE "^release:"; then
  BUMP_TYPE="major"
```

---

## 6. GitHub Release Management

### 6.1 Release Strategy

PlayBox uses GitHub Releases as the primary distribution mechanism for native installers. Each push to `main` that passes all checks produces a new release with:

1. **Windows NSIS installer** (`.exe`) — the recommended installer for most users
2. **Windows MSI installer** (`.msi`) — for enterprise/group policy deployment
3. **Android APK** (`.apk`) — for side-loading on Android devices
4. **Release notes** — auto-generated from conventional commits since the last release
5. **Link to GitHub Pages** — for the web version

### 6.2 Release Creation with `softprops/action-gh-release`

The `softprops/action-gh-release` action is used in the unified `release` job because it provides better control over release content compared to `tauri-action`'s built-in release support. Key features:

- **Idempotent**: If a release for the tag already exists, it updates it rather than failing
- **Multiple files**: Supports glob patterns for uploading multiple artifacts
- **Draft/pre-release**: Can create drafts for review before publishing
- **Body from file**: Supports reading release notes from a file

```yaml
  release:
    name: 🚀 Create Release
    runs-on: ubuntu-latest
    needs: [determine-version, build-windows, build-android]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Download all artifacts
        uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: List artifacts
        run: find artifacts -type f | sort

      - name: Generate release notes
        id: notes
        run: |
          VERSION="${{ needs.determine-version.outputs.version }}"
          LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
          
          cat > release_notes.md << 'HEADER'
          ## 🎮 PlayBox
          
          A web-based game station with 50+ casual games.
          
          HEADER
          
          if [ -n "$LAST_TAG" ]; then
            echo "### What's Changed since ${LAST_TAG}" >> release_notes.md
            echo "" >> release_notes.md
            
            # Features
            FEATURES=$(git log --format="- %s (%h)" "${LAST_TAG}..HEAD" --grep="^feat" 2>/dev/null || true)
            if [ -n "$FEATURES" ]; then
              echo "#### 🚀 New Features" >> release_notes.md
              echo "$FEATURES" >> release_notes.md
              echo "" >> release_notes.md
            fi
            
            # Bug fixes
            FIXES=$(git log --format="- %s (%h)" "${LAST_TAG}..HEAD" --grep="^fix" 2>/dev/null || true)
            if [ -n "$FIXES" ]; then
              echo "#### 🐛 Bug Fixes" >> release_notes.md
              echo "$FIXES" >> release_notes.md
              echo "" >> release_notes.md
            fi
            
            # Other changes
            OTHER=$(git log --format="- %s (%h)" "${LAST_TAG}..HEAD" --grep="^chore\|^docs\|^style\|^refactor\|^test\|^ci" 2>/dev/null || true)
            if [ -n "$OTHER" ]; then
              echo "#### 🔧 Maintenance" >> release_notes.md
              echo "$OTHER" >> release_notes.md
              echo "" >> release_notes.md
            fi
          else
            echo "🎉 Initial release!" >> release_notes.md
          fi
          
          # Download section
          cat >> release_notes.md << DOWNLOADS
          
          ### 📦 Downloads
          
          | Platform | File | Instructions |
          |----------|------|-------------|
          | 🪟 Windows | \`PlayBox_${VERSION}_x64-setup.exe\` | Download and run the NSIS installer |
          | 🪟 Windows | \`PlayBox_${VERSION}_x64_en-US.msi\` | For enterprise deployment via Group Policy |
          | 🤖 Android | \`app-release.apk\` | Enable "Install from unknown sources" and sideload |
          | 🌐 Web | [GitHub Pages](https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/) | Play directly in your browser |
          
          DOWNLOADS
          
          if [ -n "$LAST_TAG" ]; then
            echo "" >> release_notes.md
            echo "**Full Changelog**: https://github.com/${{ github.repository }}/compare/${LAST_TAG}...v${VERSION}" >> release_notes.md
          fi

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ needs.determine-version.outputs.version }}
          name: "PlayBox v${{ needs.determine-version.outputs.version }}"
          body_path: release_notes.md
          draft: false
          prerelease: ${{ startsWith(needs.determine-version.outputs.version, '0.') }}
          files: |
            artifacts/windows-artifacts/**/*
            artifacts/android-artifacts/**/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 6.3 Aggregating Artifacts from Parallel Builds

The key challenge is collecting artifacts from platform-specific build jobs (Windows runs on `windows-latest`, Android on `ubuntu-latest`) into a single release. The pattern is:

1. **Each build job** uses `actions/upload-artifact@v4` to store its outputs with a unique name (`windows-artifacts`, `android-artifacts`)
2. **The release job** uses `actions/download-artifact@v4` to pull all artifacts into a local directory
3. **`softprops/action-gh-release`** uses glob patterns (`artifacts/**/*`) to upload everything

This pattern is clean because:
- It decouples build and release timing — builds run in parallel, release runs after all complete
- It handles cross-platform artifacts naturally — each job produces artifacts on its own OS runner
- It's resilient to partial failures — if Android build fails, the release job can still run (with conditional logic)

### 6.4 Tag Naming Strategy

Tags follow the pattern `v{VERSION}`:

- `v0.1.0` — First development release
- `v0.2.0` — Second minor release (new games added)
- `v0.2.1` — Patch release (bug fix)
- `v1.0.0` — Initial stable release

Tags are created by the `release` job, not manually. This ensures every tag has a corresponding CI run and set of artifacts. The tag is always created from the commit that the CI built, guaranteeing reproducibility.

### 6.5 Pre-release vs. Draft vs. Published

- **`0.x` releases**: Marked as **pre-release** (`prerelease: true`) to signal that the product is still in development. GitHub shows a "Pre-release" badge and users must opt in to see these releases.
- **`1.x` releases**: Marked as **published** (not pre-release, not draft) — these are stable releases visible by default.
- **Draft releases**: We don't use draft mode in the automated pipeline because it requires manual publishing. However, during the initial setup phase, you may want to set `draft: true` to verify that artifacts are correct before making releases publicly visible.

---

## 7. Workflow Optimization

### 7.1 Caching Strategy

Caching is the single most impactful optimization for CI speed. The PlayBox pipeline caches three distinct dependency ecosystems:

**Node.js (npm) Cache:**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: "20"
    cache: "npm"  # Caches ~/.npm based on package-lock.json hash
```

This is built into `actions/setup-node` and caches the npm download cache. Combined with `npm ci` (which is faster than `npm install` for CI because it uses the lockfile strictly), typical install times drop from 30-60 seconds to 5-10 seconds on cache hit.

**Rust Cargo Cache:**

```yaml
- name: Cache Rust artifacts
  uses: swatinem/rust-cache@v2
  with:
    workspaces: "./src-tauri -> target"
    cache-on-failure: true
```

Rust compilation is the slowest part of the Windows build. A clean Tauri build can take 10-15 minutes, but with caching, incremental builds typically take 2-4 minutes. The `swatinem/rust-cache` action caches:

- `~/.cargo/registry/` — downloaded crate sources
- `~/.cargo/git/` — git dependencies
- `target/` — compiled artifacts

The `workspaces` parameter maps the workspace root to its target directory. The `cache-on-failure: true` option caches even when the build fails, which is useful because a failed build still compiles most dependencies.

**Gradle Cache:**

```yaml
- name: Setup Java
  uses: actions/setup-java@v4
  with:
    distribution: "zulu"
    java-version: "17"
    cache: "gradle"  # Caches ~/.gradle/caches and ~/.gradle/wrapper
```

Gradle caching is handled by `actions/setup-java`. The cache key is derived from `*.gradle`, `*.gradle.kts`, and `gradle-wrapper.properties` files. With caching, Android builds typically take 3-5 minutes instead of 8-12 minutes.

### 7.2 Parallel Job Execution

The workflow is designed for maximum parallelism:

```
determine-version ──┐
                    ├── test ──┬── build-windows ──┐
                    │          └── build-android ──┤
                    │                              ├── release
                    └── deploy-pages ──────────────┘
```

- `test`, `deploy-pages`, `build-windows`, and `build-android` all start as soon as their dependencies are satisfied
- `deploy-pages` does NOT depend on `test` (it's a separate job that runs in parallel with the platform builds) — actually, in our design it does depend on test to avoid deploying broken builds, but this can be relaxed if you want the web version to be updated faster
- The `release` job waits for both platform builds

With typical timings:

| Job | Duration (cold cache) | Duration (warm cache) |
|---|---|---|
| determine-version | ~30s | ~30s |
| test | ~2m | ~1m |
| deploy-pages | ~3m | ~1.5m |
| build-windows | ~12m | ~4m |
| build-android | ~8m | ~3m |
| release | ~1m | ~1m |
| **Total (parallel)** | **~15m** | **~6m** |

Without parallelism (sequential), total time would be ~27 minutes cold / ~11 minutes warm. Parallelism saves nearly 50%.

### 7.3 Build Matrix Considerations

Currently, the workflow does not use a build matrix because each platform has unique build steps. However, a matrix strategy could be useful for:

**Testing across Node.js versions (PR builds):**

```yaml
test:
  strategy:
    matrix:
      node-version: [18, 20, 22]
  steps:
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
```

**Building for multiple architectures (future):**

When Tauri adds ARM64 Windows support, or if you want to produce both x64 and ARM64 Android builds:

```yaml
build-windows:
  strategy:
    matrix:
      include:
        - runner: windows-latest
          target: x86_64-pc-windows-msvc
        - runner: windows-11-arm
          target: aarch64-pc-windows-msvc
```

### 7.4 Handling 50+ Games Growth

As the number of games grows, the Vite build time will increase. Strategies to keep CI fast:

**1. Vite Build Optimization:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // Enable Rollup manual chunks to split games into separate bundles
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Each game gets its own chunk for better caching
          if (id.includes('src/games/')) {
            const gameName = id.match(/src\/games\/([^/]+)/)?.[1];
            return gameName ? `game-${gameName}` : 'games';
          }
          // Vendor chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Reduce minification work
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
```

**2. Selective Rebuilds (Advanced):**

Use `git diff` to detect which games changed and only rebuild affected portions. This is complex to implement in Vite but possible with custom plugins that skip unchanged game modules.

**3. Separate Game Package Builds:**

If build times become problematic, consider building each game as a separate Vite library mode bundle, then assembling them in a final step. This enables parallel game builds and caching at the game level.

**4. Size Limits:**

Add a bundle size check to prevent individual games from bloating the overall bundle:

```yaml
- name: Check bundle size
  run: |
    TOTAL_SIZE=$(du -sb dist/ | cut -f1)
    MAX_SIZE=$((10 * 1024 * 1024))  # 10 MB
    if [ "$TOTAL_SIZE" -gt "$MAX_SIZE" ]; then
      echo "❌ Bundle size ($(( TOTAL_SIZE / 1024 / 1024 )) MB) exceeds limit (10 MB)"
      exit 1
    fi
    echo "✅ Bundle size: $(( TOTAL_SIZE / 1024 / 1024 )) MB"
```

### 7.5 Conditional Job Execution

Not every commit needs a full release build. Use path filters to skip unnecessary builds:

```yaml
jobs:
  test:
    # Always run tests for all changes
    runs-on: ubuntu-latest
    steps: ...

  deploy-pages:
    # Only deploy if web files changed
    if: |
      github.ref == 'refs/heads/main' &&
      needs.changes.outputs.web == 'true'
    needs: [test, changes]
    ...

  build-windows:
    # Only build Windows if web or Tauri config changed
    if: |
      github.ref == 'refs/heads/main' &&
      (needs.changes.outputs.web == 'true' || needs.changes.outputs.tauri == 'true')
    needs: [test, changes]
    ...

  # Detect changed paths
  changes:
    runs-on: ubuntu-latest
    outputs:
      web: ${{ steps.filter.outputs.web }}
      tauri: ${{ steps.filter.outputs.tauri }}
      android: ${{ steps.filter.outputs.android }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            web:
              - 'src/**'
              - 'public/**'
              - 'index.html'
              - 'vite.config.ts'
              - 'package.json'
              - 'package-lock.json'
            tauri:
              - 'src-tauri/**'
            android:
              - 'android/**'
              - 'capacitor.config.ts'
```

This can save significant CI minutes when changes are confined to a specific area (e.g., documentation-only changes skip all builds).

---

## 8. Branch Protection & Workflow Triggers

### 8.1 Workflow Trigger Strategy

The PlayBox CI/CD pipeline uses different trigger strategies for different scenarios:

| Event | Trigger | What Runs |
|---|---|---|
| Push to `main` | `on: push: branches: [main]` | Full pipeline: test + deploy + build + release |
| Pull request to `main` | `on: pull_request: branches: [main]` | Test only (lint, type-check, unit tests, build smoke test) |
| Tag push (`v*`) | `on: push: tags: ['v*']` | (Not used in main workflow — releases are created on push to main) |
| Manual trigger | `on: workflow_dispatch` | Full pipeline with manual approval |

**Why not trigger on tags for releases?** While triggering on tags is a common pattern, it introduces a two-step process (push to main, then create tag). For PlayBox, we want every successful push to main to automatically produce a release. The version is computed dynamically, so there's no need for a manual tagging step. This reduces human error and ensures every release corresponds to a verified commit on main.

**Why run only tests on PRs?** PR builds should be fast (under 5 minutes) to avoid blocking the review process. Full platform builds take much longer and aren't needed until the code is merged. The test job on PRs includes:

```yaml
  test-pr:
    name: 🧪 PR Check
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint --if-present
      - run: npm run test --if-present
      - run: npm run build  # Smoke test that the build succeeds
```

### 8.2 Branch Protection Rules

Configure the following branch protection rules for the `main` branch in **Settings → Branches → Branch protection rules**:

**Required checks:**
- ✅ Require a pull request before merging
  - ✅ Require approvals (1 approval minimum)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - Required status check: `🧪 PR Check` (the test job from the PR workflow)
  - ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ✅ Require signed commits (optional but recommended for security)
- ❌ Do NOT require linear history (Tauri and version bumps may create merge commits)

**Additional protections:**
- ✅ Restrict who can push to matching branches (only admins/maintainers)
- ✅ Allow force pushes: **No**
- ✅ Allow deletions: **No**

**Recommended additional rules:**
- Enable "Require deployments to succeed" with the `github-pages` environment if you want to ensure the web deployment works before merging
- Add `CODEOWNERS` file to require review from specific team members for game additions or infrastructure changes

### 8.3 Preview Deployments for PRs

For a better PR review experience, deploy preview builds of the web app to a unique URL for each PR. This uses `actions/deploy-pages` with a different concurrency group:

```yaml
name: PR Preview

on:
  pull_request:
    branches: [main]

concurrency:
  group: pr-preview-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  preview:
    name: 🌐 Deploy Preview
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci
      - run: npm run build
        env:
          VITE_APP_VERSION: "pr-${{ github.event.pull_request.number }}"

      # Use surge.sh for free preview deployments
      - name: Deploy to surge.sh
        run: |
          npx surge ./dist "playbox-pr-${{ github.event.pull_request.number }}.surge.sh" --token ${{ secrets.SURGE_TOKEN }}

      - name: Comment preview URL on PR
        uses: actions/github-script@v7
        with:
          script: |
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });
            const botComment = comments.find(c => c.user.type === 'Bot' && c.body.includes('Preview Deployment'));
            const body = `🌐 **Preview Deployment**: https://playbox-pr-${context.issue.number}.surge.sh\n\n_This preview will be updated with new commits._`;
            if (botComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body,
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body,
              });
            }
```

**Alternative: Use Vercel or Netlify for preview deployments.** Both services offer GitHub integrations that automatically deploy PR previews without any workflow configuration. For a project already using GitHub Pages for production, a Vercel/Netlify preview integration is a zero-maintenance option.

### 8.4 Environment Protection Rules

GitHub Environments can add approval gates and restrict deployments. Configure:

**`github-pages` environment:**
- No protection rules (auto-deploy on merge to main)
- Optional: Add a wait timer of 1-2 minutes to allow for quick revert if needed

**`production` environment (optional, for future use):**
- Required reviewers: 1-2 team members must approve before release is published
- This is useful when you want to build and test native artifacts but hold the release for manual approval

To use environment protection with releases:

```yaml
  release:
    name: 🚀 Create Release
    runs-on: ubuntu-latest
    needs: [determine-version, build-windows, build-android]
    environment: production  # Requires approval before running
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps: ...
```

### 8.5 Handling Merge Queue (Optional)

For teams with multiple contributors, GitHub's merge queue ensures that PRs are tested against the latest main branch before merging, preventing the "green but broken after merge" problem:

```yaml
on:
  merge_group:
    branches: [main]
```

Add this trigger and configure the branch protection rule "Require merge queue" to ensure every PR is tested after being queued for merge. The merge queue workflow should run the same tests as the PR check.

### 8.6 Notifications

Configure notifications for build failures so the team can respond quickly:

**Slack integration (example):**

```yaml
  notify:
    name: 📢 Notify on Failure
    runs-on: ubuntu-latest
    needs: [test, deploy-pages, build-windows, build-android, release]
    if: failure()
    steps:
      - name: Send Slack notification
        uses: slackapi/slack-github-action@v1.27.0
        with:
          payload: |
            {
              "text": "❌ PlayBox CI failed on main",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "❌ *PlayBox CI failed*\n*Workflow:* ${{ github.workflow }}\n*Commit:* <https://github.com/${{ github.repository }}/commit/${{ github.sha }}|${{ github.sha }}>\n*Author:* ${{ github.actor }}\n<https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }}|View Run>"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**GitHub-native notifications:** GitHub already sends email notifications for failed workflow runs to the user who triggered the run. For team-wide notifications, use the Slack integration above or configure GitHub's notification settings for the repository.

---

## 9. Appendix: Complete Unified Workflow File

Below is the complete, production-ready `ci.yml` workflow that combines all the sections above into a single file. This is the version you should start with and customize as needed.

```yaml
# .github/workflows/ci.yml
# PlayBox CI/CD Pipeline
# 
# This workflow handles:
# - Version determination from conventional commits
# - Testing, linting, and type-checking
# - GitHub Pages deployment
# - Windows build via Tauri v2
# - Android build via Capacitor
# - Unified GitHub Release creation

name: PlayBox CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  merge_group:
    branches: [main]

concurrency:
  group: playbox-ci-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}

permissions:
  contents: write
  pages: write
  id-token: write
  pull-requests: write

env:
  NODE_VERSION: "20"
  RUST_VERSION: "1.82"
  JAVA_VERSION: "17"

jobs:
  # ──────────────────────────────────────────────────────
  # Determine version from conventional commits
  # ──────────────────────────────────────────────────────
  determine-version:
    name: 🔢 Determine Version
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    outputs:
      version: ${{ steps.version.outputs.version }}
      bump_type: ${{ steps.version.outputs.bump_type }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Compute version
        id: version
        run: |
          CURRENT_VERSION=$(node -p "require('./package.json').version")
          LAST_TAG=$(git tag -l 'v*' --sort=-version:refname | head -1 || echo "")
          
          if [ -z "$LAST_TAG" ]; then
            COMMITS=$(git log --format="%s%n%b" HEAD)
          else
            COMMITS=$(git log --format="%s%n%b" "${LAST_TAG}..HEAD")
          fi
          
          BUMP_TYPE="patch"
          if echo "$COMMITS" | grep -qE "BREAKING CHANGE:|^[a-z]+(\(.+\))?!:"; then
            BUMP_TYPE="major"
          elif echo "$COMMITS" | grep -qE "^feat(\(.+\))?:"; then
            BUMP_TYPE="minor"
          fi
          
          IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT_VERSION"
          case "$BUMP_TYPE" in
            major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
            minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
            patch) PATCH=$((PATCH + 1)) ;;
          esac
          
          NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
          echo "version=${NEW_VERSION}" >> "$GITHUB_OUTPUT"
          echo "bump_type=${BUMP_TYPE}" >> "$GITHUB_OUTPUT"
          echo "📊 v${CURRENT_VERSION} → v${NEW_VERSION} (${BUMP_TYPE})"

      - name: Update package.json
        run: |
          node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            pkg.version = '${{ steps.version.outputs.version }}';
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
          "

      - name: Commit version bump
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add package.json
          git diff --cached --quiet || git commit -m "chore: bump version to ${{ steps.version.outputs.version }} [skip ci]"
          git push

  # ──────────────────────────────────────────────────────
  # Test & Lint (runs on PRs and pushes to main)
  # ──────────────────────────────────────────────────────
  test:
    name: 🧪 Test & Lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm run lint --if-present
      - run: npm run test --if-present
      - run: npm run build

  # ──────────────────────────────────────────────────────
  # Deploy to GitHub Pages (main branch only)
  # ──────────────────────────────────────────────────────
  deploy-pages:
    name: 🌐 Deploy Pages
    runs-on: ubuntu-latest
    needs: [determine-version, test]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"
      - run: npm ci

      - name: Set version
        run: |
          node -e "
            const fs = require('fs');
            const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            pkg.version = '${{ needs.determine-version.outputs.version }}';
            fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
          "

      - run: npm run build
        env:
          VITE_APP_VERSION: ${{ needs.determine-version.outputs.version }}
          GITHUB_PAGES: "true"

      - name: Copy 404.html for SPA routing
        run: cp dist/index.html dist/404.html

      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist
      - id: deployment
        uses: actions/deploy-pages@v4

  # ──────────────────────────────────────────────────────
  # Build Windows (Tauri v2)
  # ──────────────────────────────────────────────────────
  build-windows:
    name: 🪟 Build Windows
    runs-on: windows-latest
    needs: [determine-version, test]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - uses: dtolnay/rust-toolchain@stable
        with:
          toolchain: ${{ env.RUST_VERSION }}

      - uses: swatinem/rust-cache@v2
        with:
          workspaces: "./src-tauri -> target"

      - run: npm ci

      - name: Set version in tauri.conf.json
        shell: bash
        run: |
          VERSION="${{ needs.determine-version.outputs.version }}"
          node -e "
            const fs = require('fs');
            const path = require('path');
            const conf = JSON.parse(fs.readFileSync(path.join('src-tauri', 'tauri.conf.json'), 'utf8'));
            conf.version = '${VERSION}';
            fs.writeFileSync(path.join('src-tauri', 'tauri.conf.json'), JSON.stringify(conf, null, 2) + '\n');
          "

      - uses: tauri-apps/tauri-action@v0
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tagName: v__VERSION__
          releaseName: "PlayBox v__VERSION__"
          releaseDraft: true
          prerelease: false
          includeDebug: false

      - uses: actions/upload-artifact@v4
        with:
          name: windows-artifacts
          path: |
            src-tauri/target/release/bundle/nsis/*.exe
            src-tauri/target/release/bundle/msi/*.msi
          retention-days: 5

  # ──────────────────────────────────────────────────────
  # Build Android (Capacitor)
  # ──────────────────────────────────────────────────────
  build-android:
    name: 🤖 Build Android
    runs-on: ubuntu-latest
    needs: [determine-version, test]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: "npm"

      - uses: actions/setup-java@v4
        with:
          distribution: "zulu"
          java-version: ${{ env.JAVA_VERSION }}
          cache: "gradle"

      - run: npm ci
      - run: npm run build
      - run: npx cap sync android

      - name: Set version in build.gradle
        run: |
          VERSION="${{ needs.determine-version.outputs.version }}"
          VERSION_CODE=$(echo "$VERSION" | awk -F. '{printf "%d%02d%02d", $1, $2, $3}')
          sed -i "s/versionName \".*\"/versionName \"${VERSION}\"/" android/app/build.gradle
          sed -i "s/versionCode [0-9]*/versionCode ${VERSION_CODE}/" android/app/build.gradle

      - name: Build release APK
        working-directory: android
        env:
          SIGNING_KEY_BASE64: ${{ secrets.ANDROID_SIGNING_KEY_BASE64 }}
          KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
        run: |
          if [ -n "$SIGNING_KEY_BASE64" ]; then
            echo "$SIGNING_KEY_BASE64" | base64 --decode > app/release.keystore
            ./gradlew assembleRelease \
              -Pandroid.injected.signing.store.file=app/release.keystore \
              -Pandroid.injected.signing.store.password="$KEYSTORE_PASSWORD" \
              -Pandroid.injected.signing.key.alias="$KEY_ALIAS" \
              -Pandroid.injected.signing.key.password="$KEY_PASSWORD"
          else
            echo "⚠️  No signing key configured, building debug APK"
            ./gradlew assembleDebug
          fi

      - uses: actions/upload-artifact@v4
        with:
          name: android-artifacts
          path: |
            android/app/build/outputs/apk/debug/*.apk
            android/app/build/outputs/apk/release/*.apk
          retention-days: 5

  # ──────────────────────────────────────────────────────
  # Create unified release
  # ──────────────────────────────────────────────────────
  release:
    name: 🚀 Release
    runs-on: ubuntu-latest
    needs: [determine-version, build-windows, build-android]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/download-artifact@v4
        with:
          path: artifacts

      - name: Generate release notes
        run: |
          VERSION="${{ needs.determine-version.outputs.version }}"
          LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
          
          {
            echo "## 🎮 PlayBox v${VERSION}"
            echo ""
            
            if [ -n "$LAST_TAG" ]; then
              echo "### What's Changed since ${LAST_TAG}"
              echo ""
              
              FEATURES=$(git log --format="- %s (%h)" "${LAST_TAG}..HEAD" --grep="^feat" 2>/dev/null || true)
              FIXES=$(git log --format="- %s (%h)" "${LAST_TAG}..HEAD" --grep="^fix" 2>/dev/null || true)
              
              [ -n "$FEATURES" ] && { echo "#### 🚀 New Features"; echo "$FEATUREES"; echo ""; }
              [ -n "$FIXES" ] && { echo "#### 🐛 Bug Fixes"; echo "$FIXES"; echo ""; }
            else
              echo "🎉 Initial release!"
            fi
            
            echo ""
            echo "### 📦 Downloads"
            echo ""
            echo "| Platform | File | Notes |"
            echo "|----------|------|-------|"
            echo "| 🪟 Windows | PlayBox_${VERSION}_x64-setup.exe | NSIS installer |"
            echo "| 🪟 Windows | PlayBox_${VERSION}_x64_en-US.msi | MSI installer |"
            echo "| 🤖 Android | app-release.apk | Sideload APK |"
            echo "| 🌐 Web | [GitHub Pages](https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/) | Play in browser |"
            echo ""
            
            [ -n "$LAST_TAG" ] && echo "**Full Changelog**: https://github.com/${{ github.repository }}/compare/${LAST_TAG}...v${VERSION}"
          } > release_notes.md

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ needs.determine-version.outputs.version }}
          name: "PlayBox v${{ needs.determine-version.outputs.version }}"
          body_path: release_notes.md
          draft: false
          prerelease: ${{ startsWith(needs.determine-version.outputs.version, '0.') }}
          files: |
            artifacts/windows-artifacts/**/*
            artifacts/android-artifacts/**/*
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Quick-Start Checklist

To get the PlayBox CI/CD pipeline running, follow these steps in order:

### Repository Setup
- [ ] Create the GitHub repository
- [ ] Push the initial PlayBox codebase
- [ ] Go to **Settings → Pages → Source** → Select "GitHub Actions"
- [ ] Go to **Settings → Branches** → Add branch protection rules for `main`

### Workflow Files
- [ ] Create `.github/workflows/ci.yml` (copy from Section 9)
- [ ] Create `.github/workflows/deploy-pages.yml` (copy from Section 2.1)
- [ ] Create `scripts/bump-version.sh` (copy from Section 5.3) and `chmod +x`

### Secrets Configuration
- [ ] `ANDROID_SIGNING_KEY_BASE64` — Base64-encoded Android keystore (or skip for debug APKs)
- [ ] `ANDROID_KEYSTORE_PASSWORD` — Keystore password
- [ ] `ANDROID_KEY_ALIAS` — Key alias (e.g., `playbox`)
- [ ] `ANDROID_KEY_PASSWORD` — Key password
- [ ] (Optional) `TAURI_SIGNING_PRIVATE_KEY` — Tauri update signing key
- [ ] (Optional) `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — Signing key password
- [ ] (Optional) `WINDOWS_CERTIFICATE_BASE64` — Windows code signing PFX
- [ ] (Optional) `WINDOWS_CERTIFICATE_PASSWORD` — PFX password
- [ ] (Optional) `SURGE_TOKEN` — For PR preview deployments
- [ ] (Optional) `SLACK_WEBHOOK_URL` — For failure notifications

### Project Configuration
- [ ] Initialize `package.json` with `"version": "0.1.0"`
- [ ] Configure `vite.config.ts` with GitHub Pages base path (Section 2.5)
- [ ] Add `404.html` copy script for SPA routing (Section 2.6)
- [ ] Set up Tauri v2: `src-tauri/tauri.conf.json` (Section 3.1)
- [ ] Set up Capacitor: `capacitor.config.ts` (Section 4.2)
- [ ] Configure `android/app/build.gradle` (Section 4.4)
- [ ] Add `gradle.properties` with performance tuning (Section 4.7)
- [ ] Add `CODEOWNERS` file if multiple contributors

### Verification
- [ ] Push to `main` and verify the full pipeline runs
- [ ] Check that GitHub Pages deployment succeeds
- [ ] Check that Windows artifacts appear in the draft release
- [ ] Check that Android APK is built and uploaded
- [ ] Create a PR and verify the test-only job runs
- [ ] Review the release notes format on the first release

---

*End of Report — PlayBox CI/CD & Cross-Platform Build Specialist*
