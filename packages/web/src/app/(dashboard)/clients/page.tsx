"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Plus, Building2 } from "lucide-react";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch("/clients"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch("/clients", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setShowCreate(false);
      setName("");
      setEmail("");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add Client
        </button>
      </div>

      {showCreate && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name, email: email || null }); }}
            className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Client Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Create</button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">Cancel</button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients?.map((client: any) => (
          <div key={client.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium">{client.name}</h3>
                <p className="text-xs text-slate-400">{client.email || "No email"}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>{client._count?.projects || 0} projects</span>
              <span>{client._count?.invoices || 0} invoices</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
