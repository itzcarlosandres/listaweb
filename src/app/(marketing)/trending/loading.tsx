import { Skeleton } from "@/components/shared/Skeleton";
import { ProjectLeaderboardSkeleton } from "@/components/project/ProjectRowSkeleton";
import { Flame } from "lucide-react";

export default function TrendingLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500 uppercase tracking-wider">
          <Flame className="w-4 h-4" />
          <span>Real-Time Momentum Algorithm</span>
        </div>
        <Skeleton className="h-9 sm:h-11 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />

        {/* Tabs Skeleton */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      {/* Rows Leaderboard Skeleton */}
      <ProjectLeaderboardSkeleton count={8} />
    </div>
  );
}
