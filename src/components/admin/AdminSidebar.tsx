"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/shared/BrandLogo";
import type { GeneralSeoSettingsInput } from "@/server/actions/admin";
import {
  LayoutDashboard,
  Inbox,
  FolderGit2,
  AlertTriangle,
  Users,
  Layers,
  Sparkles,
  CreditCard,
  Settings,
  ArrowUpRight,
  Shield,
  Rocket,
  ChevronRight,
  ShieldAlert,
  Sliders,
  DollarSign,
} from "lucide-react";

interface AdminSidebarProps {
  pendingSubmissionsCount?: number;
  openReportsCount?: number;
  brandSettings?: GeneralSeoSettingsInput;
}

interface NavItem {
  href: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  exact?: boolean;
  badge?: number;
  badgeColor?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export function AdminSidebar({
  pendingSubmissionsCount = 0,
  openReportsCount = 0,
  brandSettings,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navGroups: NavGroup[] = [
    {
      title: "Principal",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      ],
    },
    {
      title: "Moderación & Seguridad",
      items: [
        {
          href: "/admin/submissions",
          label: "Envíos Pendientes",
          icon: Inbox,
          badge: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined,
          badgeColor: "bg-[#E4572E] text-white",
        },
        {
          href: "/admin/reports",
          label: "Reportes de Abuso",
          icon: ShieldAlert,
          badge: openReportsCount > 0 ? openReportsCount : undefined,
          badgeColor: "bg-red-500 text-white",
        },
      ],
    },
    {
      title: "Catálogo & Comunidad",
      items: [
        { href: "/admin/projects", label: "Proyectos", icon: FolderGit2 },
        { href: "/admin/categories", label: "Categorías", icon: Layers },
        { href: "/admin/users", label: "Usuarios & Roles", icon: Users },
      ],
    },
    {
      title: "Monetización & Ventas",
      items: [
        { href: "/admin/plans", label: "Planes & Boosts", icon: Sparkles },
        { href: "/admin/payments", label: "Historial de Pagos", icon: DollarSign },
      ],
    },
    {
      title: "Plataforma",
      items: [
        { href: "/admin/settings", label: "Configuración Global", icon: Sliders },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-[#14130E] border-r border-[#E8E5DC] dark:border-[#25221B] flex flex-col justify-between min-h-screen">
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <div className="px-2 py-1 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group">
            <BrandLogo
              mode={brandSettings?.logoMode}
              logoUrl={brandSettings?.logoUrl}
              iconName={brandSettings?.logoIcon}
              text={brandSettings?.logoText}
              textHighlight={brandSettings?.logoTextHighlight}
              iconBg={brandSettings?.logoIconBg}
              size="md"
            />
          </Link>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
            ADMIN
          </span>
        </div>

        {/* Grouped Links Navigation */}
        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="px-3 pb-1 text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                      isActive
                        ? "bg-[#E4572E] text-white shadow-xs font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4.5 h-4.5 transition-colors ${
                          isActive
                            ? "text-white"
                            : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.badge !== undefined && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${item.badgeColor || "bg-neutral-200 text-neutral-800"}`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {isActive && (
                        <ChevronRight className="w-4 h-4 text-white/70" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer info in sidebar */}
      <div className="p-5 border-t border-[#E8E5DC] dark:border-[#25221B] bg-neutral-50/50 dark:bg-neutral-900/30">
        <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-mono">v1.2.0 • Online</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1 hover:text-[#E4572E] transition-colors"
          >
            <span>Ver Web</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
