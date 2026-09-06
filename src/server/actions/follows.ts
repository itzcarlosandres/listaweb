"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function toggleFollow(targetUserId: string): Promise<ActionResponse<{ following: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Debes iniciar sesión para seguir a creadores",
      };
    }

    const currentUserId = session.user.id;

    if (currentUserId === targetUserId) {
      return {
        success: false,
        error: "No puedes seguirte a ti mismo",
      };
    }

    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, username: true },
    });

    if (!targetUser) {
      return {
        success: false,
        error: "Usuario no encontrado",
      };
    }

    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    let following = false;

    if (existingFollow) {
      await db.follow.delete({
        where: { id: existingFollow.id },
      });
      following = false;
    } else {
      await db.$transaction([
        db.follow.create({
          data: {
            followerId: currentUserId,
            followingId: targetUserId,
          },
        }),
        db.notification.create({
          data: {
            userId: targetUserId,
            actorId: currentUserId,
            type: "FOLLOW",
          },
        }),
      ]);
      following = true;
    }

    revalidatePath(`/user/${targetUser.username}`);

    return {
      success: true,
      data: { following },
    };
  } catch (error) {
    console.error("Error al gestionar follow:", error);
    return {
      success: false,
      error: "Ocurrió un error al actualizar el seguimiento",
    };
  }
}
