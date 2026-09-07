import { Skeleton } from "@/components/shared/Skeleton";

interface ProjectRowSkeletonProps {
  showRank?: boolean;
}

export function ProjectRowSkeleton({ showRank = true }: ProjectRowSkeletonProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 sm:p-4.5 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs">
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
        {showRank && <Skeleton className="w-6 h-5 shrink-0" />}

        {/* Logo */}
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28 sm:w-36" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-40 sm:w-64" />
        </div>
      </div>

      {/* Action / Vote */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <Skeleton className="hidden sm:block h-3.5 w-12" />
        <Skeleton className="w-14 sm:w-16 h-10 rounded-xl" />
      </div>
    </div>
  );
}

export function ProjectLeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectRowSkeleton key={i} showRank={true} />
      ))}
    </div>
  );
}
