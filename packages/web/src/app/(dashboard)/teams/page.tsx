"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Plus, Users } from "lucide-react";

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

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
          return (
            <div key={dept.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="font-medium">{dept.name}</h3>
                  <p className="text-xs text-slate-400">{dept._count?.users || members.length} members</p>
                </div>
              </div>
              <div className="space-y-2">
                {members.map((m: any) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs">
                      {m.name?.[0]}
                    </div>
                    {m.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
