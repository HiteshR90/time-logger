import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  login: (email: string, password: string) =>
    ipcRenderer.invoke("auth:login", email, password),
  logout: () => ipcRenderer.invoke("auth:logout"),
  checkAuth: () => ipcRenderer.invoke("auth:check"),
  listProjects: () => ipcRenderer.invoke("projects:list"),
  startTracking: (userId: string, projectId: string) =>
    ipcRenderer.invoke("tracking:start", userId, projectId),
  stopTracking: () => ipcRenderer.invoke("tracking:stop"),
});
