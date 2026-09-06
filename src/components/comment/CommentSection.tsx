import { db } from "@/lib/db";
import { CommentForm } from "./CommentForm";
import { CommentItem, type CommentWithUser } from "./CommentItem";
import { MessageSquare } from "lucide-react";

interface CommentSectionProps {
  projectId: string;
  projectOwnerId: string;
}

export async function CommentSection({
  projectId,
  projectOwnerId,
}: CommentSectionProps) {
  // Traer todos los comentarios visibles para este proyecto
  const comments = await db.comment.findMany({
    where: {
      projectId,
      status: "VISIBLE",
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          role: true,
          plan: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Construir árbol de comentarios raíz y respuestas anidadas
  const commentMap = new Map<string, CommentWithUser>();
  const rootComments: CommentWithUser[] = [];

  for (const c of comments) {
    commentMap.set(c.id, { ...c, replies: [] });
  }

  for (const c of comments) {
    const item = commentMap.get(c.id)!;
    if (c.parentId && commentMap.has(c.parentId)) {
      commentMap.get(c.parentId)!.replies!.push(item);
    } else {
      rootComments.push(item);
    }
  }

  return (
    <div className="space-y-8" id="comments">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[#17150F] dark:text-[#FAF9F6]">
            Community Discussion & Feedback
          </h2>
          <p className="text-xs text-neutral-500">
            {comments.length} {comments.length === 1 ? "comment" : "comments"} from the community
          </p>
        </div>
      </div>

      {/* Formulario para publicar comentario raíz */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xs">
        <h3 className="font-display font-bold text-sm text-[#17150F] dark:text-[#FAF9F6] mb-3">
          Leave your feedback or ask a question to the maker:
        </h3>
        <CommentForm projectId={projectId} />
      </div>

      {/* Lista de comentarios */}
      {rootComments.length > 0 ? (
        <div className="space-y-4">
          {rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
              projectOwnerId={projectOwnerId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 rounded-3xl bg-white dark:bg-[#1A1813] border border-dashed border-[#E7E4DB] dark:border-[#2E2B23]">
          <p className="text-xs sm:text-sm text-neutral-500">
            No comments yet. Be the first to leave constructive feedback for the maker!
          </p>
        </div>
      )}
    </div>
  );
}
