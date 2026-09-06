import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserNav } from "@/components/layout/UserNav";
import { getGeneralSeoSettings } from "@/server/actions/admin";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { SessionUser } from "@/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/forbidden");
  }

  const [pendingCount, openReportsCount, brandSettings] = await Promise.all([
    db.project.count({ where: { status: "PENDING" } }),
    db.report.count({ where: { status: "OPEN" } }),
    getGeneralSeoSettings(),
  ]);

  const user = session.user as SessionUser;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FBFBFA] dark:bg-[#12110D] text-neutral-900 dark:text-neutral-100 font-sans antialiased selection:bg-[#E4572E]/20 selection:text-[#E4572E]">
      <AdminSidebar
        pendingSubmissionsCount={pendingCount}
        openReportsCount={openReportsCount}
        brandSettings={brandSettings}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sleek Top Admin Bar */}
        <header className="h-16 px-6 sm:px-10 border-b border-[#E8E5DC] dark:border-[#25221B] bg-white/80 dark:bg-[#14130E]/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Consola de Administración Activa</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100/80 dark:bg-neutral-800/80 hover:bg-neutral-200/80 transition-colors border border-[#E8E5DC] dark:border-[#25221B]"
            >
              <span>Ver Sitio en Vivo</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </Link>

            <ThemeToggle />
            <UserNav user={user} />
          </div>
        </header>

        {/* Main Content View */}
        <main className="flex-1 p-6 sm:p-10 w-full">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
