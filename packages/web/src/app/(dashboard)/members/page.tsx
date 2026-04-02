"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { UserPlus, Shield, ShieldCheck, Pencil, X, Clock, Mail } from "lucide-react";

const ALL_ROLES = ["employee", "manager", "owner"] as const;

export default function MembersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = currentUser?.role === "owner";
  const [showInvite, setShowInvite] = useState(false);

  // Invite form
  const [invEmail, setInvEmail] = useState("");
  const [invName, setInvName] = useState("");
  const [invRole, setInvRole] = useState("employee");
  const [invDept, setInvDept] = useState("");
  const [invError, setInvError] = useState("");

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  const { data: pendingInvites } = useQuery({
    queryKey: ["pending-invites"],
    queryFn: () => apiFetch("/auth/pending-invites"),
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: () => apiFetch("/departments"),
  });

  // Managers only see employees; owners see everyone
  const visibleUsers = users?.filter((u: any) => {
    if (isOwner) return true;
    return u.role === "employee" || u.id === currentUser?.id;
  }) || [];

  // Owner: can edit everyone except themselves
  // Manager: can edit employees only
  const canEdit = (u: any) => {
    if (u.id === currentUser?.id) return false;
    if (isOwner) return true;
    if (currentUser?.role === "manager") return u.role === "employee";
    return false;
  };

  const assignableRoles = isOwner ? ALL_ROLES : (["employee", "manager"] as const);

  const inviteMutation = useMutation({
    mutationFn: (data: any) => apiFetch("/auth/invite", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["pending-invites"] });
      setShowInvite(false);
      setInvEmail(""); setInvName(""); setInvRole("employee"); setInvDept(""); setInvError("");
    },
    onError: (err: any) => setInvError(err.message),
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate({ email: invEmail, name: invName, role: invRole, departmentId: invDept || null });
  };

  function getScreenshotLabel(user: any): string {
    const ms = user.monitoringSettings as any;
    if (!ms) return "Default";
    if (ms.screenshotEnabled === false) return "Disabled";
    if (ms.blurScreenshots) return "Blurred";
    if (ms.screenshotIntervalMin) return `Every ${ms.screenshotIntervalMin} min`;
    return "Default";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      {showInvite && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Invite New Member</h2>
            <button onClick={() => setShowInvite(false)}><X size={18} className="text-slate-400" /></button>
          </div>
          <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input type="email" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Name</label>
              <input value={invName} onChange={(e) => setInvName(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Role</label>
              <div className="flex gap-4">
                {assignableRoles.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="radio" name="invRole" value={r} checked={invRole === r}
                      onChange={(e) => setInvRole(e.target.value)} className="w-4 h-4" />
                    <span className="capitalize">{r}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Department</label>
              <select value={invDept} onChange={(e) => setInvDept(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="">No department</option>
                {departments?.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={inviteMutation.isPending}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50">
                {inviteMutation.isPending ? "Inviting..." : "Send Invite"}
              </button>
            </div>
            {invError && <p className="text-red-400 text-sm col-span-2">{invError}</p>}
          </form>
        </div>
      )}

      {/* Pending Invites */}
      {pendingInvites?.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Clock size={14} /> Pending Invitations ({pendingInvites.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingInvites.map((inv: any) => (
              <div key={inv.id} className="bg-slate-800/50 rounded-lg border border-dashed border-slate-600 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={14} className="text-yellow-400" />
                  <span className="font-medium text-sm">{inv.name}</span>
                </div>
                <p className="text-xs text-slate-400">{inv.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-900/50 text-yellow-400">Pending</span>
                  <span className="text-xs text-slate-500 capitalize">{inv.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Role</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Department</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Screenshot</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((user: any) => (
              <tr key={user.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3 text-slate-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1">
                    {user.role === "owner" ? <ShieldCheck size={14} className="text-yellow-400" /> : <Shield size={14} className="text-slate-500" />}
                    <span className="capitalize">{user.role}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400">{user.department?.name || "—"}</td>
                <td className="px-4 py-3 text-slate-400">{getScreenshotLabel(user)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${user.isActive ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {canEdit(user) && (
                    <Link href={`/members/${user.id}`}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-slate-700 rounded text-xs text-blue-400 hover:text-blue-300">
                      <Pencil size={12} /> Edit
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
