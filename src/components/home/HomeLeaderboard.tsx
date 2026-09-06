import Link from "next/link";
import { VoteButton } from "../project/VoteButton";
import { Trophy, ArrowRight, Flame } from "lucide-react";
import type { ProjectWithDetails } from "@/types";

interface HomeLeaderboardProps {
  projects: ProjectWithDetails[];
}

export function HomeLeaderboard({ projects }: HomeLeaderboardProps) {
  if (projects.length === 0) return null;

  const maxVotes = Math.max(...projects.map((p) => p.votesCount), 1);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-white to-[#FDFCFB] dark:from-[#1A1813] dark:to-[#14120D] border border-[#E7E4DB] dark:border-[#2E2B23] p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
              Leaderboard en Vivo de Hoy
            </h2>
            <p className="text-xs text-neutral-500">
              Los proyectos con mayor impacto y tracción en las últimas 24 horas
            </p>
          </div>
        </div>

        <Link
          href="/today"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#E4572E] hover:underline"
        >
          Ver todos
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3.5">
        {projects.slice(0, 5).map((project, idx) => {
          const votePercentage = Math.round((project.votesCount / maxVotes) * 100);

          return (
            <div
              key={project.id}
              className="relative p-3.5 rounded-2xl bg-[#FAF9F6] dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] hover:border-[#E4572E]/40 transition-all flex items-center justify-between gap-3 overflow-hidden group"
            >
              {/* Barra de progreso de fondo */}
              <div
                className="absolute inset-y-0 left-0 bg-[#E4572E]/5 dark:bg-[#E4572E]/10 transition-all duration-500 rounded-2xl pointer-events-none"
                style={{ width: `${votePercentage}%` }}
              />

              <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
                {/* Ranking index */}
                <div className="w-6 text-center font-mono font-bold text-xs text-neutral-400 group-hover:text-[#E4572E] shrink-0">
                  #{idx + 1}
                </div>

                {/* Logo */}
                {project.logoUrl ? (
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#E7E4DB] dark:border-[#2E2B23] shrink-0 bg-white dark:bg-[#1A1813]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.logoUrl}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#E4572E] text-white font-bold flex items-center justify-center shrink-0">
                    {project.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/project/${project.slug}`}
                      className="font-display font-bold text-sm text-[#17150F] dark:text-[#FAF9F6] hover:text-[#E4572E] transition-colors truncate"
                    >
                      {project.name}
                    </Link>
                    {idx === 0 && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Flame className="w-3 h-3" />
                        Top 1
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {project.tagline}
                  </p>
                </div>
              </div>

              <div className="relative z-10 shrink-0">
                <VoteButton
                  projectId={project.id}
                  initialVotesCount={project.votesCount}
                  initialHasVoted={project.hasVoted}
                  size="sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
