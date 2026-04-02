"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { ArrowLeft, User, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [hourlyRate, setHourlyRate] = useState("50");
  const [editClientId, setEditClientId] = useState<string | null>(null);
  const [editingRateUserId, setEditingRateUserId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => apiFetch(`/projects/${id}`),
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch("/clients"),
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/projects/${id}/members`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setShowAddMember(false);
      setSelectedUserId("");
      setHourlyRate("50");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => apiFetch(`/projects/${id}/members/${userId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", id] }),
  });

  const updateRateMutation = useMutation({
    mutationFn: (data: { userId: string; hourlyRate: number }) =>
      apiFetch(`/projects/${id}/members`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      setEditingRateUserId(null);
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => apiFetch(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", id] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditClientId(null);
    },
  });

  if (isLoading) return <div className="text-slate-400">Loading...</div>;
  if (!project) return <div className="text-red-400">Project not found</div>;

  const existingMemberIds = new Set(project.members?.map((m: any) => m.userId) || []);
  const availableUsers = users?.filter((u: any) => !existingMemberIds.has(u.id)) || [];

  return (
    <div>
      <Link href="/projects" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        <div className="flex gap-4 text-sm text-slate-400 items-center">
          <span className="flex items-center gap-2">
            Client:
            {editClientId !== null ? (
              <select value={editClientId} onChange={(e) => {
                updateProjectMutation.mutate({ clientId: e.target.value || null });
              }} className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs">
                <option value="">None</option>
                {clients?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            ) : (
              <>
                <span className="text-slate-200">{project.client?.name || "None"}</span>
                <button onClick={() => setEditClientId(project.clientId || "")}
                  className="text-blue-400 hover:underline text-xs">change</button>
              </>
            )}
          </span>
          <span>Budget: {project.budgetType === "fixed" ? `$${project.budgetAmount?.toLocaleString()}` : "Hourly"}</span>
          <span>Currency: {project.currency}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Team Members</h2>
        <button onClick={() => setShowAddMember(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">
          <Plus size={14} /> Add Member
        </button>
      </div>

      {showAddMember && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            addMemberMutation.mutate({ userId: selectedUserId, hourlyRate: project.budgetType === "hourly" ? Number(hourlyRate) : 0 });
          }} className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Employee</label>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="">Select employee...</option>
                {availableUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            {project.budgetType === "hourly" && (
              <div className="w-32">
                <label className="block text-xs text-slate-400 mb-1">Rate ($/hr)</label>
                <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} min="0" step="0.01"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
            )}
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Add</button>
            <button type="button" onClick={() => setShowAddMember(false)} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">Cancel</button>
          </form>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Email</th>
              {project.budgetType === "hourly" && <th className="text-left px-4 py-3 font-medium text-slate-300">Hourly Rate</th>}
              <th className="text-left px-4 py-3 font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {project.members?.map((m: any) => (
              <tr key={m.userId} className="border-t border-slate-700">
                <td className="px-4 py-3 flex items-center gap-2">
                  <User size={16} className="text-slate-500" />
                  {m.user?.name}
                </td>
                <td className="px-4 py-3 text-slate-400">{m.user?.email}</td>
                {project.budgetType === "hourly" && (
                  <td className="px-4 py-3">
                    {editingRateUserId === m.userId ? (
                      <form onSubmit={(e) => { e.preventDefault(); updateRateMutation.mutate({ userId: m.userId, hourlyRate: Number(editRate) }); }}
                        className="flex items-center gap-1">
                        <span className="text-slate-500">$</span>
                        <input type="number" value={editRate} onChange={(e) => setEditRate(e.target.value)}
                          min="0" step="0.01" autoFocus
                          className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-sm" />
                        <button type="submit" className="px-2 py-1 bg-blue-600 rounded text-xs">Save</button>
                        <button type="button" onClick={() => setEditingRateUserId(null)} className="px-2 py-1 bg-slate-600 rounded text-xs">Cancel</button>
                      </form>
                    ) : (
                      <button onClick={() => { setEditingRateUserId(m.userId); setEditRate(String(m.hourlyRate)); }}
                        className="hover:bg-slate-700 px-2 py-1 rounded text-sm" title="Click to edit rate">
                        ${m.hourlyRate}/hr
                      </button>
                    )}
                  </td>
                )}
                <td className="px-4 py-3">
                  <button onClick={() => removeMemberMutation.mutate(m.userId)}
                    className="p-1 hover:bg-red-900/30 rounded" title="Remove">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </td>
              </tr>
            ))}
            {!project.members?.length && (
              <tr><td colSpan={project.budgetType === "hourly" ? 4 : 3} className="px-4 py-8 text-center text-slate-500">No members assigned. Click &quot;Add Member&quot; above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
