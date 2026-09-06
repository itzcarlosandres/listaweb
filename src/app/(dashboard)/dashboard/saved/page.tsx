import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { Bookmark } from "lucide-react";
import type { ProjectWithDetails } from "@/types";

export default async function SavedProjectsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const favorites = await db.favorite.findMany({
    where: {
      userId,
      project: { status: "APPROVED" },
    },
    include: {
      project: {
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
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const projects: ProjectWithDetails[] = favorites.map((f) => ({
    ...f.project,
    screenshots: (f.project.screenshots as string[]) || [],
    hasVoted: Boolean(f.project.votes && f.project.votes.length > 0),
    hasFavorited: true,
  }));

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">
          <Bookmark className="w-4 h-4" />
          <span>Personal Collection</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
          Saved Projects ({projects.length})
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Your favorite tools, apps, and platforms bookmarked for fast access.
        </p>
      </div>

      {projects.length > 0 ? (
        <ProjectGrid projects={projects} />
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved projects yet"
          description="Browse projects and click the bookmark icon on any card to save it to your personal collection."
          actionText="Explore Projects"
          actionHref="/explore"
        />
      )}
    </div>
  );
}
