"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiFetch, setAccessToken, setRefreshToken, getAccessToken } from "./api-client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (orgName: string, email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      apiFetch("/organizations/me")
        .then(() => {
          const stored = localStorage.getItem("user");
          if (stored) setUser(JSON.parse(stored));
        })
        .catch(() => {
          setAccessToken(null);
          setRefreshToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080"}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setAccessToken(json.data.accessToken);
    setRefreshToken(json.data.refreshToken);
    setUser(json.data.user);
    localStorage.setItem("user", JSON.stringify(json.data.user));
  };

  const register = async (orgName: string, email: string, password: string, name: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080"}/auth/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgName, email, password, name }),
      },
    );
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setAccessToken(json.data.accessToken);
    setRefreshToken(json.data.refreshToken);
    setUser(json.data.user);
    localStorage.setItem("user", JSON.stringify(json.data.user));
  };

  const logout = () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
