import { Tray, Menu, nativeImage, BrowserWindow } from "electron";
import path from "path";
import { stopSync, startSync, setActiveProject } from "./sync/sync-service";

let tray: Tray | null = null;
let mainWindow: BrowserWindow | null = null;

export function createTray(win: BrowserWindow) {
  mainWindow = win;

  // Create a simple tray icon (16x16 white circle for now)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("TimeTracker");

  updateTrayMenu("Stopped", []);
}

export function updateTrayMenu(
  status: string,
  projects: Array<{ id: string; name: string }>,
) {
  if (!tray) return;

  const projectItems: Electron.MenuItemConstructorOptions[] = projects.map(
    (p) => ({
      label: p.name,
      type: "radio" as const,
      click: () => {
        setActiveProject(p.id);
      },
    }),
  );

  const menu = Menu.buildFromTemplate([
    { label: `Status: ${status}`, enabled: false },
    { type: "separator" },
    { label: "Projects", submenu: projectItems.length > 0 ? projectItems : [{ label: "No projects", enabled: false }] },
    { type: "separator" },
    {
      label: "Start Tracking",
      click: () => startSync(),
    },
    {
      label: "Stop Tracking",
      click: () => stopSync(),
    },
    { type: "separator" },
    {
      label: "Show Window",
      click: () => mainWindow?.show(),
    },
    {
      label: "Quit",
      click: () => {
        stopSync();
        if (mainWindow) {
          mainWindow.destroy();
        }
        tray?.destroy();
        process.exit(0);
      },
    },
  ]);

  tray.setContextMenu(menu);
}

export function destroyTray() {
  tray?.destroy();
  tray = null;
}
