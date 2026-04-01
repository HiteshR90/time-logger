import { powerMonitor, screen } from "electron";
import { calculateActivityLevel } from "@time-tracker/shared";

interface InputStats {
  keystrokes: number;
  mouseClicks: number;
  mouseDistancePx: number;
  lastMouseX: number;
  lastMouseY: number;
  lastInputTime: number;
}

const stats: InputStats = {
  keystrokes: 0,
  mouseClicks: 0,
  mouseDistancePx: 0,
  lastMouseX: 0,
  lastMouseY: 0,
  lastInputTime: Date.now(),
};

let started = false;
let pollInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Uses Electron's powerMonitor for idle detection and mouse position
 * polling for movement tracking. Keystroke/click counts are estimated
 * from system idle time changes.
 *
 * For full keylogging-level counts, install uiohook-napi with
 * electron-rebuild support and swap this module back.
 */
export function startInputTracking() {
  if (started) return;
  started = true;

  const cursorPos = screen.getCursorScreenPoint();
  stats.lastMouseX = cursorPos.x;
  stats.lastMouseY = cursorPos.y;

  // Poll cursor position every 500ms to estimate mouse movement
  pollInterval = setInterval(() => {
    const pos = screen.getCursorScreenPoint();
    const dx = pos.x - stats.lastMouseX;
    const dy = pos.y - stats.lastMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 2) {
      stats.mouseDistancePx += dist;
      stats.lastInputTime = Date.now();
      // Estimate clicks from direction changes (rough heuristic)
      if (dist < 5) stats.mouseClicks++;
    }

    stats.lastMouseX = pos.x;
    stats.lastMouseY = pos.y;

    // Use system idle time to estimate keystrokes
    const idleSeconds = powerMonitor.getSystemIdleTime();
    if (idleSeconds < 1) {
      // User was active in the last second — estimate input
      stats.keystrokes += 2; // rough avg keystrokes per 500ms of active typing
      stats.lastInputTime = Date.now();
    }
  }, 500);
}

export function stopInputTracking() {
  if (!started) return;
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
  started = false;
}

export function getAndResetStats() {
  const result = {
    keystrokes: stats.keystrokes,
    mouseClicks: stats.mouseClicks,
    mouseDistancePx: Math.round(stats.mouseDistancePx),
    activityLevel: calculateActivityLevel(
      stats.keystrokes,
      stats.mouseClicks,
      stats.mouseDistancePx,
    ),
  };

  stats.keystrokes = 0;
  stats.mouseClicks = 0;
  stats.mouseDistancePx = 0;

  return result;
}

export function getLastInputTime(): number {
  return stats.lastInputTime;
}
