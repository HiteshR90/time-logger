#!/bin/bash
set -e
AGENT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NATIVE_DIR="$AGENT_DIR/native_modules"
rm -rf "$NATIVE_DIR"
mkdir -p "$NATIVE_DIR"
ACTIVE_WIN_REAL=$(readlink -f "$AGENT_DIR/node_modules/active-win" 2>/dev/null || readlink "$AGENT_DIR/node_modules/active-win")
echo "Copying active-win from: $ACTIVE_WIN_REAL"
cp -R "$ACTIVE_WIN_REAL" "$NATIVE_DIR/active-win"
rm -rf "$NATIVE_DIR/active-win/build-tmp-napi-v9" "$NATIVE_DIR/active-win/node_modules" 2>/dev/null
echo "Done:" && find "$NATIVE_DIR" -name "*.node" | head -5
