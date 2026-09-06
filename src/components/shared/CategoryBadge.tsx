import Link from "next/link";
import { CategoryIcon } from "./CategoryIcon";

interface CategoryBadgeProps {
  slug: string;
  name: string;
  icon: string;
  size?: "sm" | "md";
  asLink?: boolean;
}

export function CategoryBadge({
  slug,
  name,
  icon,
  size = "sm",
  asLink = true,
}: CategoryBadgeProps) {
  const content = (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg border transition-colors ${
        size === "sm"
          ? "px-2 py-0.5 text-xs"
          : "px-3 py-1 text-sm"
      } bg-neutral-100 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300 border-[#E7E4DB] dark:border-[#2E2B23] hover:border-neutral-400 dark:hover:border-neutral-600 hover:text-neutral-900 dark:hover:text-white`}
    >
      <CategoryIcon name={icon} className={size === "sm" ? "w-3.5 h-3.5 text-neutral-500" : "w-4 h-4 text-neutral-500"} />
      {name}
    </span>
  );

  if (asLink) {
    return <Link href={`/category/${slug}`}>{content}</Link>;
  }

  return content;
}
