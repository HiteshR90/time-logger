const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    if (typeof window !== "undefined") localStorage.setItem("accessToken", token);
  } else {
    if (typeof window !== "undefined") localStorage.removeItem("accessToken");
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) localStorage.setItem("refreshToken", token);
    else localStorage.removeItem("refreshToken");
  }
}

function getRefreshToken(): string | null {
  if (typeof window !== "undefined") return localStorage.getItem("refreshToken");
  return null;
}

async function refreshAccessToken(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) return false;
    const { data } = await res.json();
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.Authorization = `Bearer ${getAccessToken()}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.error || "API error");
  return json.data;
}
