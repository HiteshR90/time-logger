"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { connectSocket, getSocket } from "@/lib/socket";
import { Monitor } from "lucide-react";

export default function LiveFeedPage() {
  const [liveData, setLiveData] = useState<Record<string, any>>({});

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users?.map((user: any) => {
          const activity = liveData[user.id];
          return (
            <div key={user.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
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
        {!users?.length && (
          <p className="text-slate-400 col-span-3">No team members yet. Invite members from Settings.</p>
        )}
      </div>
    </div>
  );
}
