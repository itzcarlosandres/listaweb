import { Skeleton } from "@/components/shared/Skeleton";

interface ProjectCardSkeletonProps {
  featuredWide?: boolean;
}

export function ProjectCardSkeleton({ featuredWide = false }: ProjectCardSkeletonProps) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] p-5 flex flex-col justify-between overflow-hidden shadow-2xs ${
        featuredWide ? "md:col-span-2 md:grid md:grid-cols-12 md:gap-6" : ""
      }`}
    >
      {featuredWide && (
        <div className="md:col-span-5 mb-4 md:mb-0">
          <Skeleton className="w-full aspect-video md:h-full rounded-xl" />
        </div>
      )}

      <div className={`flex flex-col justify-between ${featuredWide ? "md:col-span-7" : "h-full"} space-y-4`}>
        <div className="space-y-3">
          {/* Header con Logo y Título */}
          <div className="flex items-start gap-3.5">
            <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
            <div className="space-y-2 flex-1 pt-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-44" />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5 pt-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 pt-1">
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
        </div>

        {/* Footer con Creador y Botón de Voto */}
        <div className="pt-3 border-t border-[#E7E4DB]/60 dark:border-[#2E2B23]/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="w-16 h-9 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
