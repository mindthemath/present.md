# Reveal.js Presentation

This folder contains a Reveal.js-based slide deck rendered from markdown.
Reveal.js runtime assets are vendored in-repo for offline use.

## What Is In This Folder

- `present.md`: slide content (including horizontal and basement/vertical slides).
- `index.html`: Reveal.js bootstrap, markdown loading, and custom slide behavior.
- `custom.css`: presentation theme and layout styling.
- `vendor/reveal.js/`: local Reveal.js CSS/JS/plugin assets used by `index.html`.
- `vendor/katex/`: slim local KaTeX runtime used for offline math rendering.
- `scripts/vendor-katex.sh`: idempotent vendoring script for the KaTeX runtime subset.
- `scripts/capture-screenshots.sh`: local multi-resolution screenshot capture for visual validation.

## Run In Dev

From this directory:

```bash
bunx --bun serve . -p 1313
```

Then open the local URL printed by `serve` in your browser.

## Capture Screenshots Locally

To validate typography/layout changes across the same resolution set used in CI:

```bash
SCREENSHOT_ZOOM_LEVEL=1 ./scripts/capture-screenshots.sh
```

This writes slide image folders plus `_screenshot_folders.json` into `.screenshots/` by default.
Override `SCREENSHOT_OUT_DIR` to capture elsewhere, and `SCREENSHOT_PORT` if `1313` is already in use.

## Authoring Math

Display math can be written using fenced `math` blocks in `present.md`:

````md
```math
\int_0^\infty e^{-x^2} \, dx = \frac{\sqrt{\pi}}{2}
```
````

`index.html` rewrites these fences to KaTeX display-math delimiters before Reveal parses the deck, so slide authoring stays markdown-native while rendering still uses Reveal's math plugin.

Inline math also works with standard KaTeX delimiters such as `$x^2$`, `\(...\)`, and `\[...\]`.

## Refresh Vendored Assets

```bash
mkdir -p vendor/reveal.js/dist/theme vendor/reveal.js/plugin/markdown vendor/reveal.js/plugin/highlight vendor/reveal.js/plugin/math
curl -fsSL https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.css -o vendor/reveal.js/dist/reveal.css
curl -fsSL https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/theme/black.css -o vendor/reveal.js/dist/theme/black.css
curl -fsSL https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/dist/reveal.js -o vendor/reveal.js/dist/reveal.js
curl -fsSL https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/markdown/markdown.js -o vendor/reveal.js/plugin/markdown/markdown.js
curl -fsSL https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/highlight/highlight.js -o vendor/reveal.js/plugin/highlight/highlight.js
curl -fsSL https://cdn.jsdelivr.net/npm/reveal.js@5.2.1/plugin/math/math.js -o vendor/reveal.js/plugin/math/math.js
./scripts/vendor-katex.sh
```

The KaTeX script vendors only the runtime files Reveal needs:

- `dist/katex.min.js`
- `dist/katex.min.css`
- `dist/contrib/auto-render.min.js`
- `dist/fonts/*.woff2`
- `dist/fonts/*.woff`
- `LICENSE`

Set `KATEX_VERSION` to override the pinned default when refreshing, for example:

```bash
KATEX_VERSION=0.16.37 ./scripts/vendor-katex.sh
```

## Footer Text

Edit the `counter.textContent = \`${current} / ${total} | present.md\`;` line in `index.html` to change the footer text from `present.md` to something else.
