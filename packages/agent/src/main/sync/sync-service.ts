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
let pendingScreenshots: Array<{ s3Key: string }> = [];

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
  if (!currentUserId || !currentProjectId) {
    console.log("[sync] Skipped — no user/project set");
    return;
  }
  console.log("[sync] Syncing activity data...");

  const inputStats = getAndResetStats();
  const appSessions = getAndResetAppSessions();
  const isIdle = getIsIdle();

  const payload = {
    timestamp: new Date().toISOString(),
    userId: currentUserId,
    projectId: currentProjectId,
    screenshots: [...pendingScreenshots],
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
    console.log("[sync] Activity synced successfully, screenshots:", pendingScreenshots.length);
    pendingScreenshots = [];

    // Also drain offline queue
    await drainOfflineQueue();
  } catch (err) {
    console.error("[sync] Activity sync failed:", err);
    // Save to offline queue
    offlineQueue.enqueue(payload);
    console.log("Queued payload offline, queue size:", offlineQueue.queueSize());
  }
}

async function takeScreenshot() {
  if (!currentUserId || !currentProjectId || getIsIdle()) {
    console.log("[screenshot] Skipped — idle or no user/project");
    return;
  }

  try {
    console.log("[screenshot] Capturing...");
    const result = await captureScreenshot(blurScreenshots);
    pendingScreenshots.push({ s3Key: result.s3Key });
    console.log("[screenshot] Captured:", result.s3Key);
  } catch (err) {
    console.error("[screenshot] Failed:", err);
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

  console.log("[sync] Starting sync — interval:", DEFAULTS.ACTIVITY_SYNC_INTERVAL_SEC, "s, screenshot interval:", screenshotIntervalMin, "min");

  // Run first sync immediately, then every 60 seconds
  syncOnce();
  syncInterval = setInterval(syncOnce, DEFAULTS.ACTIVITY_SYNC_INTERVAL_SEC * 1000);

  // Take first screenshot after 5 seconds, then at configured interval
  setTimeout(() => {
    takeScreenshot();
    const scheduleScreenshot = () => {
      screenshotInterval = setTimeout(() => {
        takeScreenshot();
        scheduleScreenshot();
      }, getScreenshotIntervalMs());
    };
    scheduleScreenshot();
  }, 5000);

  console.log("[sync] Sync started — first screenshot in 5 seconds");
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
