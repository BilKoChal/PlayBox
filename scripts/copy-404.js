/**
 * Copy 404.html for SPA routing on GitHub Pages
 *
 * GitHub Pages serves 404.html for unmatched routes.
 * By copying index.html to 404.html, the SPA router handles
 * deep links like /game/snake correctly.
 *
 * This runs as a postbuild script: pnpm postbuild
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.resolve(__dirname, '../dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');
const FORTY_FOUR_HTML = path.join(DIST_DIR, '404.html');

function main() {
  if (!fs.existsSync(INDEX_HTML)) {
    console.warn(
      '⚠️  dist/index.html not found. Skipping 404.html generation.',
    );
    console.warn('   Run "pnpm build" first.');
    return;
  }

  fs.copyFileSync(INDEX_HTML, FORTY_FOUR_HTML);
  console.log('✅ Generated dist/404.html for GitHub Pages SPA routing');
}

main();
