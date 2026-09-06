"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addComment } from "@/server/actions/comments";
import { Send, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface CommentFormProps {
  projectId: string;
  parentId?: string;
  parentAuthorName?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export function CommentForm({
  projectId,
  parentId,
  parentAuthorName,
  onSuccess,
  onCancel,
  placeholder = "Write your thoughts, questions, or feedback about this project...",
}: CommentFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.info("Please sign in to leave a comment");
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (body.trim().length < 3) {
      toast.error("Comment must be at least 3 characters long");
      return;
    }

    startTransition(async () => {
      const res = await addComment({
        projectId,
        parentId,
        body,
      });

      if (!res.success) {
        toast.error(res.error || "Could not post comment");
      } else {
        toast.success("Comment published!");
        setBody("");
        if (onSuccess) onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {parentAuthorName && (
        <div className="flex items-center justify-between text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1.5 rounded-lg">
          <span>
            Replying to <strong>@{parentAuthorName}</strong>
          </span>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={placeholder}
          rows={parentId ? 2 : 3}
          maxLength={2000}
          className="w-full p-3.5 rounded-2xl text-xs sm:text-sm bg-white dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:border-[#E4572E] resize-none transition-colors"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono text-neutral-400">
          {body.length} / 2000 characters
        </span>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isPending || body.trim().length < 3}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                {parentId ? "Reply" : "Post Comment"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
