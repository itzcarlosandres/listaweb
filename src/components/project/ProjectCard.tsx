import Link from "next/link";
import Image from "next/image";
import { VoteButton } from "./VoteButton";
import { CategoryBadge } from "../shared/CategoryBadge";
import { UserAvatar } from "../shared/UserAvatar";
import { MessageSquare, Eye, ExternalLink, Sparkles } from "lucide-react";
import type { ProjectWithDetails } from "@/types";

interface ProjectCardProps {
  project: ProjectWithDetails;
  featuredWide?: boolean;
}

export function ProjectCard({ project, featuredWide = false }: ProjectCardProps) {
  const screenshots = Array.isArray(project.screenshots) ? (project.screenshots as string[]) : [];
  const primaryScreenshot = screenshots[0];

  return (
    <div
      className={`group relative rounded-2xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] p-5 card-hover flex flex-col justify-between overflow-hidden ${
        featuredWide ? "md:col-span-2 md:grid md:grid-cols-12 md:gap-6" : ""
      }`}
    >
      {/* Badge de destacado */}
      {project.featured && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3" />
            Destacado
          </span>
        </div>
      )}

      {/* Imagen / Preview en tarjetas destacadas */}
      {featuredWide && primaryScreenshot && (
        <div className="md:col-span-5 mb-4 md:mb-0 relative aspect-video md:aspect-auto md:h-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-[#E7E4DB] dark:border-[#2E2B23]">
          <Image
            src={primaryScreenshot}
            alt={project.name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className={`flex flex-col justify-between ${featuredWide ? "md:col-span-7" : "h-full"}`}>
        <div>
          {/* Header con Logo, Nombre y Categoría */}
          <div className="flex items-start gap-3.5 mb-3">
            {project.logoUrl ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#E7E4DB] dark:border-[#2E2B23] bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.logoUrl}
                  alt={project.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#E4572E] text-white font-bold flex items-center justify-center shrink-0">
                {project.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0 pr-16">
              <div className="flex items-center gap-2">
                <Link
                  href={`/project/${project.slug}`}
                  className="font-display font-bold text-base text-[#17150F] dark:text-[#FAF9F6] hover:text-[#E4572E] dark:hover:text-[#E4572E] transition-colors truncate block"
                >
                  {project.name}
                </Link>
                {project.pricingType === "FREE" && (
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                    Free
                  </span>
                )}
              </div>
              <div className="mt-1">
                <CategoryBadge
                  slug={project.category.slug}
                  name={project.category.name}
                  icon={project.category.icon}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4 leading-relaxed">
            {project.tagline}
          </p>
        </div>

        {/* Footer de la Card: Maker, Métricas y Botón de Voto */}
        <div className="pt-3 border-t border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 flex items-center justify-between gap-2">
          {/* Maker & Stats */}
          <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
            <Link
              href={`/user/${project.user.username}`}
              className="flex items-center gap-1.5 hover:text-[#17150F] dark:hover:text-[#FAF9F6] transition-colors"
              title={`By ${project.user.name || project.user.username}`}
            >
              <UserAvatar src={project.user.image} name={project.user.name} size="sm" />
              <span className="font-medium truncate max-w-[90px]">{project.user.username}</span>
            </Link>

            <span className="flex items-center gap-1 font-mono text-[11px]" title="Comments">
              <MessageSquare className="w-3.5 h-3.5" />
              {project.commentsCount}
            </span>

            <span className="flex items-center gap-1 font-mono text-[11px]" title="Views">
              <Eye className="w-3.5 h-3.5" />
              {project.viewsCount}
            </span>
          </div>

          {/* Voto */}
          <VoteButton
            projectId={project.id}
            initialVotesCount={project.votesCount}
            initialHasVoted={project.hasVoted}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
