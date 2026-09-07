import { Skeleton } from "@/components/shared/Skeleton";
import { ProjectGridSkeleton } from "@/components/project/ProjectGridSkeleton";

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-150">
      {/* Back link skeleton */}
      <Skeleton className="h-4 w-36" />

      {/* Hero Categoría Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23]">
        <div className="flex items-center gap-4">
          <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 sm:h-8 w-44" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>

      {/* Grid of Projects Skeleton */}
      <ProjectGridSkeleton count={6} />
    </div>
  );
}
