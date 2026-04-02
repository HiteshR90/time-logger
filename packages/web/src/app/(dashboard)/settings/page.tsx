"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "AED", "CAD", "AUD", "SGD", "JPY"];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: org } = useQuery({
    queryKey: ["org"],
    queryFn: () => apiFetch("/organizations/me"),
  });

  const [screenshotInterval, setScreenshotInterval] = useState("5");
  const [idleTimeout, setIdleTimeout] = useState("5");
  const [salaryCurrency, setSalaryCurrency] = useState("USD");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (org?.settings) {
      const s = org.settings as any;
      setScreenshotInterval(String(s.screenshotIntervalMin ?? 5));
      setIdleTimeout(String(s.idleTimeoutMin ?? 5));
      setSalaryCurrency(s.defaultCurrency ?? "USD");
    }
  }, [org]);

  const saveMutation = useMutation({
    mutationFn: (settings: any) =>
      apiFetch("/organizations/settings", { method: "PATCH", body: JSON.stringify(settings) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      screenshotIntervalMin: Number(screenshotInterval),
      idleTimeoutMin: Number(idleTimeout),
      defaultCurrency: salaryCurrency,
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Settings</h1>
      <p className="text-sm text-slate-400 mb-6">Organization defaults. Override per department (Teams) or per member (Members).</p>

      <div className="max-w-lg space-y-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Monitoring Defaults</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Screenshot Interval</label>
              <select value={screenshotInterval} onChange={(e) => setScreenshotInterval(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="1">Every 1 minute</option>
                <option value="2">Every 2 minutes</option>
                <option value="5">Every 5 minutes</option>
                <option value="10">Every 10 minutes</option>
                <option value="-1">Random</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Idle Timeout (minutes)</label>
              <input type="number" value={idleTimeout} onChange={(e) => setIdleTimeout(e.target.value)} min="1" max="60"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Blur screenshots and screenshot interval can be overridden per employee on the Members page.</p>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Salary & Billing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Employee Salary Currency</label>
              <select value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-xs text-slate-500 mt-1">Used for employee salary display on the Members page.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4">Client billing currency and tax rate are set per client on the Clients page.</p>
        </div>

        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50">
          {saveMutation.isPending ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
