"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { Plus, Building2, Link as LinkIcon } from "lucide-react";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [linkingClientId, setLinkingClientId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch("/clients"),
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch("/projects"),
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

  const linkProjectMutation = useMutation({
    mutationFn: ({ projectId, clientId }: { projectId: string; clientId: string }) =>
      apiFetch(`/projects/${projectId}`, { method: "PATCH", body: JSON.stringify({ clientId }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setLinkingClientId(null);
      setSelectedProjectId("");
    },
  });

  // Projects not assigned to any client
  const unlinkedProjects = projects?.filter((p: any) => !p.clientId) || [];

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients?.map((client: any) => {
          const clientProjects = projects?.filter((p: any) => p.clientId === client.id) || [];
          const isLinking = linkingClientId === client.id;

          return (
            <div key={client.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <Building2 size={20} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium">{client.name}</h3>
                    <p className="text-xs text-slate-400">{client.email || "No email"}</p>
                  </div>
                </div>
                <button onClick={() => setLinkingClientId(isLinking ? null : client.id)}
                  className="p-1.5 hover:bg-slate-700 rounded text-slate-400" title="Link project">
                  <LinkIcon size={16} />
                </button>
              </div>

              {/* Link project form */}
              {isLinking && unlinkedProjects.length > 0 && (
                <div className="mb-3 flex gap-2">
                  <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs">
                    <option value="">Select project to link...</option>
                    {unlinkedProjects.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button onClick={() => {
                    if (selectedProjectId) linkProjectMutation.mutate({ projectId: selectedProjectId, clientId: client.id });
                  }} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs">Link</button>
                </div>
              )}
              {isLinking && unlinkedProjects.length === 0 && (
                <p className="mb-3 text-xs text-slate-500">All projects are already linked to clients.</p>
              )}

              {/* Linked projects */}
              <div className="space-y-1">
                <p className="text-xs text-slate-500 mb-1">{clientProjects.length} project{clientProjects.length !== 1 ? "s" : ""}</p>
                {clientProjects.map((p: any) => (
                  <div key={p.id} className="flex items-center gap-2 text-sm text-slate-300 px-2 py-1 bg-slate-900/50 rounded">
                    <span>{p.name}</span>
                    <span className="text-xs text-slate-500">{p.budgetType}</span>
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
