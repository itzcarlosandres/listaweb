import { Skeleton } from "@/components/shared/Skeleton";

export function ProjectDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 animate-in fade-in duration-200">
      {/* 1. HERO SKELETON */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xs space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5 min-w-0 flex-1">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0" />
            <div className="space-y-3 min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-3 flex-wrap">
                <Skeleton className="h-7 sm:h-9 w-48 sm:w-64" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-4 pt-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Botón de Voto Hero */}
          <div className="shrink-0">
            <Skeleton className="w-24 h-16 rounded-2xl" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-[#E7E4DB] dark:border-[#2E2B23] flex flex-wrap items-center justify-end gap-3">
          <Skeleton className="w-32 h-10 rounded-xl" />
          <Skeleton className="w-24 h-10 rounded-xl" />
          <Skeleton className="w-24 h-10 rounded-xl" />
        </div>
      </div>

      {/* 2. GALLERY SKELETON */}
      <div className="space-y-3">
        <Skeleton className="w-full aspect-video rounded-3xl" />
        <div className="flex items-center gap-3 overflow-hidden">
          <Skeleton className="w-28 h-18 rounded-xl shrink-0" />
          <Skeleton className="w-28 h-18 rounded-xl shrink-0" />
          <Skeleton className="w-28 h-18 rounded-xl shrink-0" />
        </div>
      </div>

      {/* 3. CONTENT 2-COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Promoted Projects Skeleton */}
          <div className="p-5 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E4DB] dark:border-[#2E2B23]">
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-xl" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-2.5 w-36" />
                </div>
              </div>
              <Skeleton className="h-3 w-12" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-2.5 w-32" />
                    </div>
                  </div>
                  <Skeleton className="w-10 h-8 rounded-xl shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
