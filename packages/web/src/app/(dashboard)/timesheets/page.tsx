"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { formatDuration } from "@time-tracker/shared";
import { Check, X } from "lucide-react";

export default function TimesheetsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [view, setView] = useState<"daily" | "weekly">("daily");
  const isManager = user?.role === "owner" || user?.role === "manager";

  const { data } = useQuery({
    queryKey: ["timesheets", view],
    queryFn: () => apiFetch("/timesheets?limit=50"),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/timesheets/${id}/approve`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timesheets"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/timesheets/${id}/reject`, { method: "PATCH" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timesheets"] }),
  });

  const entries = data?.entries || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Timesheets</h1>
        <div className="flex gap-2">
          <button onClick={() => setView("daily")}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === "daily" ? "bg-blue-600" : "bg-slate-700"}`}>
            Daily
          </button>
          <button onClick={() => setView("weekly")}
            className={`px-3 py-1.5 rounded-lg text-sm ${view === "weekly" ? "bg-blue-600" : "bg-slate-700"}`}>
            Weekly
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              {isManager && <th className="text-left px-4 py-3 font-medium text-slate-300">Employee</th>}
              <th className="text-left px-4 py-3 font-medium text-slate-300">Project</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Date</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Duration</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Status</th>
              {isManager && <th className="text-left px-4 py-3 font-medium text-slate-300">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {entries.map((entry: any) => (
              <tr key={entry.id} className="border-t border-slate-700">
                {isManager && <td className="px-4 py-3">{entry.user?.name}</td>}
                <td className="px-4 py-3">{entry.project?.name}</td>
                <td className="px-4 py-3 text-slate-400">{new Date(entry.startTime).toLocaleDateString()}</td>
                <td className="px-4 py-3">{formatDuration(entry.durationSec)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    entry.approval === "approved" ? "bg-green-900/50 text-green-400" :
                    entry.approval === "rejected" ? "bg-red-900/50 text-red-400" :
                    "bg-yellow-900/50 text-yellow-400"
                  }`}>
                    {entry.approval}
                  </span>
                </td>
                {isManager && (
                  <td className="px-4 py-3">
                    {entry.approval === "pending" && (
                      <div className="flex gap-1">
                        <button onClick={() => approveMutation.mutate(entry.id)}
                          className="p-1 hover:bg-green-900/30 rounded" title="Approve">
                          <Check size={16} className="text-green-400" />
                        </button>
                        <button onClick={() => rejectMutation.mutate(entry.id)}
                          className="p-1 hover:bg-red-900/30 rounded" title="Reject">
                          <X size={16} className="text-red-400" />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {entries.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No time entries yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
