import Link from "next/link";
import { getCategoriesWithCounts } from "@/server/services/project-service";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import { Layers, ChevronRight, ArrowRight } from "lucide-react";

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
          <Layers className="w-4 h-4" />
          <span>Ecosystem & Taxonomy</span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          All Categories
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Explore projects grouped into specialized categories to find exactly what you need.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group p-6 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] card-hover flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-200 group-hover:bg-[#E4572E]/10 group-hover:text-[#E4572E] transition-colors">
                <CategoryIcon name={category.icon} className="w-6 h-6" />
              </div>
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {category._count.projects} projects
              </span>
            </div>

            <div>
              <h2 className="font-display font-bold text-lg text-[#17150F] dark:text-[#FAF9F6] group-hover:text-[#E4572E] transition-colors">
                {category.name}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="pt-2 flex items-center text-xs font-bold text-[#E4572E] group-hover:translate-x-1 transition-transform">
              Explore {category.name}
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
