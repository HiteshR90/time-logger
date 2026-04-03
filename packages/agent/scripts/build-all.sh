#!/bin/bash
set -e

AGENT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$AGENT_DIR"

echo "=== TimeTracker — Building Desktop Apps ==="
echo ""

# 1. Prepare native modules
echo "[1/4] Preparing native modules..."
bash scripts/prepare-native.sh

# 2. Build with electron-vite
echo "[2/4] Building with electron-vite..."
npx electron-vite build

# 3. Build for current platform
PLATFORM=${1:-"current"}

if [ "$PLATFORM" = "all" ]; then
  echo "[3/4] Building for all platforms..."
  echo "  Note: Cross-compilation has limitations."
  echo "  For best results, build on each target platform."
  echo ""
  echo "  Building macOS..."
  npx electron-builder --mac --config electron-builder.yml
  echo ""
  echo "  Building Windows..."
  npx electron-builder --win --config electron-builder.yml
  echo ""
  echo "  Building Linux..."
  npx electron-builder --linux --config electron-builder.yml
elif [ "$PLATFORM" = "mac" ]; then
  echo "[3/4] Building for macOS..."
  npx electron-builder --mac --config electron-builder.yml
elif [ "$PLATFORM" = "win" ]; then
  echo "[3/4] Building for Windows..."
  npx electron-builder --win --config electron-builder.yml
elif [ "$PLATFORM" = "linux" ]; then
  echo "[3/4] Building for Linux..."
  npx electron-builder --linux --config electron-builder.yml
else
  echo "[3/4] Building for current platform..."
  npx electron-builder --config electron-builder.yml
fi

# 4. List outputs
echo ""
echo "[4/4] Build outputs:"
echo ""
ls -lh release/*.dmg release/*.zip release/*.exe release/*.AppImage release/*.deb 2>/dev/null || echo "  (check release/ folder)"
echo ""
echo "Done!"
