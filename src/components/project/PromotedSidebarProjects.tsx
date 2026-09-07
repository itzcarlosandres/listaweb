import Link from "next/link";
import { VoteButton } from "./VoteButton";
import { Zap, ShieldCheck, ArrowRight, Crown, ExternalLink } from "lucide-react";
import type { ProjectWithDetails } from "@/types";

interface PromotedSidebarProjectsProps {
  projects: ProjectWithDetails[];
}

export function PromotedSidebarProjects({ projects }: PromotedSidebarProjectsProps) {
  if (!projects || projects.length === 0) return null;

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1813] border-2 border-amber-500/25 dark:border-amber-500/30 space-y-4 shadow-sm ring-1 ring-amber-500/10">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E7E4DB] dark:border-[#2E2B23]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Crown className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-sm text-[#17150F] dark:text-[#FAF9F6]">
                Official Sponsors
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                VIP
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Verified featured launches
            </p>
          </div>
        </div>

        <Link
          href="/pricing"
          className="text-xs font-bold text-[#E4572E] hover:underline flex items-center gap-0.5 shrink-0"
        >
          <span>Sponsor</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Lista de proyectos */}
      <div className="space-y-3">
        {projects.slice(0, 5).map((p) => {
          const isBoosted = Boolean(p.boostedUntil && new Date(p.boostedUntil) > new Date());
          const isProMaker = p.user?.plan === "PRO";
          const isFeatured = Boolean(p.featured);

          return (
            <div
              key={p.id}
              className="flex items-center justify-between gap-3 p-2.5 rounded-2xl border border-transparent hover:border-amber-500/30 hover:bg-amber-500/[0.04] dark:hover:bg-amber-500/[0.06] transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Link href={`/project/${p.slug}`} className="shrink-0">
                  {p.logoUrl ? (
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-amber-500/20 flex items-center justify-center shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.logoUrl}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E4572E] to-amber-500 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Link
                      href={`/project/${p.slug}`}
                      className="font-display font-bold text-xs sm:text-sm text-[#17150F] dark:text-[#FAF9F6] group-hover:text-[#E4572E] dark:group-hover:text-[#E4572E] transition-colors truncate max-w-[130px]"
                    >
                      {p.name}
                    </Link>

                    {isFeatured ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white shrink-0 shadow-2xs">
                        <Crown className="w-2.5 h-2.5 fill-current" />
                        Sponsor
                      </span>
                    ) : isBoosted ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-[#E4572E] text-white shrink-0">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        Boost
                      </span>
                    ) : isProMaker ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-indigo-600 text-white shrink-0">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        PRO
                      </span>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {p.tagline}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {p.websiteUrl && (
                  <a
                    href={p.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
                    title="Visit website"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <VoteButton
                  projectId={p.id}
                  initialVotesCount={p.votesCount}
                  initialHasVoted={p.hasVoted}
                  size="sm"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini CTA Footer */}
      <div className="pt-2 border-t border-[#E7E4DB] dark:border-[#2E2B23]">
        <Link
          href="/pricing"
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-all text-xs font-semibold flex items-center justify-between border border-amber-500/20"
        >
          <span className="flex items-center gap-1.5">
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            Sponsor your product on LaunchHub
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
