#!/bin/bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"

echo "=== TimeTracker — Starting All Services ==="
echo ""

# 1. Check PostgreSQL
if ! $PSQL -U hitesh -d timetracker -c "SELECT 1" &>/dev/null; then
  echo "[!] PostgreSQL not running or 'timetracker' DB missing."
  echo "    Run: brew services start postgresql@17"
  exit 1
fi
echo "[✓] PostgreSQL running"

# 2. Build shared package
echo "[…] Building shared package..."
cd "$ROOT_DIR"
pnpm turbo build --filter=@time-tracker/shared --no-daemon 2>&1 | tail -1
echo "[✓] Shared package built"

# 3. Generate Prisma client
cd "$ROOT_DIR/packages/api"
npx prisma generate --no-hints &>/dev/null
echo "[✓] Prisma client generated"

# 4. Start API server
echo "[…] Starting API on :5080"
npx tsx src/server.ts &
API_PID=$!

# 5. Start Next.js dashboard
echo "[…] Starting Dashboard on :3000"
cd "$ROOT_DIR/packages/web"
npx next dev --port 3000 &
WEB_PID=$!

# 6. Start Electron agent
echo "[…] Starting Electron agent"
cd "$ROOT_DIR/packages/agent"
npx electron-vite dev &
AGENT_PID=$!

echo ""
echo "=== All services started ==="
echo "  API:       http://localhost:5080"
echo "  Dashboard: http://localhost:3000"
echo "  Agent:     Electron window"
echo "  Health:    http://localhost:5080/health"
echo ""
echo "  API PID:   $API_PID"
echo "  Web PID:   $WEB_PID"
echo "  Agent PID: $AGENT_PID"
echo ""
echo "Press Ctrl+C to stop all services."

# Trap Ctrl+C to kill all
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $API_PID $WEB_PID $AGENT_PID 2>/dev/null
  wait $API_PID $WEB_PID $AGENT_PID 2>/dev/null
  echo "Done."
  exit 0
}
trap cleanup SIGINT SIGTERM

# Wait for all
wait
