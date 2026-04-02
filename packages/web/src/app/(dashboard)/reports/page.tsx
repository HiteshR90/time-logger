"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatDuration } from "@time-tracker/shared";
import { Camera, X, Globe, FileText } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";
const COLORS = { productive: "#22c55e", neutral: "#eab308", unproductive: "#ef4444" };

type Tab = "activity" | "time-by-project" | "app-usage" | "screenshots" | "employee-earnings";

export default function ReportsPage() {
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.role === "owner";
  const [tab, setTab] = useState<Tab>("activity");
  const [selectedUser, setSelectedUser] = useState("");
  const [from, setFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0]; });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [expandedImg, setExpandedImg] = useState<string | null>(null);

  const { data: users } = useQuery({ queryKey: ["users"], queryFn: () => apiFetch("/users") });
  const dateParams = `from=${new Date(from).toISOString()}&to=${new Date(to + "T23:59:59").toISOString()}`;
  const userParam = selectedUser ? `&userId=${selectedUser}` : "";

  const { data: activityData } = useQuery({
    queryKey: ["r-activity", selectedUser, from, to], enabled: tab === "activity",
    queryFn: () => apiFetch(`/reports/activity?${dateParams}${userParam}`),
  });
  const { data: projectData } = useQuery({
    queryKey: ["r-project", from, to], enabled: tab === "time-by-project",
    queryFn: () => apiFetch(`/reports/time-by-project?${dateParams}`),
  });
  const { data: appData } = useQuery({
    queryKey: ["r-app", selectedUser, from, to], enabled: tab === "app-usage",
    queryFn: () => apiFetch(`/reports/app-usage?${dateParams}${userParam}`),
  });
  const { data: screenshotData } = useQuery({
    queryKey: ["r-screenshots", selectedUser, from, to], enabled: tab === "screenshots",
    queryFn: () => apiFetch(`/screenshots?limit=100&from=${new Date(from).toISOString()}&to=${new Date(to + "T23:59:59").toISOString()}${selectedUser ? `&userId=${selectedUser}` : ""}`),
  });
  const { data: earningsData } = useQuery({
    queryKey: ["r-earnings", from, to], enabled: tab === "employee-earnings" && isOwner,
    queryFn: () => apiFetch(`/reports/employee-earnings?${dateParams}`),
  });

  const tabs: { key: Tab; label: string; ownerOnly?: boolean }[] = [
    { key: "activity", label: "Activity" },
    { key: "time-by-project", label: "Time by Project" },
    { key: "app-usage", label: "App Usage" },
    { key: "screenshots", label: "Screenshots" },
    { key: "employee-earnings", label: "Employee Earnings", ownerOnly: true },
  ];

  function imgSrc(ss: any): string | null {
    const url = ss?.downloadUrl;
    if (!url) return null;
    if (url.startsWith("/screenshots/file/")) return `${API_BASE}${url}`;
    return url;
  }

  const apps = appData || [];
  const categoryTotals = apps.reduce((acc: any, a: any) => { acc[a.category] = (acc[a.category] || 0) + a.totalHours; return acc; }, {});
  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value: Math.round((value as number) * 100) / 100,
    color: COLORS[name as keyof typeof COLORS] || "#94a3b8",
  }));

  const screenshots = screenshotData?.screenshots || [];
  const groupedByHour: Record<string, any[]> = {};
  for (const ss of screenshots) {
    const d = new Date(ss.timestamp);
    const key = `${d.toLocaleDateString()} ${d.getHours().toString().padStart(2, "0")}:00`;
    if (!groupedByHour[key]) groupedByHour[key] = [];
    groupedByHour[key].push(ss);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {tabs.filter(t => !t.ownerOnly || isOwner).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm ${tab === t.key ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 items-center flex-wrap">
        {tab !== "employee-earnings" && tab !== "time-by-project" && (
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="">All employees</option>
            {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        <span className="text-slate-400 text-sm">to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
      </div>

      {/* Activity */}
      {tab === "activity" && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Activity by Employee</h2>
          {(activityData || []).length === 0 ? <p className="text-slate-500 text-center py-12">No activity data for this period.</p> : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="user.name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                  <Bar dataKey="totalHours" fill="#3b82f6" radius={4} name="Hours" />
                  <Bar dataKey="avgActivity" fill="#22c55e" radius={4} name="Avg Activity %" />
                </BarChart>
              </ResponsiveContainer>
              <table className="w-full text-sm mt-4"><thead className="bg-slate-700/50"><tr>
                <th className="text-left px-4 py-2 text-slate-300">Employee</th><th className="text-left px-4 py-2 text-slate-300">Hours</th>
                <th className="text-left px-4 py-2 text-slate-300">Avg Activity</th><th className="text-left px-4 py-2 text-slate-300">Entries</th>
              </tr></thead><tbody>
                {activityData.map((r: any) => <tr key={r.user.id} className="border-t border-slate-700">
                  <td className="px-4 py-2">{r.user.name}</td><td className="px-4 py-2">{r.totalHours}h</td>
                  <td className="px-4 py-2">{r.avgActivity}%</td><td className="px-4 py-2">{r.entries}</td>
                </tr>)}
              </tbody></table>
            </>
          )}
        </div>
      )}

      {/* Time by Project */}
      {tab === "time-by-project" && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Time by Project</h2>
          {(projectData || []).length === 0 ? <p className="text-slate-500 text-center py-12">No data.</p> : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="project.name" type="category" width={120} stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                  <Bar dataKey="totalHours" fill="#8b5cf6" radius={4} name="Hours" />
                </BarChart>
              </ResponsiveContainer>
              <table className="w-full text-sm mt-4"><thead className="bg-slate-700/50"><tr>
                <th className="text-left px-4 py-2 text-slate-300">Project</th><th className="text-left px-4 py-2 text-slate-300">Hours</th>
                <th className="text-left px-4 py-2 text-slate-300">Entries</th>
              </tr></thead><tbody>
                {projectData.map((r: any) => <tr key={r.project.id} className="border-t border-slate-700">
                  <td className="px-4 py-2">{r.project.name}</td><td className="px-4 py-2">{r.totalHours}h</td><td className="px-4 py-2">{r.entries}</td>
                </tr>)}
              </tbody></table>
            </>
          )}
        </div>
      )}

      {/* App Usage */}
      {tab === "app-usage" && (
        <div className="space-y-6">
          {apps.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <p className="text-slate-400">No app usage data for this period.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold mb-4">Hours by App</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={apps.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="app" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                    <Bar dataKey="totalHours" name="Hours" radius={4} cursor="pointer"
                      onClick={(d: any) => setSelectedApp(apps.find((a: any) => a.app === d.app))}>
                      {apps.slice(0, 10).map((e: any, i: number) => <Cell key={i} fill={COLORS[e.category as keyof typeof COLORS] || "#94a3b8"} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-lg font-semibold mb-4">Productivity</h2>
                {categoryData.length > 0 && (
                  <><ResponsiveContainer width="100%" height={250}>
                    <PieChart><Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {categoryData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie><Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} /></PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-6 mt-2">
                    {categoryData.map((c) => <div key={c.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: c.color }} /><span className="text-slate-400">{c.name}: {c.value}h</span>
                    </div>)}
                  </div></>
                )}
              </div>
            </div>
          )}
          {apps.length > 0 && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-sm"><thead className="bg-slate-700/50"><tr>
                <th className="text-left px-4 py-3 text-slate-300">App</th><th className="text-left px-4 py-3 text-slate-300">Time</th>
                <th className="text-left px-4 py-3 text-slate-300">Category</th><th className="text-left px-4 py-3 text-slate-300">Windows</th>
              </tr></thead><tbody>
                {apps.map((a: any) => <tr key={a.app} className="border-t border-slate-700 cursor-pointer hover:bg-slate-700/30"
                  onClick={() => setSelectedApp(selectedApp?.app === a.app ? null : a)}>
                  <td className="px-4 py-3 font-medium">{a.app}</td><td className="px-4 py-3">{formatDuration(a.totalSeconds)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${a.category === "productive" ? "bg-green-900/50 text-green-400" : a.category === "unproductive" ? "bg-red-900/50 text-red-400" : "bg-yellow-900/50 text-yellow-400"}`}>{a.category}</span></td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{a.details?.length || 0}</td>
                </tr>)}
              </tbody></table>
            </div>
          )}
        </div>
      )}

      {/* Screenshots */}
      {tab === "screenshots" && (
        <div>
          {screenshots.length === 0 ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <Camera className="mx-auto text-slate-600 mb-3" size={40} />
              <p className="text-slate-400">No screenshots for this period.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedByHour).map(([hour, shots]) => (
                <div key={hour}>
                  <h3 className="text-sm font-medium text-slate-400 mb-3">{hour} ({shots.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {shots.map((ss: any) => {
                      const src = imgSrc(ss);
                      return <div key={ss.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden cursor-pointer hover:border-blue-500"
                        onClick={() => src && setExpandedImg(src)}>
                        {src ? <img src={src} alt="" className="w-full aspect-video object-cover" loading="lazy" /> :
                          <div className="w-full aspect-video bg-slate-900 flex items-center justify-center"><Camera className="text-slate-700" size={24} /></div>}
                        <div className="p-2"><p className="text-xs text-slate-300">{ss.timeEntry?.user?.name}</p>
                          <p className="text-xs text-slate-500">{new Date(ss.timestamp).toLocaleTimeString()}</p></div>
                      </div>;
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employee Earnings */}
      {tab === "employee-earnings" && isOwner && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-700/50"><tr>
              <th className="text-left px-4 py-3 text-slate-300">Employee</th>
              <th className="text-left px-4 py-3 text-slate-300">Department</th>
              <th className="text-left px-4 py-3 text-slate-300">Yearly Salary</th>
              <th className="text-left px-4 py-3 text-slate-300">Hours Tracked</th>
              <th className="text-left px-4 py-3 text-slate-300">Hourly Cost</th>
              <th className="text-left px-4 py-3 text-slate-300">Projects</th>
            </tr></thead>
            <tbody>
              {(earningsData || []).map((r: any) => (
                <tr key={r.user.id} className="border-t border-slate-700">
                  <td className="px-4 py-3"><p className="font-medium">{r.user.name}</p><p className="text-xs text-slate-500">{r.user.email}</p></td>
                  <td className="px-4 py-3 text-slate-400">{r.user.department || "—"}</td>
                  <td className="px-4 py-3">{r.yearlySalary ? `$${r.yearlySalary.toLocaleString()}` : <span className="text-slate-500">Not set</span>}</td>
                  <td className="px-4 py-3">{r.totalHours}h</td>
                  <td className="px-4 py-3">{r.effectiveHourlyCost ? `$${r.effectiveHourlyCost}/hr` : "—"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{r.projects.map((p: any) => `${p.name} (${p.hours}h)`).join(", ") || "—"}</td>
                </tr>
              ))}
              {(earningsData || []).length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No data for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* App detail modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelectedApp(null)}>
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div><h2 className="text-xl font-bold">{selectedApp.app}</h2>
                <p className="text-sm text-slate-400">{formatDuration(selectedApp.totalSeconds)} — <span className={selectedApp.category === "productive" ? "text-green-400" : selectedApp.category === "unproductive" ? "text-red-400" : "text-yellow-400"}>{selectedApp.category}</span></p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-1 hover:bg-slate-700 rounded"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-2">
              {selectedApp.details?.map((d: any, i: number) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 bg-slate-900/50 rounded-lg">
                  <div className="mt-0.5">{d.url ? <Globe size={14} className="text-blue-400" /> : <FileText size={14} className="text-slate-500" />}</div>
                  <div className="flex-1 min-w-0"><p className="text-sm truncate" title={d.title}>{d.title}</p>
                    {d.url && <p className="text-xs text-blue-400 truncate">{d.url}</p>}</div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{formatDuration(d.totalSeconds)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Screenshot expanded */}
      {expandedImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setExpandedImg(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setExpandedImg(null)}><X size={28} /></button>
          <img src={expandedImg} alt="" className="max-w-full max-h-full rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
