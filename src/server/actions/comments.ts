"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { commentSchema, type CommentInput } from "@/schemas/comment";
import { checkRateLimit } from "@/lib/rate-limit";
import sanitizeHtml from "sanitize-html";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function addComment(input: CommentInput): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Debes iniciar sesión para publicar un comentario",
      };
    }

    const userId = session.user.id;

    // Rate limit: 5 comentarios por minuto
    const rl = checkRateLimit(`comment:${userId}`, 5, 5 / 60);
    if (!rl.success) {
      return {
        success: false,
        error: "Estás comentando demasiado rápido. Por favor espera unos segundos.",
      };
    }

    const validated = commentSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Datos de comentario inválidos",
      };
    }

    const { projectId, parentId, body } = validated.data;

    // Sanitizar texto: remover etiquetas HTML y evitar inyecciones
    const cleanBody = sanitizeHtml(body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    });

    if (cleanBody.length < 3) {
      return {
        success: false,
        error: "El comentario no contiene texto válido",
      };
    }

    // Comprobar proyecto
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, slug: true },
    });

    if (!project) {
      return {
        success: false,
        error: "El proyecto no existe",
      };
    }

    // Si es respuesta anidada, comprobar comentario padre
    let parentCommentAuthorId: string | null = null;
    if (parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: parentId },
        select: { id: true, userId: true },
      });
      if (parentComment) {
        parentCommentAuthorId = parentComment.userId;
      }
    }

    // Crear comentario en transacción
    const newComment = await db.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data: {
          projectId,
          userId,
          parentId: parentId || null,
          body: cleanBody,
        },
        select: { id: true },
      });

      // Incrementar contador de comentarios en el proyecto
      await tx.project.update({
        where: { id: projectId },
        data: { commentsCount: { increment: 1 } },
      });

      // Notificar al dueño del proyecto si no es él mismo
      if (project.userId !== userId) {
        await tx.notification.create({
          data: {
            userId: project.userId,
            actorId: userId,
            projectId: project.id,
            type: "COMMENT",
          },
        });
      }

      // Si es respuesta anidada y el autor padre es distinto al dueño y al comentador actual, notificarle
      if (
        parentCommentAuthorId &&
        parentCommentAuthorId !== userId &&
        parentCommentAuthorId !== project.userId
      ) {
        await tx.notification.create({
          data: {
            userId: parentCommentAuthorId,
            actorId: userId,
            projectId: project.id,
            type: "COMMENT",
          },
        });
      }

      return comment;
    });

    revalidatePath(`/project/${project.slug}`);

    return {
      success: true,
      data: newComment,
    };
  } catch (error) {
    console.error("Error al publicar comentario:", error);
    return {
      success: false,
      error: "Ocurrió un error al guardar el comentario",
    };
  }
}

export async function deleteComment(commentId: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Debes iniciar sesión para realizar esta acción",
      };
    }

    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        userId: true,
        projectId: true,
        project: { select: { slug: true } },
      },
    });

    if (!comment) {
      return {
        success: false,
        error: "Comentario no encontrado",
      };
    }

    // Solo el autor o ADMIN pueden borrar
    const isAuthor = comment.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return {
        success: false,
        error: "No tienes permiso para eliminar este comentario",
      };
    }

    await db.$transaction([
      db.comment.delete({ where: { id: commentId } }),
      db.project.update({
        where: { id: comment.projectId },
        data: { commentsCount: { decrement: 1 } },
      }),
    ]);

    revalidatePath(`/project/${comment.project.slug}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    return {
      success: false,
      error: "No se pudo eliminar el comentario",
    };
  }
}
