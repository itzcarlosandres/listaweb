import { db } from "@/lib/db";
import { ReportActions } from "@/components/admin/ReportActions";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { AlertTriangle, ExternalLink, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default async function AdminReportsPage() {
  const reports = await db.report.findMany({
    include: {
      reporter: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
      },
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E5DC] dark:border-[#25221B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4572E]">
              Seguridad
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-400">
              Centro de Denuncias
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
            Moderación de Reportes ({reports.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Supervisa y resuelve denuncias de spam, scams o contenido indebido reportado por la comunidad.
          </p>
        </div>
      </div>

      {reports.length > 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E8E5DC] dark:border-[#25221B] bg-neutral-50/70 dark:bg-neutral-900/50 text-neutral-500 uppercase font-mono text-[10px]">
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Objetivo</th>
                  <th className="py-3 px-4">Reportado Por</th>
                  <th className="py-3 px-4">Detalles</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E5DC]/60 dark:divide-[#25221B]/60">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20">
                        {r.type}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {r.project ? (
                        <Link
                          href={`/project/${r.project.slug}`}
                          target="_blank"
                          className="font-bold text-[#E4572E] hover:underline flex items-center gap-1"
                        >
                          {r.project.name}
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : (
                        <span className="font-mono text-neutral-400">
                          {r.targetType}: {r.targetId.slice(0, 8)}...
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <Link
                        href={`/user/${r.reporter.username}`}
                        target="_blank"
                        className="flex items-center gap-2 hover:text-[#E4572E] transition-colors"
                      >
                        <UserAvatar src={r.reporter.image} name={r.reporter.name} size="sm" />
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">@{r.reporter.username}</span>
                      </Link>
                    </td>

                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 max-w-xs leading-relaxed">
                      {r.detail || "Sin detalles adicionales"}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          r.status === "OPEN"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            : r.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <ReportActions reportId={r.id} status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="No hay reportes abiertos"
          description="La comunidad está limpia y sin incidencias reportadas actualmente."
        />
      )}
    </div>
  );
}
