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
  // S3 storage
  const [s3Enabled, setS3Enabled] = useState(false);
  const [s3Endpoint, setS3Endpoint] = useState("");
  const [s3Bucket, setS3Bucket] = useState("");
  const [s3Region, setS3Region] = useState("us-east-1");
  const [s3AccessKey, setS3AccessKey] = useState("");
  const [s3SecretKey, setS3SecretKey] = useState("");
  const [s3RootFolder, setS3RootFolder] = useState("");

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (org?.settings) {
      const s = org.settings as any;
      setScreenshotInterval(String(s.screenshotIntervalMin ?? 5));
      setIdleTimeout(String(s.idleTimeoutMin ?? 5));
      setSalaryCurrency(s.defaultCurrency ?? "USD");
      // S3
      setS3Enabled(s.s3?.enabled ?? false);
      setS3Endpoint(s.s3?.endpoint ?? "");
      setS3Bucket(s.s3?.bucket ?? "");
      setS3Region(s.s3?.region ?? "us-east-1");
      setS3AccessKey(s.s3?.accessKey ?? "");
      setS3SecretKey(s.s3?.secretKey ? "••••••••" : "");
      setS3RootFolder(s.s3?.rootFolder ?? "");
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
    const s3Config: any = {
      enabled: s3Enabled,
      endpoint: s3Endpoint,
      bucket: s3Bucket,
      region: s3Region,
      accessKey: s3AccessKey,
      rootFolder: s3RootFolder,
    };
    // Only send secret if changed (not masked)
    if (s3SecretKey && !s3SecretKey.startsWith("••")) {
      s3Config.secretKey = s3SecretKey;
    }
    saveMutation.mutate({
      screenshotIntervalMin: Number(screenshotInterval),
      idleTimeoutMin: Number(idleTimeout),
      defaultCurrency: salaryCurrency,
      s3: s3Config,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Settings</h1>
        <a href="/settings/roles" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium">Roles & Permissions</a>
      </div>
      <p className="text-sm text-slate-400 mb-6">Organization defaults. Override per department or per member.</p>

      <div className="max-w-lg space-y-6">
        {/* Monitoring */}
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
        </div>

        {/* Salary */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-lg font-semibold mb-4">Salary & Billing</h2>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Employee Salary Currency</label>
            <select value={salaryCurrency} onChange={(e) => setSalaryCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="text-xs text-slate-500 mt-1">Client billing currency is set per client on the Clients page.</p>
          </div>
        </div>

        {/* S3 Storage */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Screenshot Storage (S3)</h2>
            <button onClick={() => setS3Enabled(!s3Enabled)}
              className={`w-10 h-5 rounded-full transition-colors relative ${s3Enabled ? "bg-blue-600" : "bg-slate-600"}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${s3Enabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {!s3Enabled ? (
            <p className="text-sm text-slate-500">Screenshots are stored locally on the agent machine. Enable S3 to store them in the cloud (AWS S3, MinIO, DigitalOcean Spaces, etc.).</p>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">S3 Endpoint</label>
                <input value={s3Endpoint} onChange={(e) => setS3Endpoint(e.target.value)}
                  placeholder="https://s3.amazonaws.com or http://minio:9000"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Bucket Name</label>
                  <input value={s3Bucket} onChange={(e) => setS3Bucket(e.target.value)}
                    placeholder="time-tracker-screenshots"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Region</label>
                  <input value={s3Region} onChange={(e) => setS3Region(e.target.value)}
                    placeholder="us-east-1"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Root Folder (prefix)</label>
                <input value={s3RootFolder} onChange={(e) => setS3RootFolder(e.target.value)}
                  placeholder="screenshots/ (optional — organizes files in the bucket)"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                <p className="text-xs text-slate-500 mt-1">Files stored as: bucket/{"{root_folder}"}/{"{org-slug}"}/{"{date}"}/{"{user}"}/screenshot.jpg</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Access Key ID</label>
                  <input value={s3AccessKey} onChange={(e) => setS3AccessKey(e.target.value)}
                    placeholder="AKIA..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Secret Access Key</label>
                  <input type="password" value={s3SecretKey} onChange={(e) => setS3SecretKey(e.target.value)}
                    placeholder="Enter secret key"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Credentials are encrypted in the database. Compatible with AWS S3, MinIO, DigitalOcean Spaces, Cloudflare R2.</p>
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-sm disabled:opacity-50">
          {saveMutation.isPending ? "Saving..." : saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
