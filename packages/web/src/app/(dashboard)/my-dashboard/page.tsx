"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@time-tracker/shared";
import { Clock, Zap, FolderKanban } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function MyDashboardPage() {
  const { user } = useAuth();

  const { data: timesheets } = useQuery({
    queryKey: ["my-timesheets"],
    queryFn: () => apiFetch(`/timesheets?userId=${user?.id}&limit=50`),
  });

  const entries = timesheets?.entries || [];
  const totalSeconds = entries.reduce((sum: number, e: any) => sum + e.durationSec, 0);
  const avgActivity = entries.length > 0
    ? Math.round(entries.reduce((sum: number, e: any) => sum + (e._count?.activitySnapshots || 0), 0) / entries.length)
    : 0;

  // Mock activity trend data
  const trendData = Array.from({ length: 7 }, (_, i) => ({
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    hours: Math.round(Math.random() * 8 * 10) / 10,
    activity: Math.round(Math.random() * 40 + 50),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Hours</p>
              <p className="text-xl font-bold">{formatDuration(totalSeconds)}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Avg Activity</p>
              <p className="text-xl font-bold">{avgActivity}%</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <FolderKanban size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Time Entries</p>
              <p className="text-xl font-bold">{entries.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h2 className="text-lg font-semibold mb-4">Weekly Activity Trend</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
            <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Hours" />
            <Line type="monotone" dataKey="activity" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Activity %" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
