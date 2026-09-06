import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  FolderGit2,
  ChevronUp,
  Eye,
  Bookmark,
  Plus,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ProjectRow } from "@/components/project/ProjectRow";
import type { ProjectWithDetails } from "@/types";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const userId = session!.user.id;

  // Consultar proyectos del usuario y métricas agregadas
  const projects = await db.project.findMany({
    where: { userId },
    include: {
      category: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          role: true,
          plan: true,
        },
      },
      tags: { include: { tag: true } },
      technologies: { include: { technology: true } },
      votes: { where: { userId }, select: { id: true } },
      favorites: { where: { userId }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalProjects = projects.length;
  const approvedProjects = projects.filter((p) => p.status === "APPROVED").length;
  const pendingProjects = projects.filter((p) => p.status === "PENDING").length;
  const totalVotes = projects.reduce((acc, p) => acc + p.votesCount, 0);
  const totalViews = projects.reduce((acc, p) => acc + p.viewsCount, 0);
  const totalFavorites = projects.reduce((acc, p) => acc + p.favoritesCount, 0);

  const formattedProjects: ProjectWithDetails[] = projects.map((p) => ({
    ...p,
    screenshots: (p.screenshots as string[]) || [],
    hasVoted: Boolean(p.votes && p.votes.length > 0),
    hasFavorited: Boolean(p.favorites && p.favorites.length > 0),
  }));

  return (
    <div className="space-y-8">
      {/* Header Bienvenida */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
            Hello, {session?.user.name || session?.user.username} 👋
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Here is a snapshot of your projects&apos; performance and community traction.
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Submit New Project
        </Link>
      </div>

      {/* Tarjetas de Métricas KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            <FolderGit2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
              {totalProjects}
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              ({approvedProjects} approved)
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Upvotes</span>
            <ChevronUp className="w-4 h-4 text-[#E4572E] stroke-[3]" />
          </div>
          <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#E4572E]">
            {totalVotes}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
            {totalViews}
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Favorites</span>
            <Bookmark className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-mono font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
            {totalFavorites}
          </span>
        </div>
      </div>

      {/* Aviso de Proyectos Pendientes si hay */}
      {pendingProjects > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-300">
          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            You have <strong>{pendingProjects} project(s)</strong> under moderation review. You will receive a notification as soon as they are approved.
          </span>
        </div>
      )}

      {/* Tus Proyectos Recientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6]">
            Your Projects ({totalProjects})
          </h2>
          {totalProjects > 0 && (
            <Link
              href="/dashboard/projects"
              className="text-xs font-bold text-[#E4572E] hover:underline inline-flex items-center gap-1"
            >
              Manage all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {formattedProjects.length > 0 ? (
          <div className="space-y-3">
            {formattedProjects.slice(0, 5).map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-[#1A1813] border border-dashed border-[#E7E4DB] dark:border-[#2E2B23] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-bold text-base text-[#17150F] dark:text-[#FAF9F6]">
                You haven&apos;t launched any project yet
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Launch your first web, tool, or startup to gain exposure and feedback from the community.
              </p>
            </div>
            <Link
              href="/submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Submit my first project
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
