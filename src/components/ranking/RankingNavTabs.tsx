"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Calendar, Clock, Trophy } from "lucide-react";

export function RankingNavTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/trending", label: "🔥 Trending", icon: Flame },
    { href: "/today", label: "Today", icon: Clock },
    { href: "/week", label: "This Week", icon: Calendar },
    { href: "/month", label: "This Month", icon: Trophy },
  ];

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-100 dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] w-fit">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? "bg-white dark:bg-[#25221B] text-[#17150F] dark:text-[#FAF9F6] shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-[#17150F] dark:hover:text-[#FAF9F6]"
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#E4572E]" : "text-neutral-400"}`} />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
