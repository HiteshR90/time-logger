"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: org } = useQuery({
    queryKey: ["org"],
    queryFn: () => apiFetch("/organizations/me"),
  });

  const [screenshotInterval, setScreenshotInterval] = useState("5");
  const [idleTimeout, setIdleTimeout] = useState("5");
  const [blurScreenshots, setBlurScreenshots] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [defaultTaxRate, setDefaultTaxRate] = useState("0");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (org?.settings) {
      const s = org.settings as any;
      setScreenshotInterval(String(s.screenshotIntervalMin ?? 5));
      setIdleTimeout(String(s.idleTimeoutMin ?? 5));
      setBlurScreenshots(s.blurScreenshots ?? false);
      setDefaultCurrency(s.defaultCurrency ?? "USD");
      setDefaultTaxRate(String(s.defaultTaxRate ?? 0));
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
      blurScreenshots,
      defaultCurrency,
      defaultTaxRate: Number(defaultTaxRate),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="max-w-lg space-y-6">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Monitoring</h2>
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
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={blurScreenshots} onChange={(e) => setBlurScreenshots(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600" />
              <label className="text-sm">Blur screenshots for privacy</label>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Billing</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Default Currency</label>
              <select value={defaultCurrency} onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Default Tax Rate (%)</label>
              <input type="number" value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} min="0" max="100" step="0.1"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
            </div>
          </div>
        </div>

        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50">
          {saveMutation.isPending ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
