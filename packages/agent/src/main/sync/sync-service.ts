import { apiRequest } from "../api-client";
import { getAndResetStats } from "../capture/input-tracker";
import { getAndResetAppSessions } from "../capture/app-tracker";
import { captureScreenshot } from "../capture/screenshot";
import { getIsIdle } from "../capture/idle-detector";
import * as offlineQueue from "./offline-queue";
import { DEFAULTS } from "@time-tracker/shared";

let syncInterval: ReturnType<typeof setInterval> | null = null;
let screenshotInterval: ReturnType<typeof setInterval> | null = null;
let currentProjectId: string | null = null;
let currentUserId: string | null = null;
let screenshotIntervalMin: number = DEFAULTS.SCREENSHOT_INTERVAL_MIN;
let blurScreenshots: boolean = false;

export function configure(opts: {
  userId: string;
  projectId: string;
  screenshotIntervalMin: number;
  blurScreenshots: boolean;
}) {
  currentUserId = opts.userId;
  currentProjectId = opts.projectId;
  screenshotIntervalMin = opts.screenshotIntervalMin;
  blurScreenshots = opts.blurScreenshots;
}

export function setActiveProject(projectId: string) {
  currentProjectId = projectId;
}

async function syncOnce() {
  if (!currentUserId || !currentProjectId) return;

  const inputStats = getAndResetStats();
  const appSessions = getAndResetAppSessions();
  const isIdle = getIsIdle();

  const payload = {
    timestamp: new Date().toISOString(),
    userId: currentUserId,
    projectId: currentProjectId,
    screenshots: [] as Array<{ s3Key: string }>,
    keystrokes: inputStats.keystrokes,
    mouseClicks: inputStats.mouseClicks,
    mouseDistancePx: inputStats.mouseDistancePx,
    activityLevel: inputStats.activityLevel,
    activeApps: appSessions.map((s) => ({
      app: s.app,
      title: s.title,
      url: s.url,
      durationSec: s.durationSec,
      category: s.category,
    })),
    isIdle,
  };

  try {
    await apiRequest("/activity/ingest", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Also drain offline queue
    await drainOfflineQueue();
  } catch {
    // Save to offline queue
    offlineQueue.enqueue(payload);
    console.log("Queued payload offline, queue size:", offlineQueue.queueSize());
  }
}

async function takeScreenshot() {
  if (!currentUserId || !currentProjectId || getIsIdle()) return;

  try {
    await captureScreenshot(blurScreenshots);
  } catch (err) {
    console.error("Screenshot failed:", err);
  }
}

async function drainOfflineQueue() {
  const items = offlineQueue.dequeue(5);
  for (const item of items) {
    try {
      await apiRequest("/activity/ingest", {
        method: "POST",
        body: JSON.stringify(item.payload),
      });
      offlineQueue.remove(item.id);
    } catch {
      offlineQueue.incrementRetries(item.id);
      break; // Stop if still offline
    }
  }
}

function getScreenshotIntervalMs(): number {
  if (screenshotIntervalMin === -1) {
    // Random: between 1 and 10 minutes
    return (Math.floor(Math.random() * 9) + 1) * 60 * 1000;
  }
  return screenshotIntervalMin * 60 * 1000;
}

export function startSync() {
  if (syncInterval) return;

  // Activity sync every 60 seconds
  syncInterval = setInterval(syncOnce, DEFAULTS.ACTIVITY_SYNC_INTERVAL_SEC * 1000);

  // Screenshot at configured interval
  const scheduleScreenshot = () => {
    screenshotInterval = setTimeout(() => {
      takeScreenshot();
      scheduleScreenshot();
    }, getScreenshotIntervalMs());
  };
  scheduleScreenshot();

  console.log("Sync started");
}

export function stopSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  if (screenshotInterval) {
    clearTimeout(screenshotInterval);
    screenshotInterval = null;
  }
  console.log("Sync stopped");
}
