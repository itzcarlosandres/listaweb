"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search, Filter, X } from "lucide-react";
import { CATEGORIES_SEED } from "@/lib/constants";

export function ExploreFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentCategory = searchParams.get("category") || "";
  const currentPricing = searchParams.get("pricing") || "";
  const currentSort = searchParams.get("sort") || "trending";
  const currentQuery = searchParams.get("q") || "";

  const [search, setSearch] = useState(currentQuery);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset a página 1 al cambiar filtros

    startTransition(() => {
      router.push(`/explore?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters("q", search);
  };

  const clearAllFilters = () => {
    setSearch("");
    startTransition(() => {
      router.push("/explore");
    });
  };

  const hasActiveFilters = Boolean(currentCategory || currentPricing || currentQuery || currentSort !== "trending");

  return (
    <div className="space-y-4 bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] p-4 sm:p-5 rounded-2xl shadow-xs">
      {/* Search Input + Sort */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, description, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:border-[#E4572E] transition-colors"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={currentSort}
            onChange={(e) => updateFilters("sort", e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E] transition-colors cursor-pointer"
          >
            <option value="trending">🔥 Top Voted (Trending)</option>
            <option value="newest">🚀 Newest</option>
            <option value="most-viewed">👁️ Most Viewed</option>
          </select>
        </div>
      </div>

      {/* Categorías y Filtros Rápidos */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E7E4DB]/60 dark:border-[#2E2B23]/60">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 mr-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </div>

        <button
          onClick={() => updateFilters("category", "")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            !currentCategory
              ? "bg-[#17150F] text-[#FAF9F6] dark:bg-[#FAF9F6] dark:text-[#17150F]"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
          }`}
        >
          All
        </button>

        {CATEGORIES_SEED.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => updateFilters("category", cat.slug)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              currentCategory === cat.slug
                ? "bg-[#E4572E] text-white"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Precios y Botón Limpiar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500">Pricing:</span>
          {[
            { label: "All", value: "" },
            { label: "Free", value: "FREE" },
            { label: "Freemium", value: "FREEMIUM" },
            { label: "Paid", value: "PAID" },
            { label: "Open Source", value: "OPEN_SOURCE" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => updateFilters("pricing", item.value)}
              className={`px-2.5 py-0.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                currentPricing === item.value
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:underline cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
