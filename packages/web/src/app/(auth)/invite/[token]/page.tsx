"use client";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { setAccessToken, setRefreshToken } from "@/lib/api-client";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080"}/auth/accept-invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setAccessToken(json.data.accessToken);
      setRefreshToken(json.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(json.data.user));
      router.push("/live");
    } catch (err: any) {
      setError(err.message || "Invalid or expired invite link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm p-8 bg-slate-800 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-2">Join TimeTracker</h1>
        <p className="text-sm text-slate-400 text-center mb-6">Set your password to activate your account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={8} placeholder="At least 8 characters"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required minLength={8} placeholder="Re-enter password"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50">
            {loading ? "Setting up..." : "Activate Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
