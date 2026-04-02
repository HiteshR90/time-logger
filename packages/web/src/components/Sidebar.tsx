"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Monitor, Clock, UserPlus, Building2, FolderKanban, Users,
  FileText, Settings, BarChart3, LayoutDashboard, LogOut, ChevronDown,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  permission?: string;
  always?: boolean;
  children?: NavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/live", label: "Live Feed", icon: Monitor, permission: "live_feed.view" },
  { href: "/timesheets", label: "Timesheets", icon: Clock, always: true },
  { href: "/members", label: "Members", icon: UserPlus, permission: "members.view" },
  {
    href: "/clients", label: "Clients", icon: Building2, always: true,
    children: [
      { href: "/projects", label: "Projects", icon: FolderKanban, always: true },
    ],
  },
  { href: "/invoices", label: "Invoices", icon: FileText, permission: "invoices.view" },
  { href: "/reports", label: "Reports", icon: BarChart3, permission: "reports.view" },
  { href: "/my-dashboard", label: "My Dashboard", icon: LayoutDashboard, always: true },
  { href: "/settings", label: "Settings", icon: Settings, permission: "settings.manage" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, hasPermission, logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({ "/clients": true });

  const toggleMenu = (href: string) => setExpandedMenus((prev) => ({ ...prev, [href]: !prev[href] }));
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const canSee = (item: NavItem) => item.always || (item.permission && hasPermission(item.permission));

  return (
    <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-lg font-bold">TimeTracker</h1>
        <p className="text-xs text-slate-400 mt-1">{user?.name}</p>
      </div>
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.filter(canSee).map((item) => {
          const visibleChildren = item.children?.filter(canSee) || [];
          const hasChildren = visibleChildren.length > 0;
          const active = isActive(item.href) || (hasChildren && visibleChildren.some((c) => isActive(c.href)));
          const expanded = expandedMenus[item.href] || active;

          return (
            <div key={item.href}>
              {hasChildren ? (
                <button onClick={() => toggleMenu(item.href)}
                  className={`flex items-center justify-between w-full px-4 py-2 mx-2 rounded-lg text-sm transition-colors ${
                    active ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-700"
                  }`} style={{ width: "calc(100% - 16px)" }}>
                  <span className="flex items-center gap-3"><item.icon size={18} />{item.label}</span>
                  <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
              ) : (
                <Link href={item.href}
                  className={`flex items-center gap-3 px-4 py-2 mx-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href) ? "bg-blue-600/20 text-blue-400" : "text-slate-300 hover:bg-slate-700"
                  }`}><item.icon size={18} />{item.label}</Link>
              )}
              {hasChildren && expanded && (
                <div className="ml-4">
                  <Link href={item.href}
                    className={`flex items-center gap-3 px-4 py-1.5 mx-2 rounded-lg text-xs transition-colors ${
                      isActive(item.href) && !visibleChildren.some((c) => isActive(c.href))
                        ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
                    }`}><item.icon size={14} />All {item.label}</Link>
                  {visibleChildren.map((child) => (
                    <Link key={child.href} href={child.href}
                      className={`flex items-center gap-3 px-4 py-1.5 mx-2 rounded-lg text-xs transition-colors ${
                        isActive(child.href) ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
                      }`}><child.icon size={14} />{child.label}</Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-700">
        <button onClick={logout}
          className="flex items-center gap-3 px-4 py-2 w-full rounded-lg text-sm text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
          <LogOut size={18} />Logout
        </button>
      </div>
    </aside>
  );
}
