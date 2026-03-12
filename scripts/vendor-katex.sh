#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
KATEX_VERSION="${KATEX_VERSION:-0.16.37}"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}

trap cleanup EXIT

mkdir -p "$TMP_DIR"

pushd "$TMP_DIR" >/dev/null
TARBALL="$(npm pack --silent "katex@${KATEX_VERSION}")"
tar -xzf "$TARBALL"
popd >/dev/null

SRC_DIR="$TMP_DIR/package"
DEST_DIR="$ROOT_DIR/vendor/katex"

rm -rf "$DEST_DIR"
mkdir -p "$DEST_DIR/dist/contrib" "$DEST_DIR/dist/fonts"

cp "$SRC_DIR/LICENSE" "$DEST_DIR/LICENSE"
cp "$SRC_DIR/dist/katex.min.js" "$DEST_DIR/dist/katex.min.js"
cp "$SRC_DIR/dist/katex.min.css" "$DEST_DIR/dist/katex.min.css"
cp "$SRC_DIR/dist/contrib/auto-render.min.js" "$DEST_DIR/dist/contrib/auto-render.min.js"
cp "$SRC_DIR/dist/fonts/"*.woff2 "$DEST_DIR/dist/fonts/"
cp "$SRC_DIR/dist/fonts/"*.woff "$DEST_DIR/dist/fonts/"

printf 'Vendored KaTeX %s into %s\n' "$KATEX_VERSION" "$DEST_DIR"
