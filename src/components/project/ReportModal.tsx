"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Flag, X, Loader2, AlertCircle } from "lucide-react";
import { submitReport } from "@/server/actions/reports";
import { ReportType } from "@prisma/client";
import { toast } from "sonner";

interface ReportModalProps {
  projectId: string;
  projectName: string;
}

export function ReportModal({ projectId, projectName }: ReportModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reportType, setReportType] = useState<ReportType>(ReportType.SPAM);
  const [detail, setDetail] = useState("");

  const handleOpen = () => {
    if (!session?.user) {
      toast.info("Please sign in to report a project");
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitReport({
        targetType: "PROJECT",
        targetId: projectId,
        projectId,
        type: reportType,
        detail: detail.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || "Could not submit report");
      } else {
        toast.success("Report submitted to the moderation team. Thank you!");
        setIsOpen(false);
        setDetail("");
      }
    });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="w-10 h-10 rounded-xl border border-[#E7E4DB] dark:border-[#2E2B23] bg-white dark:bg-[#1A1813] text-neutral-400 hover:text-red-500 hover:border-red-400 flex items-center justify-center transition-colors cursor-pointer"
        title="Report project"
        aria-label="Report"
      >
        <Flag className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                <h3 className="font-display font-bold text-lg text-[#17150F] dark:text-[#FAF9F6]">
                  Report Project
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              You are reporting <strong>{projectName}</strong>. Please select a reason:
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Primary Reason
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
                >
                  <option value={ReportType.SPAM}>Spam or unwanted advertising</option>
                  <option value={ReportType.FAKE_PROJECT}>Fake or nonexistent project</option>
                  <option value={ReportType.SCAM}>Scam or fraudulent scheme</option>
                  <option value={ReportType.MALICIOUS}>Malicious software or phishing</option>
                  <option value={ReportType.COPYRIGHT}>Copyright or IP infringement</option>
                  <option value={ReportType.NSFW}>Explicit or inappropriate content</option>
                  <option value={ReportType.OTHER}>Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Additional details (optional)
                </label>
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Briefly explain why this project violates community guidelines..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:border-[#E4572E] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Report"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
