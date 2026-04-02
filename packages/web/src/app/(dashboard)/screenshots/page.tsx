"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Camera, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

function imgSrc(ss: any): string | null {
  const url = ss.downloadUrl;
  if (!url) return null;
  if (url.startsWith("/screenshots/file/")) return `${API_BASE}${url}`;
  return url;
}

export default function ScreenshotsPage() {
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [from, setFrom] = useState(() => new Date().toISOString().split("T")[0]);
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [expandedImg, setExpandedImg] = useState<string | null>(null);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch("/projects"),
  });

  const queryParams = new URLSearchParams({ limit: "100" });
  if (selectedUser) queryParams.set("userId", selectedUser);
  if (selectedProject) queryParams.set("projectId", selectedProject);
  if (from) queryParams.set("from", new Date(from).toISOString());
  if (to) queryParams.set("to", new Date(to + "T23:59:59").toISOString());

  const { data } = useQuery({
    queryKey: ["screenshots", selectedUser, selectedProject, from, to],
    queryFn: () => apiFetch(`/screenshots?${queryParams.toString()}`),
  });

  const screenshots = data?.screenshots || [];

  // Group by hour for timeline view
  const groupedByHour: Record<string, any[]> = {};
  for (const ss of screenshots) {
    const date = new Date(ss.timestamp);
    const hourKey = `${date.toLocaleDateString()} ${date.getHours().toString().padStart(2, "0")}:00`;
    if (!groupedByHour[hourKey]) groupedByHour[hourKey] = [];
    groupedByHour[hourKey].push(ss);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Screenshots</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 items-center flex-wrap">
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
          <option value="">All employees</option>
          {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
          <option value="">All projects</option>
          {projects?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        <span className="text-slate-400 text-sm">to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        <span className="text-sm text-slate-500">{screenshots.length} screenshot{screenshots.length !== 1 ? "s" : ""}</span>
      </div>

      {screenshots.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <Camera className="mx-auto text-slate-600 mb-3" size={40} />
          <p className="text-slate-400">No screenshots for the selected period.</p>
          <p className="text-slate-500 text-sm mt-1">Screenshots are captured when the desktop agent is tracking.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByHour).map(([hour, shots]) => (
            <div key={hour}>
              <h3 className="text-sm font-medium text-slate-400 mb-3">{hour} ({shots.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {shots.map((ss: any) => {
                  const src = imgSrc(ss);
                  return (
                    <div key={ss.id}
                      className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => src && setExpandedImg(src)}>
                      {src ? (
                        <img src={src} alt="Screenshot" className="w-full aspect-video object-cover" loading="lazy" />
                      ) : (
                        <div className="w-full aspect-video bg-slate-900 flex items-center justify-center">
                          <Camera className="text-slate-700" size={24} />
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs text-slate-300">{ss.timeEntry?.user?.name}</p>
                        <p className="text-xs text-slate-500">{new Date(ss.timestamp).toLocaleTimeString()}</p>
                        {ss.timeEntry?.project?.name && (
                          <p className="text-xs text-slate-600">{ss.timeEntry.project.name}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded view */}
      {expandedImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setExpandedImg(null)}>
          <button className="absolute top-4 right-4 text-white hover:text-slate-300" onClick={() => setExpandedImg(null)}>
            <X size={28} />
          </button>
          <img src={expandedImg} alt="Full screenshot" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
