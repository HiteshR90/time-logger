"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@time-tracker/shared";

export default function TimesheetsPage() {
  const { user, hasPermission } = useAuth();
  const canApprove = hasPermission("timesheets.approve");
  const [selectedUser, setSelectedUser] = useState("");
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  const { data } = useQuery({
    queryKey: ["timesheets", selectedUser, from, to],
    queryFn: () => apiFetch(`/timesheets?limit=200${selectedUser ? `&userId=${selectedUser}` : ""}&from=${from}T00:00:00Z`),
  });

  const entries = data?.entries || [];

  // Aggregate: group by employee + project + date
  type AggKey = string;
  const aggregated: Record<AggKey, {
    employee: string; project: string; date: string; totalSeconds: number; entries: number; userId: string;
  }> = {};

  for (const entry of entries) {
    const date = new Date(entry.startTime).toLocaleDateString();
    const key = `${entry.user?.name}|${entry.project?.name}|${date}`;
    if (!aggregated[key]) {
      aggregated[key] = { employee: entry.user?.name, project: entry.project?.name, date, totalSeconds: 0, entries: 0, userId: entry.userId };
    }
    aggregated[key].totalSeconds += entry.durationSec;
    aggregated[key].entries += 1;
  }

  const rows = Object.values(aggregated).sort((a, b) => {
    const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (dateCompare !== 0) return dateCompare;
    return a.employee.localeCompare(b.employee);
  });

  // Summary cards
  const totalSeconds = entries.reduce((s: number, e: any) => s + e.durationSec, 0);
  const uniqueEmployees = new Set(entries.map((e: any) => e.userId)).size;
  const uniqueProjects = new Set(entries.map((e: any) => e.projectId)).size;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Timesheets</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4 items-center flex-wrap">
        {canApprove && (
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

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-xs text-slate-400">Total Time</p>
          <p className="text-xl font-bold text-blue-400">{formatDuration(totalSeconds)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-xs text-slate-400">Employees</p>
          <p className="text-xl font-bold">{uniqueEmployees}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 text-center">
          <p className="text-xs text-slate-400">Projects</p>
          <p className="text-xl font-bold">{uniqueProjects}</p>
        </div>
      </div>

      {/* Aggregated table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Project</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Date</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Total Time</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Entries</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-700">
                <td className="px-4 py-3 font-medium">{row.employee}</td>
                <td className="px-4 py-3 text-slate-400">{row.project}</td>
                <td className="px-4 py-3 text-slate-400">{row.date}</td>
                <td className="px-4 py-3 font-medium text-blue-400">{formatDuration(row.totalSeconds)}</td>
                <td className="px-4 py-3 text-slate-500">{row.entries} syncs</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No time entries for this period</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
