"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useParams } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: () => apiFetch(`/projects/${id}`),
  });

  if (isLoading) return <div className="text-slate-400">Loading...</div>;
  if (!project) return <div className="text-red-400">Project not found</div>;

  return (
    <div>
      <Link href="/projects" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        <div className="flex gap-4 text-sm text-slate-400">
          <span>Client: {project.client?.name || "None"}</span>
          <span>Budget: {project.budgetType === "fixed" ? `$${project.budgetAmount?.toLocaleString()}` : "Hourly"}</span>
          <span>Currency: {project.currency}</span>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Team Members</h2>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Hourly Rate</th>
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
                <td className="px-4 py-3">${m.hourlyRate}/hr</td>
              </tr>
            ))}
            {!project.members?.length && (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-500">No members assigned</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
