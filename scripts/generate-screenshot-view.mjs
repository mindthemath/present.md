import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const screenshotsDir = path.resolve(process.env.SCREENSHOT_OUT_DIR || path.join(rootDir, '.screenshots'));
const outputPath = path.join(screenshotsDir, 'view.html');
const screenshotFoldersPath = path.join(screenshotsDir, '_screenshot_folders.json');

const preferredResolutionOrder = [
  '375x667-iphone-se',
  '390x844-iphone-12-13',
  '430x932-iphone-14-15-16-17-pro-max',
  '667x375-iphone-se-landscape',
  '844x390-iphone-12-13-landscape',
  '932x430-iphone-14-15-16-17-pro-max-landscape',
  '768x1024-ipad-portrait',
  '1024x768-ipad-landscape',
  '1280x720-desktop-1280x720',
  '1366x768-desktop-1366x768',
  '1440x900-desktop-1440x900',
  '1920x1080-desktop-1920x1080',
  '2560x1440-desktop-2560x1440',
];

function formatSlideTitle(slideName) {
  return slideName
    .split('-')
    .map((part) => part.toUpperCase())
    .join(' ');
}

function readSlideNames() {
  if (fs.existsSync(screenshotFoldersPath)) {
    const folders = JSON.parse(fs.readFileSync(screenshotFoldersPath, 'utf8'));
    return folders.filter((folder) => fs.existsSync(path.join(screenshotsDir, folder)));
  }

  return fs
    .readdirSync(screenshotsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^slide-\d+(?:-\d+)?$/.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

function readResolutionRank(key) {
  const preferredIndex = preferredResolutionOrder.indexOf(key);
  return preferredIndex === -1 ? Number.MAX_SAFE_INTEGER : preferredIndex;
}

function readResolutionLabel(filenameMatch) {
  const [, width, height, label] = filenameMatch;
  return label;
}

function collectScreenshots() {
  const slideNames = readSlideNames();
  const slideTitles = new Map(slideNames.map((slide) => [slide, formatSlideTitle(slide)]));
  const resolutionMap = new Map();
  const screenshots = [];

  for (const slide of slideNames) {
    const slideDir = path.join(screenshotsDir, slide);
    if (!fs.existsSync(slideDir)) {
      continue;
    }

    const pngFiles = fs
      .readdirSync(slideDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
      .map((entry) => entry.name)
      .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

    for (const filename of pngFiles) {
      const match = filename.match(/^(\d+)x(\d+)-(.+)\.png$/);
      if (!match) {
        continue;
      }

      const [, width, height, label] = match;
      const key = `${width}x${height}-${label}`;

      if (!resolutionMap.has(key)) {
        resolutionMap.set(key, {
          key,
          width: Number(width),
          height: Number(height),
          label,
          title: readResolutionLabel(match),
        });
      }

      screenshots.push({
        id: `${slide}:${key}`,
        slide,
        slideTitle: slideTitles.get(slide) || slide,
        resolutionKey: key,
        resolutionTitle: readResolutionLabel(match),
        width: Number(width),
        height: Number(height),
        label,
        relativePath: `./${slide}/${filename}`,
      });
    }
  }

  const resolutions = Array.from(resolutionMap.values()).sort((left, right) => {
    const preferredDelta = readResolutionRank(left.key) - readResolutionRank(right.key);
    if (preferredDelta !== 0) {
      return preferredDelta;
    }

    if (left.width !== right.width) {
      return left.width - right.width;
    }

    if (left.height !== right.height) {
      return left.height - right.height;
    }

    return left.label.localeCompare(right.label);
  });

  return {
    generatedAt: new Date().toISOString(),
    slideCount: slideNames.length,
    screenshotCount: screenshots.length,
    slides: slideNames.map((slide) => ({
      key: slide,
      title: slideTitles.get(slide) || slide,
    })),
    resolutions,
    screenshots,
  };
}

function buildHtml(data) {
  const embeddedData = JSON.stringify(data);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Screenshot Viewer</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #0f1117;
      --panel: #171b25;
      --panel-2: #1f2532;
      --border: #2c3547;
      --text: #ecf2ff;
      --muted: #9baccc;
      --accent: #88b4ff;
      --missing: #74809a;
      --shadow: rgba(0, 0, 0, 0.25);
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: var(--bg);
      color: var(--text);
    }

    .page {
      padding: 24px;
      display: grid;
      gap: 16px;
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: rgba(15, 17, 23, 0.92);
      backdrop-filter: blur(14px);
      box-shadow: 0 16px 40px var(--shadow);
    }

    .title {
      display: grid;
      gap: 4px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      line-height: 1.2;
    }

    .subtitle,
    .stats {
      color: var(--muted);
      font-size: 14px;
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    button {
      appearance: none;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--panel);
      color: var(--text);
      padding: 10px 14px;
      cursor: pointer;
      font: inherit;
    }

    button.active {
      border-color: var(--accent);
      background: var(--panel-2);
      color: #ffffff;
    }

    .table-wrap {
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--panel);
      box-shadow: 0 16px 40px var(--shadow);
    }

    table {
      width: max-content;
      min-width: 100%;
      border-collapse: separate;
      border-spacing: 0;
    }

    thead th {
      position: sticky;
      top: 0;
      z-index: 3;
      background: rgba(23, 27, 37, 0.97);
    }

    tbody th {
      position: sticky;
      left: 0;
      z-index: 2;
      background: rgba(23, 27, 37, 0.97);
    }

    th,
    td {
      border-right: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      padding: 12px;
      vertical-align: top;
    }

    thead th:first-child {
      left: 0;
      z-index: 4;
    }

    tr:first-child th,
    tr:first-child td {
      border-top: 0;
    }

    th:first-child,
    td:first-child {
      border-left: 0;
    }

    .axis {
      min-width: 200px;
      max-width: 200px;
      text-align: left;
      white-space: normal;
      overflow-wrap: anywhere;
    }

    .axis small,
    .header small {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-weight: 400;
    }

    .header {
      min-width: 240px;
      text-align: left;
    }

    .cell {
      display: grid;
      gap: 8px;
      width: 240px;
    }

    .thumb-link {
      display: block;
      width: fit-content;
      max-width: 100%;
      text-decoration: none;
    }

    img {
      display: block;
      max-width: 100%;
      height: auto;
      border-radius: 10px;
      border: 1px solid var(--border);
      background:
        linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%, rgba(255,255,255,0.04)),
        linear-gradient(45deg, rgba(255,255,255,0.04) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.04) 75%, rgba(255,255,255,0.04));
      background-position: 0 0, 10px 10px;
      background-size: 20px 20px;
    }

    .meta {
      display: grid;
      gap: 2px;
      font-size: 13px;
    }

    .meta .muted,
    .missing {
      color: var(--muted);
    }

    .missing {
      width: 240px;
      min-height: 180px;
      display: grid;
      place-items: center;
      border: 1px dashed var(--border);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.02);
    }

    @media (max-width: 720px) {
      .page {
        padding: 12px;
      }

      .toolbar {
        padding: 12px;
      }

      .axis {
        min-width: 160px;
      }

      .header,
      .cell,
      .missing {
        width: 180px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <section class="toolbar">
      <div class="title">
        <h1>Local Screenshot Viewer</h1>
        <div class="subtitle">Open this file directly in a browser or serve the repo locally.</div>
        <div class="stats" id="stats"></div>
      </div>
      <div class="controls" aria-label="Group screenshots">
        <button type="button" data-group="slide">Group by slide</button>
        <button type="button" data-group="resolution">Group by resolution</button>
      </div>
    </section>

    <section class="table-wrap">
      <table>
        <thead id="table-head"></thead>
        <tbody id="table-body"></tbody>
      </table>
    </section>
  </div>

  <script>
    const data = ${embeddedData};
    const state = { groupBy: 'slide' };
    const cacheBustSeed = Date.now();
    const head = document.getElementById('table-head');
    const body = document.getElementById('table-body');
    const stats = document.getElementById('stats');
    const buttons = Array.from(document.querySelectorAll('[data-group]'));
    const screenshotMap = new Map(data.screenshots.map((item) => [item.id, item]));

    function cacheBustedPath(relativePath, index) {
      return relativePath + '?ts=' + cacheBustSeed + '-' + index;
    }

    function getColumns() {
      return state.groupBy === 'slide' ? data.resolutions : data.slides;
    }

    function getRows() {
      return state.groupBy === 'slide' ? data.slides : data.resolutions;
    }

    function getRowTitle(row) {
      return row.title;
    }

    function getColumnTitle(column) {
      return column.title;
    }

    function lookupItem(row, column) {
      if (state.groupBy === 'slide') {
        return screenshotMap.get(row.key + ':' + column.key);
      }

      return screenshotMap.get(column.key + ':' + row.key);
    }

    function renderHeader(columns) {
      const axisLabel = state.groupBy === 'slide' ? 'Slide' : 'Resolution';
      const columnLabel = state.groupBy === 'slide' ? 'Resolutions' : 'Slides';
      const headerCells = columns.map((column) => {
        const detail = state.groupBy === 'slide'
          ? column.width + ' x ' + column.height
          : column.width + ' x ' + column.height;
        return '<th class="header">' + getColumnTitle(column) + '<small>' + detail + '</small></th>';
      }).join('');

      head.innerHTML = '<tr><th class="axis">' + axisLabel + '<small>' + columnLabel + '</small></th>' + headerCells + '</tr>';
    }

    function renderRows(rows, columns) {
      let imageIndex = 0;

      body.innerHTML = rows.map((row) => {
        const detail = state.groupBy === 'slide'
          ? row.key
          : row.width + ' x ' + row.height;

        const cells = columns.map((column) => {
          const item = lookupItem(row, column);
          if (!item) {
            return '<td><div class="missing">No screenshot</div></td>';
          }

          imageIndex += 1;
          const bustedPath = cacheBustedPath(item.relativePath, imageIndex);
          return [
            '<td>',
            '  <div class="cell">',
            '    <a class="thumb-link" href="' + bustedPath + '" target="_blank" rel="noreferrer">',
            '      <img loading="lazy" src="' + bustedPath + '" alt="' + item.slideTitle + ' at ' + item.resolutionTitle + '">',
            '    </a>',
            '    <div class="meta">',
            '      <strong>' + item.slideTitle + '</strong>',
            '      <span class="muted">' + item.width + ' x ' + item.height + ' · ' + item.label + '</span>',
            '    </div>',
            '  </div>',
            '</td>',
          ].join('');
        }).join('');

        return '<tr><th class="axis">' + getRowTitle(row) + '<small>' + detail + '</small></th>' + cells + '</tr>';
      }).join('');
    }

    function renderStats() {
      stats.textContent = data.slideCount + ' slides, ' + data.resolutions.length + ' resolutions, ' + data.screenshotCount + ' screenshots. Generated ' + data.generatedAt + '.';
    }

    function render() {
      const columns = getColumns();
      const rows = getRows();

      buttons.forEach((button) => {
        button.classList.toggle('active', button.dataset.group === state.groupBy);
      });

      renderHeader(columns);
      renderRows(rows, columns);
      renderStats();
    }

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        state.groupBy = button.dataset.group;
        render();
      });
    });

    render();
  </script>
</body>
</html>
`;
}

function main() {
  if (!fs.existsSync(screenshotsDir)) {
    throw new Error(`Screenshot directory does not exist: ${screenshotsDir}`);
  }

  const data = collectScreenshots();
  fs.writeFileSync(outputPath, buildHtml(data));
  console.log(`Wrote screenshot viewer to ${outputPath}`);
}

main();
