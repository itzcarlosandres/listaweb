"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function toggleVote(projectId: string): Promise<ActionResponse<{ voted: boolean; votesCount: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Debes iniciar sesión para poder votar por este proyecto",
      };
    }

    const userId = session.user.id;

    // Rate limit: 1 voto cada 3 segundos por usuario
    const rl = checkRateLimit(`vote:${userId}`, 1, 0.33);
    if (!rl.success) {
      return {
        success: false,
        error: "Por favor espera unos segundos antes de volver a votar",
      };
    }

    // Comprobar existencia del proyecto
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, votesCount: true, status: true },
    });

    if (!project || project.status !== "APPROVED") {
      return {
        success: false,
        error: "El proyecto no está disponible para votación",
      };
    }

    // Verificar si ya ha votado
    const existingVote = await db.projectVote.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    let voted = false;
    let updatedVotesCount = project.votesCount;

    if (existingVote) {
      // Remover voto en transacción
      const result = await db.$transaction(async (tx) => {
        await tx.projectVote.delete({
          where: { id: existingVote.id },
        });

        const updated = await tx.project.update({
          where: { id: projectId },
          data: {
            votesCount: { decrement: 1 },
          },
          select: { votesCount: true },
        });

        return updated;
      });

      voted = false;
      updatedVotesCount = Math.max(0, result.votesCount);
    } else {
      // Agregar voto en transacción
      const result = await db.$transaction(async (tx) => {
        await tx.projectVote.create({
          data: {
            projectId,
            userId,
          },
        });

        const updated = await tx.project.update({
          where: { id: projectId },
          data: {
            votesCount: { increment: 1 },
          },
          select: { votesCount: true },
        });

        // Crear notificación si el votante no es el dueño del proyecto
        if (project.userId !== userId) {
          await tx.notification.create({
            data: {
              userId: project.userId,
              actorId: userId,
              projectId: project.id,
              type: "VOTE",
            },
          });
        }

        return updated;
      });

      voted = true;
      updatedVotesCount = result.votesCount;
    }

    // Revalidar páginas de rankings y proyecto
    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/trending");
    revalidatePath(`/project/${project.id}`);

    return {
      success: true,
      data: { voted, votesCount: updatedVotesCount },
    };
  } catch (error) {
    console.error("Error al procesar voto:", error);
    return {
      success: false,
      error: "Ocurrió un error al registrar el voto",
    };
  }
}
