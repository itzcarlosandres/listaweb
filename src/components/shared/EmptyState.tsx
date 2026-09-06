import Link from "next/link";
import { FolderSearch, Plus, LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionText,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-[#1A1813] border border-dashed border-[#E7E4DB] dark:border-[#2E2B23] max-w-lg mx-auto space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display font-bold text-lg text-[#17150F] dark:text-[#FAF9F6]">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {actionText && actionHref && (
        <div className="pt-2">
          <Link
            href={actionHref}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            {actionText}
          </Link>
        </div>
      )}
    </div>
  );
}
