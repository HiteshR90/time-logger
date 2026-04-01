"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

type ReportType = "activity" | "productivity" | "time-by-project";

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("activity");

  // Mock data for now — real data will come from /reports API
  const activityData = Array.from({ length: 7 }, (_, i) => ({
    date: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i],
    hours: Math.round(Math.random() * 8 * 10) / 10,
    activity: Math.round(Math.random() * 40 + 50),
  }));

  const projectData = [
    { name: "Website Redesign", hours: 24.5 },
    { name: "Mobile App", hours: 18.2 },
    { name: "API Integration", hours: 12.8 },
    { name: "Bug Fixes", hours: 8.3 },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex gap-2">
          {(["activity", "productivity", "time-by-project"] as const).map((t) => (
            <button key={t} onClick={() => setReportType(t)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize ${reportType === t ? "bg-blue-600" : "bg-slate-700"}`}>
              {t.replace(/-/g, " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        {reportType === "activity" && (
          <>
            <h2 className="text-lg font-semibold mb-4">Activity Report</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} name="Hours" />
                <Line type="monotone" dataKey="activity" stroke="#22c55e" strokeWidth={2} name="Activity %" />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}

        {reportType === "productivity" && (
          <>
            <h2 className="text-lg font-semibold mb-4">Productivity Trends</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <Bar dataKey="activity" fill="#3b82f6" radius={4} name="Activity %" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {reportType === "time-by-project" && (
          <>
            <h2 className="text-lg font-semibold mb-4">Time by Project</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={projectData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="name" type="category" width={120} stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                <Bar dataKey="hours" fill="#8b5cf6" radius={4} name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
