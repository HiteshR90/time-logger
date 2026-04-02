#!/bin/bash
set -e
AGENT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
NATIVE_DIR="$AGENT_DIR/native_modules/active-win"
rm -rf "$AGENT_DIR/native_modules"
mkdir -p "$NATIVE_DIR"
ACTIVE_WIN_REAL=$(readlink -f "$AGENT_DIR/node_modules/active-win" 2>/dev/null || readlink "$AGENT_DIR/node_modules/active-win")
echo "Copying active-win binary from: $ACTIVE_WIN_REAL"
cp "$ACTIVE_WIN_REAL/main" "$NATIVE_DIR/main"
chmod +x "$NATIVE_DIR/main"
echo "Done: $(file "$NATIVE_DIR/main")"
