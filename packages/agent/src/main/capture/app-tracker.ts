import { activeWindow } from "active-win";

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

function categorize(appName: string, title: string): "productive" | "neutral" | "unproductive" {
  const combined = `${appName} ${title}`.toLowerCase();

  for (const rule of categoryRules) {
    if (combined.includes(rule.pattern.toLowerCase())) {
      return rule.category as any;
    }
  }

  // Default productive apps
  const productivePatterns = [
    "code", "terminal", "iterm", "github", "gitlab", "jira",
    "slack", "teams", "zoom", "figma", "notion", "linear",
    "xcode", "intellij", "webstorm", "postman",
  ];
  const unproductivePatterns = [
    "youtube", "netflix", "twitter", "facebook", "instagram",
    "reddit", "tiktok", "twitch", "discord",
  ];

  for (const p of productivePatterns) {
    if (combined.includes(p)) return "productive";
  }
  for (const p of unproductivePatterns) {
    if (combined.includes(p)) return "unproductive";
  }

  return "neutral";
}

function extractUrl(title: string, appName: string): string | null {
  // Browser titles often contain the URL or domain
  const browserApps = ["chrome", "firefox", "safari", "edge", "brave", "arc"];
  if (!browserApps.some((b) => appName.toLowerCase().includes(b))) return null;

  // Try to extract domain from title (usually "Page Title - Domain.com - Browser")
  const parts = title.split(" - ");
  if (parts.length >= 2) {
    const possibleDomain = parts[parts.length - 2]?.trim();
    if (possibleDomain && possibleDomain.includes(".")) {
      return possibleDomain;
    }
  }
  return null;
}

export function setCategoryRules(rules: Array<{ pattern: string; category: string }>) {
  categoryRules = rules;
}

export function startAppTracking(intervalMs: number = 2000) {
  if (pollInterval) return;

  let noPermissionLogged = false;

  pollInterval = setInterval(async () => {
    try {
      const win = await activeWindow();
      if (!win) {
        if (!noPermissionLogged) {
          console.log("[app-tracker] No active window detected. On macOS, grant Screen Recording permission: System Settings → Privacy & Security → Screen Recording → allow TimeTracker");
          noPermissionLogged = true;
        }
        return;
      }

      const appName = win.owner.name;
      const title = win.title;

      if (currentApp && currentApp.app === appName && currentApp.title === title) {
        // Same app/window, accumulate time
        currentApp.durationSec = Math.round(
          (Date.now() - currentApp.startTime) / 1000,
        );
        return;
      }

      // App changed — finalize current and start new
      if (currentApp && currentApp.durationSec > 0) {
        appSessions.push({ ...currentApp });
      }

      currentApp = {
        app: appName,
        title,
        url: extractUrl(title, appName),
        startTime: Date.now(),
        durationSec: 0,
        category: categorize(appName, title),
      };
    } catch (err) {
      if (!noPermissionLogged) {
        console.error("[app-tracker] Error detecting active window:", err);
        noPermissionLogged = true;
      }
    }
  }, intervalMs);
}

export function stopAppTracking() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

export function getAndResetAppSessions(): AppSession[] {
  // Finalize current app
  if (currentApp && currentApp.durationSec > 0) {
    appSessions.push({ ...currentApp });
    currentApp = { ...currentApp, startTime: Date.now(), durationSec: 0 };
  }

  const sessions = [...appSessions];
  appSessions = [];
  if (sessions.length > 0) {
    console.log("[app-tracker] Returning", sessions.length, "sessions:", sessions.map(s => s.app).join(", "));
  }
  return sessions;
}
