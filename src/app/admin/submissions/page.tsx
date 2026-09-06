import { db } from "@/lib/db";
import { SubmissionActions } from "@/components/admin/SubmissionActions";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { EmptyState } from "@/components/shared/EmptyState";
import { Inbox, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";

export default async function SubmissionsPage() {
  const pendingProjects = await db.project.findMany({
    where: { status: "PENDING" },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-[#E8E5DC] dark:border-[#25221B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#E4572E]">
              Moderación
            </span>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <span className="text-xs font-mono text-neutral-400">
              Control de Calidad
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">
            Bandeja de Envíos Pendientes
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Revisa, valida y aprueba los proyectos enviados por la comunidad antes de publicarse en la portada.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
            {pendingProjects.length} en espera
          </span>
        </div>
      </div>

      {pendingProjects.length > 0 ? (
        <div className="space-y-4">
          {pendingProjects.map((project) => {
            const formattedDate = new Intl.DateTimeFormat("es", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(project.createdAt));

            return (
              <div
                key={project.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] space-y-5 shadow-2xs hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Info Proyecto */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    {project.logoUrl ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E8E5DC] dark:border-[#25221B] bg-neutral-50 dark:bg-neutral-900 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.logoUrl}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#E4572E] text-white font-bold flex items-center justify-center text-lg shrink-0 shadow-xs">
                        {project.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="font-heading font-bold text-lg text-neutral-900 dark:text-white">
                          {project.name}
                        </h2>
                        <CategoryBadge
                          slug={project.category.slug}
                          name={project.category.name}
                          icon={project.category.icon}
                          size="sm"
                        />
                        <span className="text-[11px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          {project.pricingType}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 font-medium">
                        {project.tagline}
                      </p>

                      <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1 flex-wrap font-mono">
                        <a
                          href={project.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#E4572E] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span className="truncate max-w-xs">{project.websiteUrl}</span>
                        </a>
                        <span className="text-neutral-300 dark:text-neutral-700">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          Enviado el {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Maker & Acciones */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 pt-2 lg:pt-0">
                    <div className="flex items-center gap-2.5 text-xs bg-neutral-50 dark:bg-neutral-900/60 p-2.5 rounded-xl border border-[#E8E5DC]/60 dark:border-[#25221B]/60">
                      <UserAvatar
                        src={project.user.image}
                        name={project.user.name || project.user.username}
                        size="sm"
                      />
                      <div>
                        <span className="font-semibold block text-neutral-900 dark:text-white leading-tight">
                          {project.user.name || project.user.username}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {project.user.email}
                        </span>
                      </div>
                    </div>

                    <SubmissionActions
                      projectId={project.id}
                      projectName={project.name}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="Bandeja de revisión vacía"
          description="¡Excelente trabajo! No hay proyectos pendientes por moderar en este momento."
        />
      )}
    </div>
  );
}
