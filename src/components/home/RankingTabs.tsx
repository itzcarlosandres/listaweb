"use client";

import { useState } from "react";
import { ProjectRow } from "../project/ProjectRow";
import { Trophy, Calendar, Sparkles } from "lucide-react";
import type { ProjectWithDetails } from "@/types";

interface RankingTabsProps {
  todayProjects: ProjectWithDetails[];
  weekProjects: ProjectWithDetails[];
  monthProjects: ProjectWithDetails[];
}

export function RankingTabs({
  todayProjects,
  weekProjects,
  monthProjects,
}: RankingTabsProps) {
  const [activeTab, setActiveTab] = useState<"today" | "week" | "month">("today");

  const projectsToDisplay =
    activeTab === "today"
      ? todayProjects
      : activeTab === "week"
      ? weekProjects
      : monthProjects;

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#17150F] dark:text-[#FAF9F6] whitespace-nowrap">
            Project Rankings
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="inline-flex p-1 rounded-xl bg-neutral-100 dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shrink-0">
          <button
            onClick={() => setActiveTab("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "today"
                ? "bg-white dark:bg-[#232019] text-[#17150F] dark:text-[#FAF9F6] shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-[#17150F] dark:hover:text-[#FAF9F6]"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "week"
                ? "bg-white dark:bg-[#232019] text-[#17150F] dark:text-[#FAF9F6] shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-[#17150F] dark:hover:text-[#FAF9F6]"
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "month"
                ? "bg-white dark:bg-[#232019] text-[#17150F] dark:text-[#FAF9F6] shadow-xs"
                : "text-neutral-600 dark:text-neutral-400 hover:text-[#17150F] dark:hover:text-[#FAF9F6]"
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Lista de filas */}
      <div className="space-y-3">
        {projectsToDisplay.length > 0 ? (
          projectsToDisplay.map((project, idx) => (
            <ProjectRow key={project.id} project={project} rankIndex={idx + 1} />
          ))
        ) : (
          <div className="text-center py-12 rounded-2xl border border-dashed border-[#E7E4DB] dark:border-[#2E2B23]">
            <p className="text-sm text-neutral-500">No projects registered for this period yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
