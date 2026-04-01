"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";

export default function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isManager = user?.role === "owner" || user?.role === "manager";
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [budgetType, setBudgetType] = useState("hourly");
  const [budgetAmount, setBudgetAmount] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch("/projects"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch("/projects", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowCreate(false);
      setName("");
      setBudgetAmount("");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        {isManager && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Project</h2>
          <form onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate({
              name,
              budgetType,
              budgetAmount: budgetAmount ? Number(budgetAmount) : null,
              currency: "USD",
            });
          }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" required
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <select value={budgetType} onChange={(e) => setBudgetType(e.target.value)}
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              <option value="hourly">Hourly</option>
              <option value="fixed">Fixed Budget</option>
            </select>
            <input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="Budget amount"
              className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 bg-slate-700 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project: any) => (
          <Link key={project.id} href={`/projects/${project.id}`}
            className="bg-slate-800 rounded-xl border border-slate-700 p-5 hover:border-blue-500 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <FolderKanban size={20} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-xs text-slate-400">{project.client?.name || "No client"}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${project.isActive ? "bg-green-900/50 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                {project.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex justify-between text-sm text-slate-400">
              <span>{project._count?.members || 0} members</span>
              <span>{project.budgetType === "fixed" && project.budgetAmount ? `$${project.budgetAmount.toLocaleString()}` : "Hourly"}</span>
            </div>
          </Link>
        ))}
        {!projects?.length && !isLoading && (
          <p className="text-slate-500 col-span-3 text-center py-12">No projects yet</p>
        )}
      </div>
    </div>
  );
}
