import Link from "next/link";
import { ProjectRow } from "@/components/project/ProjectRow";
import { Sparkles, Users, ArrowRight, Zap, Flame, Plus } from "lucide-react";
import type { ProjectWithDetails } from "@/types";

interface HomeProjectListProps {
  paidProjects: ProjectWithDetails[];
  communityProjects: ProjectWithDetails[];
}

export function HomeProjectList({
  paidProjects,
  communityProjects,
}: HomeProjectListProps) {
  return (
    <div className="space-y-12">
      {/* 1. SECCIÓN VIP / PROYECTOS DE PAGO (SIEMPRE ARRIBA) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E8E5DC] dark:border-[#25221B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center font-bold">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-neutral-900 dark:text-white tracking-tight">
                  Featured Launches
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
                  VIP Priority
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Boosted projects and PRO creators guaranteed at the top
              </p>
            </div>
          </div>

          <Link
            href="/pricing"
            className="text-xs font-bold text-[#E4572E] hover:underline inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Promote my app</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {paidProjects.length > 0 ? (
          <div className="space-y-3">
            {paidProjects.map((project, idx) => (
              <ProjectRow
                key={project.id}
                project={project}
                rankIndex={idx + 1}
                highlightPromoted={true}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-neutral-50 dark:bg-[#16140F] border border-dashed border-[#E8E5DC] dark:border-[#25221B] text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="font-heading font-bold text-sm text-neutral-900 dark:text-white">
                Be today's first featured launch
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Get a 24h Boost or activate PRO membership to pin your product at the absolute top of the feed.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Feature Project Now</span>
            </Link>
          </div>
        )}
      </div>

      {/* 2. BANNER INTERMEDIO DE CONVERSIÓN / UPSELL */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#17150F] via-[#211E16] to-[#17150F] text-white border border-[#E8E5DC]/20 dark:border-[#25221B] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5 text-center sm:text-left">
          <div className="w-10 h-10 rounded-xl bg-[#E4572E] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white">
              Want your project pinned at the top?
            </h3>
            <p className="text-xs text-neutral-300 mt-0.5">
              Multiply your views, votes, and clicks by claiming the #1 spot on the main feed.
            </p>
          </div>
        </div>

        <Link
          href="/pricing"
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shrink-0 shadow-xs active:scale-95"
        >
          Explore Boost Options
        </Link>
      </div>

      {/* 3. SECCIÓN COMUNIDAD / PROYECTOS GRATUITOS (SIEMPRE ABAJO) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#E8E5DC] dark:border-[#25221B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-neutral-900 dark:text-white tracking-tight">
                  Community Launches
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  Free Plan
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Products shared by the community ranked by organic traction
              </p>
            </div>
          </div>

          <Link
            href="/explore"
            className="text-xs font-bold text-[#E4572E] hover:underline inline-flex items-center gap-1"
          >
            <span>View full directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {communityProjects.length > 0 ? (
          <div className="space-y-3">
            {communityProjects.map((project, idx) => (
              <ProjectRow
                key={project.id}
                project={project}
                rankIndex={paidProjects.length + idx + 1}
                highlightPromoted={false}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-neutral-400">
            No community projects available at the moment.
          </div>
        )}

        {/* Ver más proyectos button */}
        <div className="pt-4 text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-800 dark:text-neutral-200 hover:border-[#E4572E] transition-all shadow-2xs"
          >
            <span>Explore All Projects ({communityProjects.length + paidProjects.length}+)</span>
            <ArrowRight className="w-4 h-4 text-[#E4572E]" />
          </Link>
        </div>
      </div>
    </div>
  );
}
