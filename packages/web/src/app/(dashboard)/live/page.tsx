"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { Monitor } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

export default function LiveFeedPage() {
  const { user: currentUser } = useAuth();

  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  // Poll timesheets every 10 seconds for live activity data
  const { data: recentEntries } = useQuery({
    queryKey: ["live-entries"],
    queryFn: () => apiFetch("/timesheets?limit=50"),
    refetchInterval: 10000,
  });

  // Poll screenshots every 15 seconds
  const { data: recentScreenshots } = useQuery({
    queryKey: ["live-screenshots"],
    queryFn: () => apiFetch("/screenshots?limit=20"),
    refetchInterval: 15000,
  });

  const visibleUsers = allUsers?.filter((u: any) => {
    if (!currentUser) return false;
    if (u.id === currentUser.id) return false;
    if (currentUser.role === "owner") return true;
    if (currentUser.role === "manager") return u.role === "employee";
    return false;
  }) || [];

  // Build live status per user from recent data
  function getUserLiveData(userId: string) {
    const entries = recentEntries?.entries || [];
    const fiveMinAgo = Date.now() - 5 * 60 * 1000;

    // Find most recent entry for this user within last 5 minutes
    const recentEntry = entries.find((e: any) =>
      e.userId === userId && new Date(e.endTime || e.startTime).getTime() > fiveMinAgo
    );

    // Find most recent screenshot for this user
    const screenshots = recentScreenshots?.screenshots || [];
    const latestScreenshot = screenshots.find((s: any) => s.timeEntry?.userId === userId);

    let screenshotUrl = null;
    if (latestScreenshot?.downloadUrl) {
      const url = latestScreenshot.downloadUrl;
      screenshotUrl = url.startsWith("/screenshots/file/") ? `${API_BASE}${url}` : url;
    }

    return {
      isOnline: !!recentEntry,
      activityLevel: recentEntry?._count?.activitySnapshots || 0,
      project: recentEntry?.project?.name || null,
      screenshotUrl,
      screenshotTime: latestScreenshot?.timestamp,
    };
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Live Feed</h1>
      {visibleUsers.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Monitor className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400">No team members to monitor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleUsers.map((user: any) => {
            const live = getUserLiveData(user.id);
            return (
              <div key={user.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${live.isOnline ? "bg-green-500 animate-pulse" : "bg-slate-600"}`} />
                </div>
                <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                  {live.screenshotUrl ? (
                    <img src={live.screenshotUrl} alt="Screenshot" className="w-full h-full object-cover" />
                  ) : (
                    <p className="text-slate-600 text-sm">{live.isOnline ? "No screenshot yet" : "Offline"}</p>
                  )}
                </div>
                {live.isOnline && (
                  <div className="mt-2">
                    {live.project && (
                      <p className="text-xs text-blue-400 mb-1">{live.project}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      Last seen: {live.screenshotTime ? new Date(live.screenshotTime).toLocaleTimeString() : "just now"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
