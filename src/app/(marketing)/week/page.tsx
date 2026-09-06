import { getCachedRankings } from "@/server/services/ranking-service";
import { ProjectRow } from "@/components/project/ProjectRow";
import { RankingNavTabs } from "@/components/ranking/RankingNavTabs";
import { Calendar } from "lucide-react";

export const revalidate = 60;

export default async function WeekRankingPage() {
  const projects = await getCachedRankings("week", 50);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E4572E] uppercase tracking-wider">
          <Calendar className="w-4 h-4" />
          <span>Top in the Last 7 Days</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Weekly Leaders
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
          The best projects of the week ranked by community upvotes.
        </p>

        <RankingNavTabs />
      </div>

      <div className="space-y-3">
        {projects.map((project, idx) => (
          <ProjectRow key={project.id} project={project} rankIndex={idx + 1} />
        ))}
      </div>
    </div>
  );
}
