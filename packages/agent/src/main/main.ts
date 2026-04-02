import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { loadStoredTokens, setTokens, clearTokens, apiRequest, getAccessToken } from "./api-client";
import { startInputTracking, stopInputTracking } from "./capture/input-tracker";
import { startAppTracking, stopAppTracking, setCategoryRules } from "./capture/app-tracker";
import { startIdleDetection, stopIdleDetection, setIdleTimeout, onIdle } from "./capture/idle-detector";
import { configure, startSync, stopSync } from "./sync/sync-service";
import { fetchConfig, loadCachedConfig } from "./config/config-manager";
import { createTray, updateTrayMenu, destroyTray } from "./tray";
import { closeDb } from "./sync/offline-queue";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const preloadPath = path.join(__dirname, "../preload/preload.js");
  console.log("Preload path:", preloadPath);
  console.log("Preload exists:", require("fs").existsSync(preloadPath));

  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    resizable: false,
    show: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false,
    },
  });

  // electron-vite sets ELECTRON_RENDERER_URL in dev mode
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.on("close", (e) => {
    e.preventDefault();
    mainWindow?.hide();
  });

  createTray(mainWindow);
}

async function initializeTracking() {
  const config = await fetchConfig();

  setCategoryRules(config.appCategories);
  setIdleTimeout(config.idleTimeoutMin);

  onIdle(
    () => console.log("User went idle"),
    () => console.log("User returned from idle"),
  );

  startInputTracking();
  startAppTracking();
  startIdleDetection();
}

// IPC Handlers
ipcMain.handle("auth:login", async (_e, email: string, password: string) => {
  try {
    const res = await fetch("http://localhost:5080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setTokens(data.data.accessToken, data.data.refreshToken);
      return { success: true, user: data.data.user };
    }
    return { success: false, error: data.error };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("auth:logout", () => {
  clearTokens();
  stopSync();
  return { success: true };
});

ipcMain.handle("auth:check", () => {
  return { loggedIn: !!getAccessToken() };
});

ipcMain.handle("projects:list", async () => {
  try {
    const { data } = await apiRequest("/projects");
    return { success: true, projects: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("tracking:start", async (_e, userId: string, projectId: string) => {
  const config = loadCachedConfig();
  configure({
    userId,
    projectId,
    screenshotIntervalMin: config.screenshotIntervalMin,
    blurScreenshots: config.blurScreenshots,
  });
  await initializeTracking();
  startSync();
  return { success: true };
});

ipcMain.handle("tracking:stop", () => {
  stopSync();
  stopInputTracking();
  stopAppTracking();
  stopIdleDetection();
  return { success: true };
});

// App lifecycle
app.whenReady().then(() => {
  loadStoredTokens();
  createWindow();
});

app.on("window-all-closed", () => {
  // Keep running in tray on macOS
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopSync();
  stopInputTracking();
  stopAppTracking();
  stopIdleDetection();
  closeDb();
  destroyTray();
});
