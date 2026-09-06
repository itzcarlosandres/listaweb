import { ProjectSubmitWizard } from "@/components/project/ProjectSubmitWizard";
import { Sparkles, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Submit Project Free | LaunchHub",
  description: "Launch your SaaS, startup, app, or tool on LaunchHub in 4 simple steps. 100% free submission.",
};

export default function SubmitPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/10 text-[#E4572E] border border-[#E4572E]/20">
            <Sparkles className="w-3.5 h-3.5" />
            100% Free Submission (No Credit Card)
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Review & Pre-Approval
          </span>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#17150F] dark:text-[#FAF9F6] tracking-tight">
          Launch your product to the world
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Share your startup, SaaS, app, or tool with the community. All submissions are reviewed by our team before going live to ensure quality.
        </p>
      </div>

      {/* Wizard */}
      <ProjectSubmitWizard />
    </div>
  );
}
