# Reveal.js Presentation

This folder contains a Reveal.js-based slide deck rendered from markdown.
Reveal.js runtime assets are vendored in-repo for offline use.

## What Is In This Folder

- `present.md`: slide content (including horizontal and basement/vertical slides).
- `index.html`: Reveal.js bootstrap, markdown loading, and custom slide behavior.
- `custom.css`: presentation theme and layout styling.
- `vendor/reveal.js/`: local Reveal.js CSS/JS/plugin assets used by `index.html`.

## Run In Dev

From this `reveal/` directory:

```bash
bunx --bun serve .
```

Then open the local URL printed by `serve` in your browser.

## Refresh Vendored Reveal Assets

```bash
mkdir -p vendor/reveal.js/dist/theme vendor/reveal.js/plugin/markdown vendor/reveal.js/plugin/highlight
wget -q -O vendor/reveal.js/dist/reveal.css https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css
wget -q -O vendor/reveal.js/dist/theme/black.css https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/black.css
wget -q -O vendor/reveal.js/dist/reveal.js https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js
wget -q -O vendor/reveal.js/plugin/markdown/markdown.js https://cdn.jsdelivr.net/npm/reveal.js@5/plugin/markdown/markdown.js
wget -q -O vendor/reveal.js/plugin/highlight/highlight.js https://cdn.jsdelivr.net/npm/reveal.js@5/plugin/highlight/highlight.js
```
