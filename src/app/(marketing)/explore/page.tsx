import { Suspense } from "react";
import { getExploreProjects } from "@/server/services/ranking-service";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { ExploreFilterBar } from "@/components/explore/ExploreFilterBar";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState } from "@/components/shared/EmptyState";
import { Compass, Sparkles } from "lucide-react";
import type { PricingType } from "@/types";

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    pricing?: string;
    tag?: string;
    tech?: string;
    sort?: "trending" | "newest" | "most-viewed";
    page?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const { items, totalCount, totalPages, hasNextPage, hasPrevPage, currentPage } =
    await getExploreProjects({
      query: params.q,
      category: params.category,
      pricing: params.pricing as PricingType | undefined,
      tag: params.tag,
      tech: params.tech,
      sort: params.sort,
      page,
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E4572E] uppercase tracking-wider">
          <Compass className="w-4 h-4" />
          <span>Directory & Catalog</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Explore Projects & Startups
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Filter through {totalCount} projects by category, pricing model, tech stack, or popularity.
        </p>
      </div>

      {/* Filter Bar */}
      <Suspense fallback={<div className="h-24 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />}>
        <ExploreFilterBar />
      </Suspense>

      {/* Results Count & Badges */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 font-mono">
        <span>Showing {items.length} of {totalCount} results</span>
        {params.tag && (
          <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            Tag Filter: #{params.tag}
          </span>
        )}
      </div>

      {/* Grid de Proyectos */}
      {items.length > 0 ? (
        <ProjectGrid projects={items} />
      ) : (
        <EmptyState
          title="No projects found"
          description="Try changing your search terms or clearing your filters to discover more projects."
          actionText="Submit a Project"
          actionHref="/submit"
        />
      )}

      {/* Paginación */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}
