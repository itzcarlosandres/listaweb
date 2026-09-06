"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function toggleFavorite(projectId: string): Promise<ActionResponse<{ favorited: boolean; favoritesCount: number }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Debes iniciar sesión para guardar proyectos en tus favoritos",
      };
    }

    const userId = session.user.id;

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, favoritesCount: true },
    });

    if (!project) {
      return {
        success: false,
        error: "Proyecto no encontrado",
      };
    }

    const existingFav = await db.favorite.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });

    let favorited = false;
    let updatedCount = project.favoritesCount;

    if (existingFav) {
      const res = await db.$transaction(async (tx) => {
        await tx.favorite.delete({
          where: { id: existingFav.id },
        });
        return await tx.project.update({
          where: { id: projectId },
          data: { favoritesCount: { decrement: 1 } },
          select: { favoritesCount: true },
        });
      });
      favorited = false;
      updatedCount = Math.max(0, res.favoritesCount);
    } else {
      const res = await db.$transaction(async (tx) => {
        await tx.favorite.create({
          data: { projectId, userId },
        });
        return await tx.project.update({
          where: { id: projectId },
          data: { favoritesCount: { increment: 1 } },
          select: { favoritesCount: true },
        });
      });
      favorited = true;
      updatedCount = res.favoritesCount;
    }

    revalidatePath("/dashboard/saved");
    revalidatePath(`/project/${projectId}`);

    return {
      success: true,
      data: { favorited, favoritesCount: updatedCount },
    };
  } catch (error) {
    console.error("Error al gestionar favorito:", error);
    return {
      success: false,
      error: "Ocurrió un error al guardar en favoritos",
    };
  }
}
