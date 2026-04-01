"use client";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default function InvoicesPage() {
  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      try { return await apiFetch("/invoices"); }
      catch { return []; }
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Link href="/invoices/generate"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">
          <Plus size={16} /> Generate Invoice
        </Link>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Invoice #</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Client</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Period</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Total</th>
              <th className="text-left px-4 py-3 font-medium text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {(invoices || []).map((inv: any) => (
              <tr key={inv.id} className="border-t border-slate-700">
                <td className="px-4 py-3 flex items-center gap-2">
                  <FileText size={16} className="text-slate-500" />
                  {inv.invoiceNumber}
                </td>
                <td className="px-4 py-3">{inv.client?.name}</td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(inv.fromDate).toLocaleDateString()} - {new Date(inv.toDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 font-medium">${inv.total?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    inv.status === "paid" ? "bg-green-900/50 text-green-400" :
                    inv.status === "sent" ? "bg-blue-900/50 text-blue-400" :
                    "bg-yellow-900/50 text-yellow-400"
                  }`}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
            {!(invoices || []).length && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-500">No invoices yet. Generate one from tracked time.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
