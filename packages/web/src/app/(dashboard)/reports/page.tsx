"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type ReportType = "activity" | "time-by-project" | "app-usage";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("activity");
  const [selectedUser, setSelectedUser] = useState("");
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  const dateParams = `from=${new Date(from).toISOString()}&to=${new Date(to).toISOString()}`;
  const userParam = selectedUser ? `&userId=${selectedUser}` : "";

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["report-activity", selectedUser, from, to],
    queryFn: () => apiFetch(`/reports/activity?${dateParams}${userParam}`),
    enabled: reportType === "activity",
  });

  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ["report-project", from, to],
    queryFn: () => apiFetch(`/reports/time-by-project?${dateParams}`),
    enabled: reportType === "time-by-project",
  });

  const { data: appUsageData, isLoading: appLoading } = useQuery({
    queryKey: ["report-app", selectedUser, from, to],
    queryFn: () => apiFetch(`/reports/app-usage?${dateParams}${userParam}`),
    enabled: reportType === "app-usage",
  });

  const isLoading = activityLoading || projectLoading || appLoading;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          {(["activity", "time-by-project", "app-usage"] as const).map((t) => (
            <button key={t} onClick={() => setReportType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${reportType === t ? "bg-blue-600" : "bg-slate-700"}`}>
              {t.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 items-center">
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
          <option value="">All employees</option>
          {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        <span className="text-slate-400">to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        {isLoading && <p className="text-slate-400 text-center py-8">Loading report...</p>}

        {reportType === "activity" && !activityLoading && (
          <>
            <h2 className="text-lg font-semibold mb-4">Activity by Employee</h2>
            {(activityData || []).length === 0 ? (
              <p className="text-slate-500 text-center py-12">No activity data for this period. Data appears when the desktop agent tracks time.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="user.name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                    <Bar dataKey="totalHours" fill="#3b82f6" radius={4} name="Hours" />
                    <Bar dataKey="avgActivity" fill="#22c55e" radius={4} name="Avg Activity %" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="text-left px-4 py-2 text-slate-300">Employee</th>
                        <th className="text-left px-4 py-2 text-slate-300">Hours</th>
                        <th className="text-left px-4 py-2 text-slate-300">Avg Activity</th>
                        <th className="text-left px-4 py-2 text-slate-300">Entries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityData.map((r: any) => (
                        <tr key={r.user.id} className="border-t border-slate-700">
                          <td className="px-4 py-2">{r.user.name}</td>
                          <td className="px-4 py-2">{r.totalHours}h</td>
                          <td className="px-4 py-2">{r.avgActivity}%</td>
                          <td className="px-4 py-2">{r.entries}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {reportType === "time-by-project" && !projectLoading && (
          <>
            <h2 className="text-lg font-semibold mb-4">Time by Project</h2>
            {(projectData || []).length === 0 ? (
              <p className="text-slate-500 text-center py-12">No project time data for this period.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={projectData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="project.name" type="category" width={120} stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                    <Bar dataKey="totalHours" fill="#8b5cf6" radius={4} name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 overflow-hidden rounded-lg border border-slate-700">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-700/50">
                      <tr>
                        <th className="text-left px-4 py-2 text-slate-300">Project</th>
                        <th className="text-left px-4 py-2 text-slate-300">Hours</th>
                        <th className="text-left px-4 py-2 text-slate-300">Entries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projectData.map((r: any) => (
                        <tr key={r.project.id} className="border-t border-slate-700">
                          <td className="px-4 py-2">{r.project.name}</td>
                          <td className="px-4 py-2">{r.totalHours}h</td>
                          <td className="px-4 py-2">{r.entries}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {reportType === "app-usage" && !appLoading && (
          <>
            <h2 className="text-lg font-semibold mb-4">App Usage</h2>
            {(appUsageData || []).length === 0 ? (
              <p className="text-slate-500 text-center py-12">No app usage data for this period.</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={(appUsageData || []).slice(0, 15)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" stroke="#94a3b8" />
                    <YAxis dataKey="app" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                    <Bar dataKey="totalHours" fill="#f59e0b" radius={4} name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
