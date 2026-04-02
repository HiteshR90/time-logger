"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, getAccessToken } from "@/lib/api-client";
import { Camera, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5080";

function screenshotUrl(url: string | null): string | null {
  if (!url) return null;
  // Local file URLs are relative to the API
  if (url.startsWith("/screenshots/file/")) {
    return `${API_BASE}${url}?token=${getAccessToken()}`;
  }
  return url;
}

export default function ScreenshotsPage() {
  const [selectedUser, setSelectedUser] = useState("");
  const [expandedImg, setExpandedImg] = useState<string | null>(null);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch("/users"),
  });

  const { data } = useQuery({
    queryKey: ["screenshots", selectedUser],
    queryFn: () =>
      apiFetch(`/screenshots?limit=50${selectedUser ? `&userId=${selectedUser}` : ""}`),
  });

  const screenshots = data?.screenshots || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Screenshots</h1>
        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
          className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm">
          <option value="">All employees</option>
          {users?.map((u: any) => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {screenshots.map((ss: any) => (
          <div key={ss.id} className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => setExpandedImg(screenshotUrl(ss.downloadUrl))}>
            {screenshotUrl(ss.thumbnailUrl || ss.downloadUrl) ? (
              <img src={screenshotUrl(ss.thumbnailUrl || ss.downloadUrl)!} alt="Screenshot" className="w-full aspect-video object-cover" />
            ) : (
              <div className="w-full aspect-video bg-slate-900 flex items-center justify-center">
                <Camera className="text-slate-700" size={24} />
              </div>
            )}
            <div className="p-2">
              <p className="text-xs text-slate-400">{ss.timeEntry?.user?.name}</p>
              <p className="text-xs text-slate-500">{new Date(ss.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {screenshots.length === 0 && (
          <p className="text-slate-500 col-span-4 text-center py-12">No screenshots captured yet</p>
        )}
      </div>

      {expandedImg && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setExpandedImg(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setExpandedImg(null)}>
            <X size={24} />
          </button>
          <img src={expandedImg} alt="Full screenshot" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
