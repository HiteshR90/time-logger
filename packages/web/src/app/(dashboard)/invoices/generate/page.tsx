"use client";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GenerateInvoicePage() {
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [taxRate, setTaxRate] = useState("0");
  const [error, setError] = useState("");

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => apiFetch("/clients"),
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => apiFetch("/invoices/generate", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => router.push("/invoices"),
    onError: (err: any) => setError(err.message),
  });

  return (
    <div>
      <Link href="/invoices" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
        <ArrowLeft size={16} /> Back to Invoices
      </Link>

      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Generate Invoice</h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          generateMutation.mutate({
            clientId,
            fromDate: new Date(fromDate).toISOString(),
            toDate: new Date(toDate).toISOString(),
            taxRate: Number(taxRate),
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Client</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} required
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              <option value="">Select client...</option>
              {clients?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">From Date</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">To Date</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Tax Rate (%)</label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} min="0" max="100" step="0.1"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={generateMutation.isPending}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50">
            {generateMutation.isPending ? "Generating..." : "Generate Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}
