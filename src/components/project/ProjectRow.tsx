import Link from "next/link";
import { VoteButton } from "./VoteButton";
import { CategoryBadge } from "../shared/CategoryBadge";
import { MessageSquare, Eye, Sparkles, Zap, ShieldCheck } from "lucide-react";
import type { ProjectWithDetails } from "@/types";

interface ProjectRowProps {
  project: ProjectWithDetails;
  rankIndex?: number;
  highlightPromoted?: boolean;
}

export function ProjectRow({ project, rankIndex, highlightPromoted = true }: ProjectRowProps) {
  const isBoosted = Boolean(project.boostedUntil && new Date(project.boostedUntil) > new Date());
  const isProMaker = project.user?.plan === "PRO";
  const isFeatured = Boolean(project.featured);
  const isVIP = highlightPromoted && (isBoosted || isProMaker || isFeatured);

  return (
    <div
      className={`group flex items-center justify-between gap-4 p-4 sm:p-4.5 rounded-2xl transition-all card-hover ${
        isVIP
          ? "bg-white dark:bg-[#1A1813] border-2 border-[#E4572E]/30 dark:border-[#E4572E]/40 shadow-xs ring-1 ring-[#E4572E]/10"
          : "bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B]"
      }`}
    >
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
        {/* Número de Ranking Mono */}
        {typeof rankIndex === "number" && (
          <div
            className={`w-7 text-center font-mono font-bold text-sm shrink-0 transition-colors ${
              isVIP
                ? "text-[#E4572E]"
                : "text-neutral-400 group-hover:text-[#E4572E]"
            }`}
          >
            {rankIndex < 10 ? `0${rankIndex}` : rankIndex}
          </div>
        )}

        {/* Logo */}
        <Link href={`/project/${project.slug}`} className="shrink-0">
          {project.logoUrl ? (
            <div
              className={`w-12 h-12 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center transition-all ${
                isVIP
                  ? "border border-[#E4572E]/40 shadow-xs"
                  : "border border-[#E8E5DC] dark:border-[#25221B] group-hover:border-[#E4572E]/40"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.logoUrl}
                alt={project.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[#E4572E] text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {project.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </Link>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/project/${project.slug}`}
              className="font-heading font-bold text-base text-neutral-900 dark:text-white hover:text-[#E4572E] dark:hover:text-[#E4572E] transition-colors truncate"
            >
              {project.name}
            </Link>

            {/* VIP Badges */}
            {isBoosted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E4572E] text-white shadow-2xs">
                <Zap className="w-2.5 h-2.5 fill-current" />
                Boosted
              </span>
            )}

            {!isBoosted && isProMaker && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
                <ShieldCheck className="w-2.5 h-2.5" />
                PRO
              </span>
            )}

            {!isBoosted && !isProMaker && isFeatured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500 text-white shadow-2xs">
                <Sparkles className="w-2.5 h-2.5" />
                Destacado
              </span>
            )}

            <CategoryBadge
              slug={project.category.slug}
              name={project.category.name}
              icon={project.category.icon}
              size="sm"
            />

            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
              {project.pricingType}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
            {project.tagline}
          </p>
        </div>
      </div>

      {/* Acciones & Voto */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2.5 text-xs text-neutral-400 font-mono pr-2">
          <span className="flex items-center gap-1" title="Comentarios">
            <MessageSquare className="w-3.5 h-3.5" />
            {project.commentsCount}
          </span>
          <span className="flex items-center gap-1" title="Visitas">
            <Eye className="w-3.5 h-3.5" />
            {project.viewsCount}
          </span>
        </div>

        <VoteButton
          projectId={project.id}
          initialVotesCount={project.votesCount}
          initialHasVoted={project.hasVoted}
          size="md"
        />
      </div>
    </div>
  );
}
