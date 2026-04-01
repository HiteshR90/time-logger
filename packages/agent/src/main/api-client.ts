import Store from "electron-store";

const store = new Store();

const API_BASE = store.get("apiUrl", "http://localhost:5080") as string;

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  store.set("refreshToken", refresh);
}

export function loadStoredTokens() {
  refreshToken = store.get("refreshToken", null) as string | null;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  store.delete("refreshToken");
}

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    accessToken = data.data.accessToken;
    refreshToken = data.data.refreshToken;
    store.set("refreshToken", refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<any> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  // Try refresh on 401
  if (res.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${accessToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }

  return res.json();
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getApiBase(): string {
  return API_BASE;
}
