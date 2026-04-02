"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Plus, Users, Settings, Save } from "lucide-react";

const SCREENSHOT_OPTIONS = [
  { value: "", label: "Use org default" },
  { value: "1", label: "Every 1 min" },
  { value: "2", label: "Every 2 min" },
  { value: "5", label: "Every 5 min" },
  { value: "10", label: "Every 10 min" },
  { value: "-1", label: "Random" },
  { value: "disabled", label: "Disabled (no screenshots)" },
];

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editScreenshot, setEditScreenshot] = useState("");

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiFetch("/departments"),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch("/departments", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setShowCreate(false);
      setName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiFetch(`/departments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setEditingDeptId(null);
    },
  });

  function startEditSettings(dept: any) {
    setEditingDeptId(dept.id);
    const ms = dept.monitoringSettings as any;
    if (ms?.screenshotEnabled === false) setEditScreenshot("disabled");
    else if (ms?.screenshotIntervalMin) setEditScreenshot(String(ms.screenshotIntervalMin));
    else setEditScreenshot("");
  }

  function saveSettings(deptId: string) {
    const monitoringSettings: any = {};
    if (editScreenshot === "disabled") {
      monitoringSettings.screenshotEnabled = false;
    } else if (editScreenshot) {
      monitoringSettings.screenshotEnabled = true;
      monitoringSettings.screenshotIntervalMin = Number(editScreenshot);
    }
    updateMutation.mutate({
      id: deptId,
      data: { monitoringSettings: Object.keys(monitoringSettings).length > 0 ? monitoringSettings : null },
    });
  }

  function getScreenshotLabel(dept: any): string {
    const ms = dept.monitoringSettings as any;
    if (!ms) return "Org default";
    if (ms.screenshotEnabled === false) return "Disabled";
    if (ms.screenshotIntervalMin) return `Every ${ms.screenshotIntervalMin} min`;
    return "Org default";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Teams & Departments</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name }); }}
            className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Department Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">Cancel</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments?.map((dept: any) => {
          const members = users?.filter((u: any) => u.departmentId === dept.id) || [];
          const isEditing = editingDeptId === dept.id;
          return (
            <div key={dept.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{dept.name}</h3>
                    <p className="text-xs text-slate-400">{dept._count?.users || members.length} members</p>
                  </div>
                </div>
                <button onClick={() => isEditing ? setEditingDeptId(null) : startEditSettings(dept)}
                  className="p-1.5 hover:bg-slate-700 rounded" title="Monitoring settings">
                  <Settings size={16} className="text-slate-400" />
                </button>
              </div>

              {/* Monitoring settings */}
              <div className="mb-3 px-3 py-2 bg-slate-900/50 rounded-lg">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <select value={editScreenshot} onChange={(e) => setEditScreenshot(e.target.value)}
                      className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs">
                      {SCREENSHOT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <button onClick={() => saveSettings(dept.id)}
                      className="p-1 bg-blue-600 hover:bg-blue-700 rounded" title="Save">
                      <Save size={14} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Screenshots: <span className="text-slate-300">{getScreenshotLabel(dept)}</span>
                  </p>
                )}
              </div>

              {/* Members */}
              <div className="space-y-2">
                {members.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs">
                      {m.name?.[0]}
                    </div>
                    {m.name}
                  </div>
                ))}
                {members.length === 0 && (
                  <p className="text-xs text-slate-500">No members assigned</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
