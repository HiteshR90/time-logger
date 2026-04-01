import { getLastInputTime } from "./input-tracker";

let idleTimeoutMs = 5 * 60 * 1000; // 5 minutes default
let checkInterval: ReturnType<typeof setInterval> | null = null;
let isIdle = false;
let onIdleStart: (() => void) | null = null;
let onIdleEnd: (() => void) | null = null;

export function setIdleTimeout(minutes: number) {
  idleTimeoutMs = minutes * 60 * 1000;
}

export function onIdle(start: () => void, end: () => void) {
  onIdleStart = start;
  onIdleEnd = end;
}

export function startIdleDetection(checkIntervalMs: number = 10000) {
  if (checkInterval) return;

  checkInterval = setInterval(() => {
    const elapsed = Date.now() - getLastInputTime();
    const wasIdle = isIdle;

    isIdle = elapsed >= idleTimeoutMs;

    if (isIdle && !wasIdle && onIdleStart) {
      onIdleStart();
    }
    if (!isIdle && wasIdle && onIdleEnd) {
      onIdleEnd();
    }
  }, checkIntervalMs);
}

export function stopIdleDetection() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

export function getIsIdle(): boolean {
  return isIdle;
}
