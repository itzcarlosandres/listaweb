import { db } from "@/lib/db";
import Link from "next/link";
import { ProjectAdminActions } from "@/components/admin/ProjectAdminActions";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { FolderGit2, Sparkles, Search } from "lucide-react";
import { ProjectStatus } from "@prisma/client";

interface AdminProjectsPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminProjectsPage({ searchParams }: AdminProjectsPageProps) {
  const params = await searchParams;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (params.status) {
    where.status = params.status as ProjectStatus;
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { slug: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const projects = await db.project.findMany({
    where,
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            APPROVED
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            PENDING
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
            REJECTED
          </span>
        );
      case "SUSPENDED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            SUSPENDED
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E5DC] dark:border-[#25221B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4572E]">
              Catálogo
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-400">
              Todos los Productos
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
            Gestión de Proyectos ({projects.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Supervisa el estado, destacados y suspensiones de todos los productos en la base de datos.
          </p>
        </div>

        {/* Search Bar */}
        <form method="GET" className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Buscar por nombre o slug..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
          {params.status && <input type="hidden" name="status" value={params.status} />}
        </form>
      </div>

      {/* Filtros de Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { label: "Todos", value: "" },
          { label: "Aprobados", value: "APPROVED" },
          { label: "Pendientes", value: "PENDING" },
          { label: "Rechazados", value: "REJECTED" },
          { label: "Suspendidos", value: "SUSPENDED" },
        ].map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/projects${tab.value ? `?status=${tab.value}` : ""}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              (params.status || "") === tab.value
                ? "bg-[#E4572E] text-white shadow-xs"
                : "bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:border-neutral-300"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Tabla Densa */}
      <div className="rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E8E5DC] dark:border-[#25221B] bg-neutral-50/70 dark:bg-neutral-900/50 text-neutral-500 uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Proyecto</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Maker</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Votos</th>
                <th className="py-3 px-4 text-right">Vistas</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DC]/60 dark:divide-[#25221B]/60">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400 text-xs">
                    No se encontraron proyectos con ese criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                projects.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {p.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0 border border-[#E8E5DC] dark:border-[#25221B]" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[#E4572E] text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/project/${p.slug}`}
                            target="_blank"
                            className="font-bold text-neutral-900 dark:text-white hover:text-[#E4572E] flex items-center gap-1 transition-colors"
                          >
                            {p.name}
                            {p.featured && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                          </Link>
                          <span className="text-[11px] text-neutral-400 font-mono">/{p.slug}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <CategoryBadge
                        slug={p.category.slug}
                        name={p.category.name}
                        icon={p.category.icon}
                        size="sm"
                      />
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        href={`/user/${p.user.username}`}
                        target="_blank"
                        className="flex items-center gap-2 hover:text-[#E4572E] transition-colors"
                      >
                        <UserAvatar src={p.user.image} name={p.user.name} size="sm" />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">@{p.user.username}</span>
                      </Link>
                    </td>

                    <td className="py-3 px-4 text-center">{getStatusBadge(p.status)}</td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-[#E4572E]">
                      {p.votesCount}
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-neutral-500">
                      {p.viewsCount}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <ProjectAdminActions
                        projectId={p.id}
                        projectName={p.name}
                        isFeatured={p.featured}
                        status={p.status}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
