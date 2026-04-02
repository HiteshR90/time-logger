#!/bin/bash
set -e
AGENT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_DIR="$(cd "$AGENT_DIR/../.." && pwd)"
NATIVE_DIR="$AGENT_DIR/native_modules"
rm -rf "$NATIVE_DIR"

resolve() {
  local mod="$1"
  local p=$(readlink -f "$AGENT_DIR/node_modules/$mod" 2>/dev/null || readlink "$AGENT_DIR/node_modules/$mod" 2>/dev/null)
  [ -z "$p" ] && p=$(find "$ROOT_DIR/node_modules/.pnpm" -path "*/$mod/package.json" -not -path "*/node_modules/.pnpm/*/node_modules/*" 2>/dev/null | head -1 | xargs dirname 2>/dev/null)
  echo "$p"
}

# 1. active-win binary
mkdir -p "$NATIVE_DIR/active-win"
AW=$(resolve "active-win")
cp "$AW/main" "$NATIVE_DIR/active-win/main" && chmod +x "$NATIVE_DIR/active-win/main"
echo "[OK] active-win"

# 2. better-sqlite3
SQLITE=$(resolve "better-sqlite3")
cp -R "$SQLITE" "$NATIVE_DIR/better-sqlite3"
rm -rf "$NATIVE_DIR/better-sqlite3/node_modules" "$NATIVE_DIR/better-sqlite3/deps" "$NATIVE_DIR/better-sqlite3/src" 2>/dev/null
echo "[OK] better-sqlite3"

# 3. bindings (dependency of better-sqlite3)
BIND=$(resolve "bindings")
[ -n "$BIND" ] && cp -R "$BIND" "$NATIVE_DIR/bindings" && echo "[OK] bindings" || echo "[SKIP] bindings not found"

# 4. file-uri-to-path (dependency of bindings)
FURI=$(resolve "file-uri-to-path")
[ -n "$FURI" ] && cp -R "$FURI" "$NATIVE_DIR/file-uri-to-path" && echo "[OK] file-uri-to-path" || echo "[SKIP] file-uri-to-path not found"

echo "Done:"
find "$NATIVE_DIR" \( -name "*.node" -o -name "main" \) -not -path "*/node_modules/*" | sort
