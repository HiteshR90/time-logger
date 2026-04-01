"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = { productive: "#22c55e", neutral: "#eab308", unproductive: "#ef4444" };

export default function AppUsagePage() {
  // Mock aggregated data (real data will come from /reports/app-usage API)
  const appData = [
    { name: "VS Code", hours: 4.2, category: "productive" },
    { name: "Chrome", hours: 2.8, category: "neutral" },
    { name: "Slack", hours: 1.5, category: "productive" },
    { name: "Figma", hours: 1.2, category: "productive" },
    { name: "YouTube", hours: 0.5, category: "unproductive" },
    { name: "Terminal", hours: 0.8, category: "productive" },
  ];

  const categoryData = [
    { name: "Productive", value: 7.7, color: COLORS.productive },
    { name: "Neutral", value: 2.8, color: COLORS.neutral },
    { name: "Unproductive", value: 0.5, color: COLORS.unproductive },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">App Usage</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Hours by App</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
              <Bar dataKey="hours" radius={4}>
                {appData.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.category as keyof typeof COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Productivity Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ background: c.color }} />
                <span className="text-slate-400">{c.name}: {c.value}h</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
