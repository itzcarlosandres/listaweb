"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { toggleVote } from "@/server/actions/votes";
import { toast } from "sonner";

interface VoteButtonProps {
  projectId: string;
  initialVotesCount: number;
  initialHasVoted?: boolean;
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
}

export function VoteButton({
  projectId,
  initialVotesCount,
  initialHasVoted = false,
  size = "md",
  className = "",
}: VoteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  const [votesCount, setVotesCount] = useState(initialVotesCount);
  const [isBumping, setIsBumping] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      toast.info("Please sign in to upvote this project");
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    // Optimistic Update
    const previousVoted = hasVoted;
    const previousCount = votesCount;
    const nextVoted = !hasVoted;
    const nextCount = nextVoted ? previousCount + 1 : Math.max(0, previousCount - 1);

    setHasVoted(nextVoted);
    setVotesCount(nextCount);
    if (nextVoted) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 300);
    }

    startTransition(async () => {
      const res = await toggleVote(projectId);
      if (!res.success) {
        // Revert on failure
        setHasVoted(previousVoted);
        setVotesCount(previousCount);
        toast.error(res.error || "Could not register your vote");
      } else if (res.data) {
        setHasVoted(res.data.voted);
        setVotesCount(res.data.votesCount);
      }
    });
  };

  if (size === "hero") {
    return (
      <button
        onClick={handleVote}
        disabled={isPending}
        className={`inline-flex flex-col items-center justify-center min-w-[90px] px-5 py-3.5 rounded-2xl font-bold border transition-all cursor-pointer select-none ${
          hasVoted
            ? "bg-[#E4572E] text-white border-[#E4572E] shadow-lg shadow-[#E4572E]/30"
            : "bg-white dark:bg-[#1A1813] text-[#17150F] dark:text-[#FAF9F6] border-[#E7E4DB] dark:border-[#2E2B23] hover:border-[#E4572E] hover:text-[#E4572E]"
        } ${isBumping ? "animate-bump" : ""} ${className}`}
      >
        <ChevronUp className={`w-6 h-6 stroke-[3] transition-transform ${hasVoted ? "-translate-y-0.5" : "group-hover:-translate-y-0.5"}`} />
        <span className="font-mono text-lg leading-tight mt-0.5">{votesCount}</span>
        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
          {hasVoted ? "Upvoted" : "Upvote"}
        </span>
      </button>
    );
  }

  if (size === "lg") {
    return (
      <button
        onClick={handleVote}
        disabled={isPending}
        className={`flex flex-col items-center justify-center w-14 h-16 rounded-xl border transition-all cursor-pointer select-none shrink-0 ${
          hasVoted
            ? "bg-[#E4572E] text-white border-[#E4572E] shadow-md shadow-[#E4572E]/25"
            : "bg-white dark:bg-[#1A1813] text-[#17150F] dark:text-[#FAF9F6] border-[#E7E4DB] dark:border-[#2E2B23] hover:border-[#E4572E] hover:text-[#E4572E]"
        } ${isBumping ? "animate-bump" : ""} ${className}`}
      >
        <ChevronUp className="w-5 h-5 stroke-[2.5]" />
        <span className="font-mono text-sm font-bold leading-none mt-1">{votesCount}</span>
      </button>
    );
  }

  if (size === "sm") {
    return (
      <button
        onClick={handleVote}
        disabled={isPending}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none shrink-0 ${
          hasVoted
            ? "bg-[#E4572E] text-white border-[#E4572E]"
            : "bg-white dark:bg-[#1A1813] text-neutral-700 dark:text-neutral-300 border-[#E7E4DB] dark:border-[#2E2B23] hover:border-[#E4572E] hover:text-[#E4572E]"
        } ${isBumping ? "animate-bump" : ""} ${className}`}
      >
        <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
        <span className="font-mono">{votesCount}</span>
      </button>
    );
  }

  // Default "md"
  return (
    <button
      onClick={handleVote}
      disabled={isPending}
      className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl border transition-all cursor-pointer select-none shrink-0 ${
        hasVoted
          ? "bg-[#E4572E] text-white border-[#E4572E] shadow-sm shadow-[#E4572E]/20"
          : "bg-white dark:bg-[#1A1813] text-neutral-700 dark:text-neutral-300 border-[#E7E4DB] dark:border-[#2E2B23] hover:border-[#E4572E] hover:text-[#E4572E]"
      } ${isBumping ? "animate-bump" : ""} ${className}`}
    >
      <ChevronUp className="w-4 h-4 stroke-[2.5]" />
      <span className="font-mono text-xs font-bold leading-none mt-0.5">{votesCount}</span>
    </button>
  );
}
