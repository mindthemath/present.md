#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${SCREENSHOT_PORT:-1313}"
ZOOM_LEVEL="${SCREENSHOT_ZOOM_LEVEL:-1}"
HOST="${SCREENSHOT_HOST:-127.0.0.1}"
OUT_DIR="${SCREENSHOT_OUT_DIR:-$ROOT_DIR/.screenshots}"
WAIT_TIMEOUT_SECS="${SCREENSHOT_SERVER_WAIT_SECS:-30}"
SERVER_LOG="$(mktemp)"
CAPTURE_JS="$(mktemp "$ROOT_DIR/.capture-screenshots.XXXXXX.cjs")"
CAPTURE_PID=""
SERVER_PID=""
IN_CLEANUP=0

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    printf 'Missing required command: %s\n' "$1" >&2
    exit 1
  fi
}

cleanup() {
  if [[ "$IN_CLEANUP" -eq 1 ]]; then
    return
  fi
  IN_CLEANUP=1

  if [[ -n "${CAPTURE_PID:-}" ]]; then
    kill "$CAPTURE_PID" 2>/dev/null || true
    wait "$CAPTURE_PID" 2>/dev/null || true
  fi
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -f "$SERVER_LOG"
  rm -f "$CAPTURE_JS"
}

trap 'cleanup' EXIT INT TERM

require_command curl
require_command bun
require_command bunx
require_command node

mkdir -p "$OUT_DIR"

printf 'Ensuring Playwright package is installed...\n'
bun add -d playwright >/dev/null

printf 'Ensuring Playwright Chromium is installed...\n'
bunx playwright install chromium >/dev/null

printf 'Starting local server on http://%s:%s ...\n' "$HOST" "$PORT"
bunx --bun serve "$ROOT_DIR" -p "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!

printf 'Waiting for server to be ready...\n'
for ((i = 0; i < WAIT_TIMEOUT_SECS; i += 1)); do
  if curl -fsS "http://${HOST}:${PORT}/" >/dev/null 2>&1; then
    printf 'Server is ready.\n'
    break
  fi
  sleep 1
done

if ! curl -fsS "http://${HOST}:${PORT}/" >/dev/null 2>&1; then
  printf 'Server did not become ready within %ss.\n' "$WAIT_TIMEOUT_SECS" >&2
  printf 'Server log:\n' >&2
  sed 's/^/  /' "$SERVER_LOG" >&2
  exit 1
fi

cat >"$CAPTURE_JS" <<'EOF'
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const rootDir = process.env.ROOT_DIR;
const outDir = process.env.SCREENSHOT_OUT_DIR || rootDir;
const host = process.env.SCREENSHOT_HOST || '127.0.0.1';
const port = Number(process.env.SCREENSHOT_PORT || '1313');
const zoomLevel = Number(process.env.SCREENSHOT_ZOOM_LEVEL || '1');

if (!Number.isFinite(port) || port <= 0) {
  throw new Error(`Invalid SCREENSHOT_PORT: ${process.env.SCREENSHOT_PORT}`);
}

if (!Number.isFinite(zoomLevel) || zoomLevel <= 0) {
  throw new Error(`Invalid SCREENSHOT_ZOOM_LEVEL: ${process.env.SCREENSHOT_ZOOM_LEVEL}`);
}

// URLs to capture: [url, folderName] or [url, folderName, waitTimeMs]
// Optional waitTimeMs: wait after load before screenshot (for animated slides)
// Main slides 1-17, plus basement slides at 8 and 16
const urls = [
  ['/', 'slide-01'],
  ['/#/2', 'slide-02'],
  ['/#/3', 'slide-03'],
  ['/#/4', 'slide-04'],
  // ['/#/5', 'slide-05'],
  // ['/#/6', 'slide-06'],
  // ['/#/7', 'slide-07'],
  ['/#/8', 'slide-08-01'],
  ['/#/8/2', 'slide-08-02'],
  ['/#/9', 'slide-09'],
  ['/#/10', 'slide-10'],
  ['/#/11', 'slide-11'],
  ['/#/12', 'slide-12'],
  // ['/#/13', 'slide-13'],
  // ['/#/14', 'slide-14'],
  ['/#/15', 'slide-15'],
  ['/#/16', 'slide-16-01'],
  ['/#/16/2', 'slide-16-02'],
  ['/#/16/3', 'slide-16-03'],
  // ['/#/17', 'slide-17'],
];

const resolutions = [
  [375, 667, 'iphone-se'],
  [390, 844, 'iphone-12-13'],
  [430, 932, 'iphone-14-15-16-17-pro-max'],
  [667, 375, 'iphone-se-landscape'],
  [844, 390, 'iphone-12-13-landscape'],
  [932, 430, 'iphone-14-15-16-17-pro-max-landscape'],
  [768, 1024, 'ipad-portrait'],
  [1024, 768, 'ipad-landscape'],
  [1280, 720, 'desktop-1280x720'],
  [1366, 768, 'desktop-1366x768'],
  [1440, 900, 'desktop-1440x900'],
  [1920, 1080, 'desktop-1920x1080'],
  [2560, 1440, 'desktop-2560x1440'],
];

function getFolderTitle(folderName) {
  return folderName
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function generateReadme(folder, screenshots) {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0] + 'Z';
  const readmePath = path.join(folder, 'README.md');

  let content = `# ${getFolderTitle(path.basename(folder))}\n\n`;
  content += `Generated: ${new Date().toISOString()}\n\n`;
  content += `| Resolution | Device | Screenshot |\n`;
  content += `|------------|--------|------------|\n`;

  for (const { filename, width, height, label } of screenshots) {
    content += `| ${width} × ${height} | ${label} | ![${label}](${filename}?${timestamp}) |\n`;
  }

  fs.writeFileSync(readmePath, content);
}

async function takeScreenshots(url, folder) {
  const fullUrl = `http://${host}:${port}${url}`;
  const browser = await chromium.launch();
  const screenshots = [];

  try {
    for (const [width, height, label] of resolutions) {
      console.log(`Taking ${width}x${height} (${label}) for ${url} at ${zoomLevel}x zoom`);
      console.log(`  -> open page for ${width}x${height}`);
      const page = await browser.newPage();
      console.log(`  <- open page for ${width}x${height}`);
      try {
        console.log(`  -> set viewport ${width}x${height}`);
        await page.setViewportSize({ width, height });
        console.log(`  <- set viewport ${width}x${height}`);

        console.log(`  -> goto ${url} at ${width}x${height}`);
        await page.goto(fullUrl, { waitUntil: 'networkidle' });
        console.log(`  <- goto ${url} at ${width}x${height}`);

        console.log(`  -> settle before zoom ${width}x${height}`);
        await page.waitForTimeout(500);
        console.log(`  <- settle before zoom ${width}x${height}`);

        console.log(`  -> apply zoom ${width}x${height}`);
        await page.evaluate((zoom) => {
          document.documentElement.style.zoom = String(zoom);
        }, zoomLevel);
        console.log(`  <- apply zoom ${width}x${height}`);

        console.log(`  -> settle after zoom ${width}x${height}`);
        await page.waitForTimeout(100);
        console.log(`  <- settle after zoom ${width}x${height}`);

        const filename = `${width}x${height}-${label}.png`;
        const filepath = path.join(folder, filename);
        console.log(`  -> save screenshot ${filename}`);
        await page.screenshot({ path: filepath, fullPage: false });
        console.log(`  <- save screenshot ${filename}`);

        screenshots.push({ filename, width, height, label });
      } finally {
        console.log(`  -> close page ${width}x${height}`);
        await page.close();
        console.log(`  <- close page ${width}x${height}`);
      }
    }
  } finally {
    console.log(`  -> close browser for ${url}`);
    await browser.close();
    console.log(`  <- close browser for ${url}`);
  }

  return screenshots;
}

(async () => {
  const allFolders = [];
  console.log(`Using screenshot zoom level: ${zoomLevel}x`);

  for (const [url, folderName] of urls) {
    const folder = path.join(outDir, folderName);
    fs.mkdirSync(folder, { recursive: true });
    allFolders.push(folderName);

    console.log(`=== Capturing ${folderName} for ${url} ===`);
    const screenshots = await takeScreenshots(url, folder);
    await generateReadme(folder, screenshots);
    console.log(`Captured ${screenshots.length} screenshots for ${folderName}`);
  }

  fs.writeFileSync(path.join(outDir, '_screenshot_folders.json'), JSON.stringify(allFolders));
  console.log('All screenshots saved successfully');
})().catch((error) => {
  console.error('Error taking screenshots:', error);
  process.exit(1);
});
EOF

ROOT_DIR="$ROOT_DIR" \
SCREENSHOT_OUT_DIR="$OUT_DIR" \
SCREENSHOT_PORT="$PORT" \
SCREENSHOT_HOST="$HOST" \
SCREENSHOT_ZOOM_LEVEL="$ZOOM_LEVEL" \
node "$CAPTURE_JS" &
CAPTURE_PID=$!
wait "$CAPTURE_PID"
CAPTURE_PID=""

printf 'Screenshots complete. Output written under %s\n' "$OUT_DIR"
