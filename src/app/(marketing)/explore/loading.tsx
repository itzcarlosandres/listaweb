import { Skeleton } from "@/components/shared/Skeleton";
import { ProjectGridSkeleton } from "@/components/project/ProjectGridSkeleton";
import { Compass } from "lucide-react";

export default function ExploreLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E4572E] uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Directory & Catalog</span>
        </div>
        <Skeleton className="h-9 sm:h-11 w-72 sm:w-96" />
        <Skeleton className="h-4 w-60 sm:w-80" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full sm:w-48 rounded-xl" />
        </div>
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E7E4DB]/60 dark:border-[#2E2B23]/60">
          <Skeleton className="h-7 w-12 rounded-lg" />
          <Skeleton className="h-7 w-16 rounded-lg" />
          <Skeleton className="h-7 w-20 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-24 rounded-lg" />
          <Skeleton className="h-7 w-18 rounded-lg" />
        </div>
      </div>

      {/* Results Count Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Grid of Projects Skeleton */}
      <ProjectGridSkeleton count={6} />
    </div>
  );
}
