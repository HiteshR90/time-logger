"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Monitor, Clock, Camera, AppWindow, FolderKanban, Users, Building2,
  FileText, Settings, BarChart3, LayoutDashboard, LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/live", label: "Live Feed", icon: Monitor, roles: ["owner", "manager"] },
  { href: "/timesheets", label: "Timesheets", icon: Clock, roles: ["owner", "manager", "employee"] },
  { href: "/screenshots", label: "Screenshots", icon: Camera, roles: ["owner", "manager"] },
  { href: "/app-usage", label: "App Usage", icon: AppWindow, roles: ["owner", "manager"] },
  { href: "/projects", label: "Projects", icon: FolderKanban, roles: ["owner", "manager", "employee"] },
  { href: "/clients", label: "Clients", icon: Building2, roles: ["owner"] },
  { href: "/teams", label: "Teams", icon: Users, roles: ["owner"] },
  { href: "/invoices", label: "Invoices", icon: FileText, roles: ["owner"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["owner", "manager"] },
  { href: "/my-dashboard", label: "My Dashboard", icon: LayoutDashboard, roles: ["owner", "manager", "employee"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["owner"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role || ""),
  );

  return (
    <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold">TimeTracker</h1>
        <p className="text-xs text-slate-400 mt-1">{user?.name}</p>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {visibleItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors ${
                active ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-700"
              }`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <button onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
