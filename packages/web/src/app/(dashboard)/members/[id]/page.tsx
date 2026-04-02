"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, UserX, UserCheck, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

const SCREENSHOT_OPTIONS = [
  { value: "", label: "Use org/department default" },
  { value: "1", label: "Every 1 minute" },
  { value: "2", label: "Every 2 minutes" },
  { value: "5", label: "Every 5 minutes" },
  { value: "10", label: "Every 10 minutes" },
  { value: "-1", label: "Random interval" },
  { value: "disabled", label: "Disabled (no screenshots)" },
  { value: "blurred", label: "Blurred (privacy mode)" },
];

const ALL_ROLES = ["employee", "manager", "owner"];

export default function MemberEditPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const isOwner = currentUser?.role === "owner";

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [screenshotSetting, setScreenshotSetting] = useState("");
  const [idleTimeout, setIdleTimeout] = useState("");
  const [yearlySalary, setYearlySalary] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saved, setSaved] = useState(false);

  // Project assignment
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectRate, setProjectRate] = useState("50");

  const { data: member, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => apiFetch(`/users/${id}`),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiFetch("/departments"),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch("/projects"),
  });

  const { data: org } = useQuery({
    queryKey: ["org"],
    queryFn: () => apiFetch("/organizations/me"),
  });

  const { data: resolvedSettings } = useQuery({
    queryKey: ["user-monitoring", id],
    queryFn: () => apiFetch(`/users/${id}/monitoring-settings`),
  });

  const orgCurrency = (org?.settings as any)?.defaultCurrency || "USD";

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRole(member.role);
      setDepartmentId(member.departmentId || "");
      setIsActive(member.isActive);
      setYearlySalary(member.yearlySalary ? String(member.yearlySalary) : "");

      const ms = member.monitoringSettings as any;
      if (ms?.screenshotEnabled === false) setScreenshotSetting("disabled");
      else if (ms?.blurScreenshots) setScreenshotSetting("blurred");
      else if (ms?.screenshotIntervalMin) setScreenshotSetting(String(ms.screenshotIntervalMin));
      else setScreenshotSetting("");
      setIdleTimeout(ms?.idleTimeoutMin ? String(ms.idleTimeoutMin) : "");
    }
  }, [member]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const addToProjectMutation = useMutation({
    mutationFn: (data: { projectId: string; userId: string; hourlyRate: number }) =>
      apiFetch(`/projects/${data.projectId}/members`, { method: "POST", body: JSON.stringify({ userId: data.userId, hourlyRate: data.hourlyRate }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      setShowAddProject(false);
      setSelectedProjectId("");
      setProjectRate("50");
    },
  });

  const removeFromProjectMutation = useMutation({
    mutationFn: (projectId: string) =>
      apiFetch(`/projects/${projectId}/members/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", id] }),
  });

  const handleSave = () => {
    const monitoringSettings: any = {};
    if (screenshotSetting === "disabled") monitoringSettings.screenshotEnabled = false;
    else if (screenshotSetting === "blurred") { monitoringSettings.screenshotEnabled = true; monitoringSettings.blurScreenshots = true; }
    else if (screenshotSetting) { monitoringSettings.screenshotEnabled = true; monitoringSettings.blurScreenshots = false; monitoringSettings.screenshotIntervalMin = Number(screenshotSetting); }
    if (idleTimeout) monitoringSettings.idleTimeoutMin = Number(idleTimeout);

    const updateData: any = {
      name, role,
      departmentId: departmentId || null,
      isActive,
      monitoringSettings: Object.keys(monitoringSettings).length > 0 ? monitoringSettings : null,
    };
    if (isOwner) updateData.yearlySalary = yearlySalary ? Number(yearlySalary) : null;
    saveMutation.mutate(updateData);
  };

  const assignableRoles = isOwner ? ALL_ROLES : ["employee", "manager"];
  const assignedProjectIds = new Set(member?.projectMembers?.map((pm: any) => pm.project.id) || []);
  const availableProjects = projects?.filter((p: any) => !assignedProjectIds.has(p.id)) || [];

  if (isLoading) return <div className="text-slate-400 p-6">Loading...</div>;
  if (!member) return <div className="text-red-400 p-6">Member not found</div>;

  return (
    <div>
      <Link href="/members" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
        <ArrowLeft size={16} /> Back to Members
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Edit Member — {member.name}</h1>

        {/* Basic Info */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input value={member.email} disabled
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-slate-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Role</label>
              <div className="flex gap-4">
                {assignableRoles.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="role" value={r} checked={role === r}
                      onChange={(e) => setRole(e.target.value)} className="w-4 h-4" />
                    <span className="capitalize">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Department</label>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="">No department</option>
                {departments?.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Compensation — owner only */}
        {isOwner && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Compensation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Yearly Salary ({orgCurrency})</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                    {orgCurrency === "USD" ? "$" : orgCurrency === "EUR" ? "€" : orgCurrency === "GBP" ? "£" : orgCurrency === "INR" ? "₹" : orgCurrency === "AED" ? "د.إ" : orgCurrency}
                  </span>
                  <input type="number" value={yearlySalary} onChange={(e) => setYearlySalary(e.target.value)}
                    placeholder="Not set" min="0" step="1000"
                    className="w-full pl-8 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex items-end">
                <p className="text-xs text-slate-500 pb-2">Currency ({orgCurrency}) is set in organization Settings. Only visible to owners.</p>
              </div>
            </div>
          </div>
        )}

        {/* Project Assignments */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Project Assignments</h2>
            <button onClick={() => setShowAddProject(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs">
              <Plus size={12} /> Assign to Project
            </button>
          </div>

          {showAddProject && (
            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!selectedProjectId) return;
                const proj = projects?.find((p: any) => p.id === selectedProjectId);
                addToProjectMutation.mutate({
                  projectId: selectedProjectId,
                  userId: id,
                  hourlyRate: proj?.budgetType === "hourly" ? Number(projectRate) : 0,
                });
              }} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs text-slate-400 mb-1">Project</label>
                  <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                    <option value="">Select project...</option>
                    {availableProjects.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.budgetType})</option>
                    ))}
                  </select>
                </div>
                {selectedProjectId && projects?.find((p: any) => p.id === selectedProjectId)?.budgetType === "hourly" && (
                  <div className="w-28">
                    <label className="block text-xs text-slate-400 mb-1">Rate/hr</label>
                    <input type="number" value={projectRate} onChange={(e) => setProjectRate(e.target.value)} min="0"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                  </div>
                )}
                <button type="submit" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs">Add</button>
                <button type="button" onClick={() => setShowAddProject(false)} className="px-3 py-2 bg-slate-700 rounded-lg text-xs">Cancel</button>
              </form>
            </div>
          )}

          <div className="space-y-2">
            {member.projectMembers?.length > 0 ? member.projectMembers.map((pm: any) => {
              const proj = projects?.find((p: any) => p.id === pm.project.id);
              return (
                <div key={pm.project.id} className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <a href={`/projects/${pm.project.id}`}
                      className="text-sm text-blue-400 hover:underline">{pm.project.name}</a>
                    {pm.hourlyRate > 0 && <span className="text-xs text-slate-400">${pm.hourlyRate}/hr</span>}
                    <span className="text-xs text-slate-600">{proj?.budgetType || ""}</span>
                    {proj?.client?.name && <span className="text-xs text-slate-500">• {proj.client.name}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`/projects/${pm.project.id}`}
                      className="p-1 hover:bg-slate-700 rounded text-xs text-slate-400" title="Edit project settings">
                      Settings
                    </a>
                    <button onClick={() => removeFromProjectMutation.mutate(pm.project.id)}
                      className="p-1 hover:bg-red-900/30 rounded" title="Remove from project">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <p className="text-xs text-slate-500 text-center py-4">Not assigned to any projects</p>
            )}
          </div>
          {availableProjects.length === 0 && !showAddProject && member.projectMembers?.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">Assigned to all projects</p>
          )}
        </div>

        {/* Monitoring Settings */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Monitoring Settings</h2>
          <p className="text-xs text-slate-500 mb-4">Override organization/department defaults for this specific member.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Screenshot Interval</label>
              <select value={screenshotSetting} onChange={(e) => setScreenshotSetting(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                {SCREENSHOT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Idle Timeout (minutes)</label>
              <input type="number" value={idleTimeout} onChange={(e) => setIdleTimeout(e.target.value)}
                placeholder="Use default" min="1" max="60"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
          </div>
          {resolvedSettings && (
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500 mb-2">Effective settings (after cascade):</p>
              <div className="flex gap-4 text-xs text-slate-400">
                <span>Screenshots: <strong className="text-slate-300">
                  {!resolvedSettings.screenshotEnabled ? "Disabled" :
                   resolvedSettings.blurScreenshots ? "Blurred" :
                   `Every ${resolvedSettings.screenshotIntervalMin} min`}
                </strong></span>
                <span>Idle: <strong className="text-slate-300">{resolvedSettings.idleTimeoutMin} min</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Account Status */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Account Status</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">{isActive ? "Account is active" : "Account is deactivated"}</p>
              <p className="text-xs text-slate-500 mt-1">
                {isActive ? "User can log in and track time." : "User cannot log in. Existing data is preserved."}
              </p>
            </div>
            <button onClick={() => setIsActive(!isActive)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                isActive ? "bg-red-900/30 text-red-400 hover:bg-red-900/50" : "bg-green-900/30 text-green-400 hover:bg-green-900/50"
              }`}>
              {isActive ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50">
          <Save size={16} />
          {saveMutation.isPending ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
