"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { connectSocket, getSocket } from "@/lib/socket";
import { Monitor } from "lucide-react";

export default function LiveFeedPage() {
  const { user: currentUser } = useAuth();
  const [liveData, setLiveData] = useState<Record<string, any>>({});

  const { data: allUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  // Filter users based on role:
  // - Owner: sees everyone except themselves
  // - Manager: sees employees only (not owner, not other managers)
  // - Employee: should not be on this page (sidebar hides it) but if they are, see only themselves
  const visibleUsers = allUsers?.filter((u: any) => {
    if (!currentUser) return false;
    if (u.id === currentUser.id) return false; // Don't show yourself in live feed

    if (currentUser.role === "owner") return true; // Owner sees all others
    if (currentUser.role === "manager") return u.role === "employee"; // Manager sees employees only
    return false; // Employee sees nobody
  }) || [];

  useEffect(() => {
    connectSocket();
    const socket = getSocket();

    socket.on("activity:update", (data: any) => {
      setLiveData((prev) => ({ ...prev, [data.userId]: data }));
    });

    return () => {
      socket.off("activity:update");
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Live Feed</h1>
      {visibleUsers.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Monitor className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400">No team members to monitor.</p>
          <p className="text-slate-500 text-sm mt-1">
            {currentUser?.role === "manager"
              ? "You can monitor employees assigned to your organization."
              : "Invite members from the Members page."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleUsers.map((user: any) => {
            const activity = liveData[user.id];
            return (
              <div key={user.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${activity ? "bg-green-500" : "bg-slate-600"}`} />
                </div>
                {activity ? (
                  <div className="space-y-2">
                    <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center">
                      {activity.screenshotUrl ? (
                        <img src={activity.screenshotUrl} alt="Screenshot" className="rounded-lg w-full h-full object-cover" />
                      ) : (
                        <Monitor className="text-slate-600" size={32} />
                      )}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Activity</span>
                      <span className="font-medium">{activity.activityLevel ?? 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${activity.activityLevel ?? 0}%` }} />
                    </div>
                    <p className="text-xs text-slate-400">
                      {activity.currentApp || "No app detected"}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-900 rounded-lg aspect-video flex items-center justify-center">
                    <p className="text-slate-600 text-sm">Offline</p>
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
