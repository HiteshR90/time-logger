"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import { useParams } from "next/navigation";
import { ArrowLeft, Save, UserX, UserCheck } from "lucide-react";
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

  const { data: member, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => apiFetch(`/users/${id}`),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiFetch("/departments"),
  });

  const { data: resolvedSettings } = useQuery({
    queryKey: ["user-monitoring", id],
    queryFn: () => apiFetch(`/users/${id}/monitoring-settings`),
  });

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
      queryClient.invalidateQueries({ queryKey: ["user-monitoring", id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    const monitoringSettings: any = {};

    if (screenshotSetting === "disabled") {
      monitoringSettings.screenshotEnabled = false;
    } else if (screenshotSetting === "blurred") {
      monitoringSettings.screenshotEnabled = true;
      monitoringSettings.blurScreenshots = true;
    } else if (screenshotSetting) {
      monitoringSettings.screenshotEnabled = true;
      monitoringSettings.blurScreenshots = false;
      monitoringSettings.screenshotIntervalMin = Number(screenshotSetting);
    }

    if (idleTimeout) {
      monitoringSettings.idleTimeoutMin = Number(idleTimeout);
    }

    const updateData: any = {
      name,
      role,
      departmentId: departmentId || null,
      isActive,
      monitoringSettings: Object.keys(monitoringSettings).length > 0 ? monitoringSettings : null,
    };
    if (isOwner) {
      updateData.yearlySalary = yearlySalary ? Number(yearlySalary) : null;
    }
    saveMutation.mutate(updateData);
  };

  const assignableRoles = isOwner ? ALL_ROLES : ["employee", "manager"];

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
                <label className="block text-sm text-slate-400 mb-1">Yearly Salary</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                  <input type="number" value={yearlySalary} onChange={(e) => setYearlySalary(e.target.value)}
                    placeholder="Not set" min="0" step="1000"
                    className="w-full pl-7 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex items-end">
                <p className="text-xs text-slate-500 pb-2">Only visible to organization owners. Not shown to managers or employees.</p>
              </div>
            </div>
          </div>
        )}

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

          {/* Resolved settings */}
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

        {/* Projects */}
        {member.projectMembers?.length > 0 && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Assigned Projects</h2>
            <div className="space-y-2">
              {member.projectMembers.map((pm: any) => (
                <div key={pm.project.id} className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-lg">
                  <span className="text-sm">{pm.project.name}</span>
                  <span className="text-xs text-slate-400">${pm.hourlyRate}/hr</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
