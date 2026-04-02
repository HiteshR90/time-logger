import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { app, systemPreferences } from "electron";

const execFileAsync = promisify(execFile);

interface AppSession {
  app: string;
  title: string;
  url: string | null;
  startTime: number;
  durationSec: number;
  category: "productive" | "neutral" | "unproductive";
}

let currentApp: AppSession | null = null;
let appSessions: AppSession[] = [];
let pollInterval: ReturnType<typeof setInterval> | null = null;
let categoryRules: Array<{ pattern: string; category: string }> = [];
let binaryPath: string | null = null;

/**
 * Find the active-win Swift binary. It could be in:
 * 1. native_modules/active-win/main (packaged app)
 * 2. node_modules/active-win/main (dev mode)
 */
function findBinary(): string | null {
  const candidates = [
    path.join(__dirname, "..", "native_modules", "active-win", "main"),
    path.join(process.resourcesPath || "", "app.asar.unpacked", "native_modules", "active-win", "main"),
    path.join(__dirname, "..", "..", "native_modules", "active-win", "main"),
  ];

  // Dev mode — resolve from node_modules
  try {
    const devPath = path.join(
      path.dirname(require.resolve("active-win/package.json")),
      "main",
    );
    candidates.push(devPath);
  } catch {}

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      console.log("[app-tracker] Found binary at:", p);
      return p;
    }
  }
  console.error("[app-tracker] Binary not found. Tried:", candidates);
  return null;
}

async function getActiveWindow(): Promise<{ app: string; title: string } | null> {
  if (!binaryPath) {
    binaryPath = findBinary();
    if (!binaryPath) return null;
  }

  try {
    // Timeout after 3s to avoid hanging
    const { stdout } = await execFileAsync(binaryPath, [], { timeout: 3000 });
    const data = JSON.parse(stdout);
    if (data && data.app) {
      return { app: data.app, title: data.title || "" };
    }
  } catch (err: any) {
    // If permission denied or binary fails, disable app tracking silently
    if (err.code === "ERR_CHILD_PROCESS_STDIO_MAXBUFFER" || err.killed) {
      console.log("[app-tracker] Binary timed out — disabling app tracking");
      stopAppTracking();
    }
  }
  return null;
}

function categorize(appName: string, title: string): "productive" | "neutral" | "unproductive" {
  const combined = `${appName} ${title}`.toLowerCase();
  for (const rule of categoryRules) {
    if (combined.includes(rule.pattern.toLowerCase())) return rule.category as any;
  }
  const productive = ["code", "terminal", "iterm", "github", "gitlab", "jira", "slack", "teams", "zoom", "figma", "notion", "linear", "xcode", "intellij", "webstorm", "postman"];
  const unproductive = ["youtube", "netflix", "twitter", "facebook", "instagram", "reddit", "tiktok", "twitch", "discord"];
  for (const p of productive) { if (combined.includes(p)) return "productive"; }
  for (const p of unproductive) { if (combined.includes(p)) return "unproductive"; }
  return "neutral";
}

function extractUrl(title: string, appName: string): string | null {
  const browsers = ["chrome", "firefox", "safari", "edge", "brave", "arc"];
  if (!browsers.some((b) => appName.toLowerCase().includes(b))) return null;
  const parts = title.split(" - ");
  if (parts.length >= 2) {
    const d = parts[parts.length - 2]?.trim();
    if (d && d.includes(".")) return d;
  }
  return null;
}

export function setCategoryRules(rules: Array<{ pattern: string; category: string }>) {
  categoryRules = rules;
}

export function startAppTracking(intervalMs: number = 2000) {
  if (pollInterval) return;

  // Check Accessibility permission WITHOUT triggering the system prompt
  if (process.platform === "darwin") {
    const trusted = systemPreferences.isTrustedAccessibilityClient(false);
    if (!trusted) {
      console.log("[app-tracker] Accessibility permission not granted — skipping app tracking. Grant it in System Settings → Privacy & Security → Accessibility");
      return;
    }
  }

  let errorLogged = false;

  pollInterval = setInterval(async () => {
    const win = await getActiveWindow();
    if (!win) {
      if (!errorLogged) {
        console.log("[app-tracker] No active window. Grant Screen Recording permission in System Settings.");
        errorLogged = true;
      }
      return;
    }

    if (currentApp && currentApp.app === win.app && currentApp.title === win.title) {
      currentApp.durationSec = Math.round((Date.now() - currentApp.startTime) / 1000);
      return;
    }

    if (currentApp && currentApp.durationSec > 0) {
      appSessions.push({ ...currentApp });
    }

    currentApp = {
      app: win.app,
      title: win.title,
      url: extractUrl(win.title, win.app),
      startTime: Date.now(),
      durationSec: 0,
      category: categorize(win.app, win.title),
    };
  }, intervalMs);
}

export function stopAppTracking() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

export function getAndResetAppSessions(): AppSession[] {
  if (currentApp && currentApp.durationSec > 0) {
    appSessions.push({ ...currentApp });
    currentApp = { ...currentApp, startTime: Date.now(), durationSec: 0 };
  }
  const sessions = [...appSessions];
  appSessions = [];
  if (sessions.length > 0) {
    console.log("[app-tracker]", sessions.length, "sessions:", sessions.map(s => s.app).join(", "));
  }
  return sessions;
}
