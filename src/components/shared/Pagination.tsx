"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPrevPage,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-8">
      {hasPrevPage ? (
        <Link
          href={createPageURL(currentPage - 1)}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] hover:border-[#E4572E] text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </span>
      )}

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
          const isCurrent = pageNum === currentPage;
          return (
            <Link
              key={pageNum}
              href={createPageURL(pageNum)}
              className={`w-9 h-9 rounded-xl font-mono text-xs font-bold flex items-center justify-center transition-colors ${
                isCurrent
                  ? "bg-[#E4572E] text-white shadow-xs"
                  : "bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-700 dark:text-neutral-300 hover:border-[#E4572E]"
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {hasNextPage ? (
        <Link
          href={createPageURL(currentPage + 1)}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] hover:border-[#E4572E] text-neutral-700 dark:text-neutral-300 transition-colors"
        >
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-600 cursor-not-allowed">
          Siguiente
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
