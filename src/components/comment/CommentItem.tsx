"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { UserAvatar } from "../shared/UserAvatar";
import { CommentForm } from "./CommentForm";
import { deleteComment } from "@/server/actions/comments";
import { Reply, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Role, Plan } from "@prisma/client";

export interface CommentWithUser {
  id: string;
  projectId: string;
  body: string;
  createdAt: Date | string;
  user: {
    id: string;
    name?: string | null;
    username: string;
    image?: string | null;
    role: Role;
    plan: Plan;
  };
  replies?: CommentWithUser[];
}

interface CommentItemProps {
  comment: CommentWithUser;
  projectId: string;
  projectOwnerId?: string;
}

export function CommentItem({
  comment,
  projectId,
  projectOwnerId,
}: CommentItemProps) {
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const isAuthor = session?.user?.id === comment.user.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const isMaker = projectOwnerId === comment.user.id;

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const handleDelete = () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?")) return;

    startDeleteTransition(async () => {
      const res = await deleteComment(comment.id);
      if (!res.success) {
        toast.error(res.error || "No se pudo eliminar el comentario");
      } else {
        toast.success("Comentario eliminado");
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-3 shadow-xs">
        {/* Header Comentario */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link href={`/user/${comment.user.username}`}>
              <UserAvatar
                src={comment.user.image}
                name={comment.user.name || comment.user.username}
                size="sm"
              />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/user/${comment.user.username}`}
                  className="text-xs font-bold text-[#17150F] dark:text-[#FAF9F6] hover:text-[#E4572E] transition-colors"
                >
                  {comment.user.name || comment.user.username}
                </Link>
                <span className="text-[11px] text-neutral-400 font-mono">
                  @{comment.user.username}
                </span>
                {isMaker && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#E4572E]/10 text-[#E4572E]">
                    Maker
                  </span>
                )}
                {comment.user.plan === "PRO" && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Sparkles className="w-2.5 h-2.5" />
                    Pro
                  </span>
                )}
              </div>
              <span className="text-[11px] text-neutral-400 font-mono block">
                {timeAgo}
              </span>
            </div>
          </div>

          {/* Acciones autor/admin */}
          {(isAuthor || isAdmin) && (
            <button
              onClick={handleDelete}
              disabled={isPendingDelete}
              className="text-neutral-400 hover:text-red-500 transition-colors p-1"
              title="Eliminar comentario"
            >
              {isPendingDelete ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Cuerpo del comentario */}
        <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-line font-normal">
          {comment.body}
        </p>

        {/* Botón Responder */}
        <div className="pt-1 flex items-center gap-4">
          <button
            onClick={() => setIsReplying(!isReplying)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-[#E4572E] transition-colors cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" />
            Responder
          </button>
        </div>

        {/* Formulario de respuesta inline */}
        {isReplying && (
          <div className="pt-3 border-t border-[#E7E4DB] dark:border-[#2E2B23]">
            <CommentForm
              projectId={projectId}
              parentId={comment.id}
              parentAuthorName={comment.user.username}
              onSuccess={() => setIsReplying(false)}
              onCancel={() => setIsReplying(false)}
              placeholder="Escribe tu respuesta..."
            />
          </div>
        )}
      </div>

      {/* Respuestas anidadas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-6 sm:pl-10 space-y-3 border-l-2 border-[#E7E4DB] dark:border-[#2E2B23] ml-3 sm:ml-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              projectId={projectId}
              projectOwnerId={projectOwnerId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
