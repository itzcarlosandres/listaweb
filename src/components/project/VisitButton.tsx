"use client";

import { recordWebsiteClick } from "@/server/actions/analytics";
import { ExternalLink } from "lucide-react";

interface VisitButtonProps {
  projectId: string;
  websiteUrl: string;
  name: string;
  className?: string;
}

export function VisitButton({ projectId, websiteUrl, name, className = "" }: VisitButtonProps) {
  const handleClick = () => {
    // Disparo no bloqueante de tracking
    recordWebsiteClick(projectId);
  };

  return (
    <a
      href={websiteUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[#17150F] text-[#FAF9F6] dark:bg-[#FAF9F6] dark:text-[#17150F] hover:opacity-90 transition-all shadow-sm ${className}`}
      title={`Visitar sitio web oficial de ${name}`}
    >
      <span>Visitar sitio web</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  );
}
