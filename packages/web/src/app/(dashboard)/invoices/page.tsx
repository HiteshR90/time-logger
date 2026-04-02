"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import Link from "next/link";
import { Plus, FileText, Download, Eye, Send, CheckCircle, X } from "lucide-react";

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);

  const { data: invoices } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => { try { return await apiFetch("/invoices"); } catch { return []; } },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/invoices/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  const viewInvoice = async (id: string) => {
    const data = await apiFetch(`/invoices/${id}`);
    setViewingInvoice(data);
  };

  const downloadInvoice = (inv: any) => {
    // Generate a simple HTML invoice for printing/PDF
    const lines = inv.lineItems?.map((li: any) =>
      `<tr><td style="padding:8px;border-bottom:1px solid #eee;">${li.description || `${li.user?.name} — ${li.project?.name}`}</td>
       <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${li.hours}h</td>
       <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${li.rate}</td>
       <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">$${li.amount}</td></tr>`
    ).join("") || "";

    const html = `<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title>
      <style>body{font-family:-apple-system,sans-serif;max-width:800px;margin:40px auto;color:#333;}
      table{width:100%;border-collapse:collapse;margin:20px 0;}th{text-align:left;padding:8px;border-bottom:2px solid #333;}
      .right{text-align:right;}.header{display:flex;justify-content:space-between;margin-bottom:30px;}
      .total{font-size:24px;font-weight:bold;}@media print{button{display:none;}}</style></head><body>
      <div class="header"><div><h1>INVOICE</h1><p style="color:#666;">${inv.invoiceNumber}</p></div>
      <div style="text-align:right;"><p><strong>${inv.client?.name || ""}</strong></p>
      <p style="color:#666;">${inv.client?.email || ""}</p></div></div>
      <p>Period: ${new Date(inv.fromDate).toLocaleDateString()} — ${new Date(inv.toDate).toLocaleDateString()}</p>
      <table><thead><tr><th>Description</th><th class="right">Hours</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead>
      <tbody>${lines}</tbody></table>
      <div style="text-align:right;margin-top:20px;">
      <p>Subtotal: <strong>$${inv.subtotal}</strong></p>
      <p>Tax (${inv.taxRate}%): $${inv.taxAmount}</p>
      <p class="total">Total: $${inv.total}</p></div>
      ${inv.notes ? `<p style="margin-top:30px;color:#666;">Notes: ${inv.notes}</p>` : ""}
      <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#3b82f6;color:white;border:none;border-radius:6px;cursor:pointer;">Print / Save as PDF</button>
      </body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

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
              <th className="text-left px-4 py-3 font-medium text-slate-300">Actions</th>
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
                  }`}>{inv.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => viewInvoice(inv.id)} className="p-1 hover:bg-slate-700 rounded" title="View details">
                      <Eye size={14} className="text-slate-400" />
                    </button>
                    <button onClick={async () => { const full = await apiFetch(`/invoices/${inv.id}`); downloadInvoice(full); }}
                      className="p-1 hover:bg-slate-700 rounded" title="Download">
                      <Download size={14} className="text-slate-400" />
                    </button>
                    {inv.status === "draft" && (
                      <button onClick={() => statusMutation.mutate({ id: inv.id, status: "sent" })}
                        className="p-1 hover:bg-blue-900/30 rounded" title="Mark as Sent">
                        <Send size={14} className="text-blue-400" />
                      </button>
                    )}
                    {inv.status === "sent" && (
                      <button onClick={() => statusMutation.mutate({ id: inv.id, status: "paid" })}
                        className="p-1 hover:bg-green-900/30 rounded" title="Mark as Paid">
                        <CheckCircle size={14} className="text-green-400" />
                      </button>
                    )}
                    {inv.status !== "paid" && (
                      <button onClick={() => { if (confirm(`Delete invoice ${inv.invoiceNumber}?`)) deleteMutation.mutate(inv.id); }}
                        className="p-1 hover:bg-red-900/30 rounded" title="Delete">
                        <X size={14} className="text-red-400" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!(invoices || []).length && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No invoices yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice detail modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setViewingInvoice(null)}>
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold">{viewingInvoice.invoiceNumber}</h2>
                <p className="text-sm text-slate-400">{viewingInvoice.client?.name} — {new Date(viewingInvoice.fromDate).toLocaleDateString()} to {new Date(viewingInvoice.toDate).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => downloadInvoice(viewingInvoice)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs flex items-center gap-1">
                  <Download size={12} /> Download
                </button>
                <button onClick={() => setViewingInvoice(null)} className="p-1 hover:bg-slate-700 rounded"><X size={20} /></button>
              </div>
            </div>
            <div className="p-6">
              <table className="w-full text-sm mb-6">
                <thead><tr className="border-b border-slate-700">
                  <th className="text-left py-2 text-slate-400">Description</th>
                  <th className="text-right py-2 text-slate-400">Hours</th>
                  <th className="text-right py-2 text-slate-400">Rate</th>
                  <th className="text-right py-2 text-slate-400">Amount</th>
                </tr></thead>
                <tbody>
                  {viewingInvoice.lineItems?.map((li: any) => (
                    <tr key={li.id} className="border-b border-slate-700/50">
                      <td className="py-2">{li.description || `${li.user?.name} — ${li.project?.name}`}</td>
                      <td className="py-2 text-right">{li.hours}h</td>
                      <td className="py-2 text-right">${li.rate}</td>
                      <td className="py-2 text-right font-medium">${li.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-right space-y-1">
                <p className="text-slate-400">Subtotal: <span className="text-slate-200">${viewingInvoice.subtotal}</span></p>
                <p className="text-slate-400">Tax ({viewingInvoice.taxRate}%): <span className="text-slate-200">${viewingInvoice.taxAmount}</span></p>
                <p className="text-xl font-bold">Total: ${viewingInvoice.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
