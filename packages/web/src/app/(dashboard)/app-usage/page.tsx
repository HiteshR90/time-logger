"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = { productive: "#22c55e", neutral: "#eab308", unproductive: "#ef4444" };

export default function AppUsagePage() {
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

  const { data: appData, isLoading } = useQuery({
    queryKey: ["app-usage-report", selectedUser, from, to],
    queryFn: () => apiFetch(
      `/reports/app-usage?from=${new Date(from).toISOString()}&to=${new Date(to).toISOString()}${selectedUser ? `&userId=${selectedUser}` : ""}`
    ),
  });

  const apps = appData || [];
  const categoryTotals = apps.reduce((acc: any, app: any) => {
    const cat = app.category || "neutral";
    acc[cat] = (acc[cat] || 0) + app.totalHours;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((value as number) * 10) / 10,
    color: COLORS[name as keyof typeof COLORS] || "#94a3b8",
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">App Usage</h1>
        <div className="flex gap-3 items-center">
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
            <option value="">All employees</option>
            {users?.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
        </div>
      </div>

      {isLoading ? <p className="text-slate-400">Loading...</p> : apps.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
          <p className="text-slate-400">No app usage data for the selected period.</p>
          <p className="text-slate-500 text-sm mt-2">App usage tracking requires:</p>
          <ul className="text-slate-500 text-sm mt-1 text-left max-w-md mx-auto list-disc list-inside">
            <li>Desktop agent running and tracking time</li>
            <li>On macOS: <strong className="text-slate-400">System Settings → Privacy & Security → Screen Recording</strong> — grant permission to TimeTracker</li>
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Hours by App</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={apps.slice(0, 10)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="app" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <Bar dataKey="totalHours" name="Hours" radius={4}>
                  {apps.slice(0, 10).map((entry: any, i: number) => (
                    <Cell key={i} fill={COLORS[entry.category as keyof typeof COLORS] || "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Productivity Breakdown</h2>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {categoryData.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                      <span className="text-slate-400">{c.name}: {c.value}h</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <p className="text-slate-500 text-center py-12">No category data</p>}
          </div>
        </div>
      )}
    </div>
  );
}
