import { uIOhook, UiohookMouseEvent } from "uiohook-napi";
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

export function startInputTracking() {
  if (started) return;
  started = true;

  uIOhook.on("keydown", () => {
    stats.keystrokes++;
    stats.lastInputTime = Date.now();
  });

  uIOhook.on("click", () => {
    stats.mouseClicks++;
    stats.lastInputTime = Date.now();
  });

  uIOhook.on("mousemove", (e: UiohookMouseEvent) => {
    if (stats.lastMouseX !== 0 || stats.lastMouseY !== 0) {
      const dx = e.x - stats.lastMouseX;
      const dy = e.y - stats.lastMouseY;
      stats.mouseDistancePx += Math.sqrt(dx * dx + dy * dy);
    }
    stats.lastMouseX = e.x;
    stats.lastMouseY = e.y;
    stats.lastInputTime = Date.now();
  });

  uIOhook.start();
}

export function stopInputTracking() {
  if (!started) return;
  uIOhook.stop();
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
