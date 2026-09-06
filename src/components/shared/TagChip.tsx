import Link from "next/link";

interface TagChipProps {
  slug: string;
  name: string;
  asLink?: boolean;
}

export function TagChip({ slug, name, asLink = true }: TagChipProps) {
  const content = (
    <span className="inline-flex items-center text-xs font-mono text-neutral-600 dark:text-neutral-400 bg-neutral-100/80 dark:bg-neutral-800/60 px-2 py-0.5 rounded-md hover:text-[#E4572E] dark:hover:text-[#E4572E] hover:bg-[#E4572E]/10 transition-colors">
      #{name}
    </span>
  );

  if (asLink) {
    return <Link href={`/explore?tag=${slug}`}>{content}</Link>;
  }

  return content;
}

interface TechnologyBadgeProps {
  slug: string;
  name: string;
  asLink?: boolean;
}

export function TechnologyBadge({ slug, name, asLink = true }: TechnologyBadgeProps) {
  const content = (
    <span className="inline-flex items-center text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] px-2 py-0.5 rounded-md hover:border-[#E4572E] transition-colors">
      {name}
    </span>
  );

  if (asLink) {
    return <Link href={`/explore?tech=${slug}`}>{content}</Link>;
  }

  return content;
}
