"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@time-tracker/shared";
import { Clock, Zap, FolderKanban, Camera } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

export default function MyDashboardPage() {
  useAuth(); // ensure authenticated

  // Get ALL timesheets (not just this user's) — for owners this shows team overview
  const { data: timesheets } = useQuery({
    queryKey: ["my-timesheets"],
    queryFn: () => apiFetch(`/timesheets?limit=100`),
  });

  const { data: screenshots } = useQuery({
    queryKey: ["my-screenshots"],
    queryFn: () => apiFetch(`/screenshots?limit=5`),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch("/projects"),
  });

  const entries = timesheets?.entries || [];
  const totalSeconds = entries.reduce((sum: number, e: any) => sum + e.durationSec, 0);

  // Group hours by project for chart
  const projectHours: Record<string, { name: string; hours: number }> = {};
  for (const entry of entries) {
    const pName = entry.project?.name || "Unknown";
    if (!projectHours[pName]) projectHours[pName] = { name: pName, hours: 0 };
    projectHours[pName].hours += entry.durationSec / 3600;
  }
  const projectData = Object.values(projectHours)
    .map((p) => ({ ...p, hours: Math.round(p.hours * 100) / 100 }))
    .sort((a, b) => b.hours - a.hours);

  // Group hours by employee
  const userHours: Record<string, { name: string; hours: number; entries: number }> = {};
  for (const entry of entries) {
    const uName = entry.user?.name || "Unknown";
    if (!userHours[uName]) userHours[uName] = { name: uName, hours: 0, entries: 0 };
    userHours[uName].hours += entry.durationSec / 3600;
    userHours[uName].entries += 1;
  }
  const userData = Object.values(userHours)
    .map((u) => ({ ...u, hours: Math.round(u.hours * 100) / 100 }))
    .sort((a, b) => b.hours - a.hours);

  const recentScreenshots = screenshots?.screenshots || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Zap size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Time Entries</p>
              <p className="text-xl font-bold">{entries.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <FolderKanban size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Projects</p>
              <p className="text-xl font-bold">{projects?.length || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
              <Camera size={20} className="text-orange-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Screenshots</p>
              <p className="text-xl font-bold">{screenshots?.total || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Hours by Project</h2>
          {projectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <Bar dataKey="hours" fill="#3b82f6" radius={4} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-12">No time tracked yet</p>}
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Hours by Employee</h2>
          {userData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={4} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-12">No time tracked yet</p>}
        </div>
      </div>

      {/* Recent Screenshots */}
      {recentScreenshots.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Screenshots</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {recentScreenshots.map((ss: any) => {
              const url = ss.downloadUrl?.startsWith("/screenshots/file/") ? `${API_BASE}${ss.downloadUrl}` : ss.downloadUrl;
              return (
                <div key={ss.id} className="bg-slate-900 rounded-lg overflow-hidden">
                  {url ? <img src={url} alt="" className="w-full aspect-video object-cover" /> :
                    <div className="w-full aspect-video flex items-center justify-center"><Camera size={20} className="text-slate-700" /></div>}
                  <div className="p-2">
                    <p className="text-xs text-slate-400">{ss.timeEntry?.user?.name}</p>
                    <p className="text-xs text-slate-500">{new Date(ss.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
