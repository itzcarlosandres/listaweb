"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  BarChart3,
  Bookmark,
  Bell,
  Settings,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Role } from "@prisma/client";

interface DashboardNavProps {
  role?: Role;
  unreadNotificationsCount?: number;
}

export function DashboardNav({ role, unreadNotificationsCount = 0 }: DashboardNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/projects", label: "My Projects", icon: FolderGit2 },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
    {
      href: "/dashboard/notifications",
      label: "Notifications",
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="border-b border-[#E7E4DB] dark:border-[#2E2B23] bg-white dark:bg-[#16140F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none py-2">
          {/* Navigation Links */}
          <nav className="flex items-center gap-1 shrink-0">
            {links.map((link) => {
              const isActive = link.exact
                ? pathname === link.href
                : pathname.startsWith(link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-[#17150F] text-white dark:bg-white dark:text-[#17150F] shadow-xs"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-[#17150F] dark:hover:text-[#FAF9F6] hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {typeof link.badge === "number" && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-[#E4572E] text-white">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors shrink-0"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* CTA New Project */}
          <div className="shrink-0 pl-4">
            <Link
              href="/submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              New Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
