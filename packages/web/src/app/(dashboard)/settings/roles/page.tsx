"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { PERMISSIONS, PERMISSION_CATEGORIES } from "@time-tracker/shared";
import { Plus, Trash2, Shield } from "lucide-react";
import Link from "next/link";

export default function RolesPage() {
  const queryClient = useQueryClient();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => apiFetch("/roles"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch("/roles", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setShowCreate(false);
      setNewRoleName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiFetch(`/roles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/roles/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setSelectedRoleId(null);
    },
  });

  const selectedRole = roles?.find((r: any) => r.id === selectedRoleId);

  const togglePermission = (roleId: string, permKey: string, currentValue: boolean) => {
    const role = roles?.find((r: any) => r.id === roleId);
    if (!role || (role.isSystem && role.name === "owner")) return;
    const perms = { ...(role.permissions as Record<string, boolean>), [permKey]: !currentValue };
    updateMutation.mutate({ id: roleId, data: { permissions: perms } });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <div className="flex gap-2">
          <Link href="/settings" className="px-3 py-1.5 bg-slate-700 rounded-lg text-sm hover:bg-slate-600">General Settings</Link>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
            <Plus size={14} /> New Role
          </button>
        </div>
      </div>
      <p className="text-sm text-slate-400 mb-6">Configure what each role can access. Owner always has full access.</p>

      {showCreate && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name: newRoleName }); }}
            className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">Role Name</label>
              <input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} required placeholder="e.g. Team Lead"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">Cancel</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Role list */}
        <div className="space-y-2">
          {roles?.map((role: any) => (
            <button key={role.id} onClick={() => setSelectedRoleId(role.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left text-sm transition-colors ${
                selectedRoleId === role.id ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-slate-800 border-slate-700 hover:border-slate-600"
              }`}>
              <div className="flex items-center gap-2">
                <Shield size={16} className={role.isSystem ? "text-yellow-400" : "text-slate-500"} />
                <div>
                  <p className="font-medium capitalize">{role.name}</p>
                  <p className="text-xs text-slate-500">{role._count?.users || 0} members{role.isSystem ? " • System" : ""}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Permission matrix */}
        <div className="lg:col-span-3">
          {selectedRole ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold capitalize">{selectedRole.name} Permissions</h2>
                  <p className="text-xs text-slate-400">
                    {selectedRole.isSystem && selectedRole.name === "owner" ? "Owner has all permissions (cannot be modified)" :
                     selectedRole.isSystem ? "System role — permissions can be customized" : "Custom role"}
                  </p>
                </div>
                {!selectedRole.isSystem && (
                  <button onClick={() => { if (confirm(`Delete "${selectedRole.name}"? Users will be reassigned to Employee.`)) deleteMutation.mutate(selectedRole.id); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/50 rounded-lg text-xs">
                    <Trash2 size={12} /> Delete Role
                  </button>
                )}
              </div>

              {Object.entries(PERMISSION_CATEGORIES).map(([category, permKeys]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-slate-300 mb-3">{category}</h3>
                  <div className="space-y-1">
                    {permKeys.map((key) => {
                      const perms = selectedRole.permissions as Record<string, boolean>;
                      const isOwner = selectedRole.isSystem && selectedRole.name === "owner";
                      const enabled = isOwner ? true : perms[key] === true;
                      return (
                        <div key={key} className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-lg">
                          <div>
                            <p className="text-sm">{PERMISSIONS[key as keyof typeof PERMISSIONS]}</p>
                            <p className="text-xs text-slate-600">{key}</p>
                          </div>
                          <button
                            onClick={() => !isOwner && togglePermission(selectedRole.id, key, enabled)}
                            disabled={isOwner}
                            className={`w-10 h-5 rounded-full transition-colors relative ${
                              enabled ? "bg-blue-600" : "bg-slate-600"
                            } ${isOwner ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                              enabled ? "translate-x-5" : "translate-x-0.5"
                            }`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
              <Shield className="mx-auto text-slate-600 mb-3" size={40} />
              <p className="text-slate-400">Select a role to view and edit its permissions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
