"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

export async function markAllNotificationsAsRead(): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error al marcar notificaciones:", error);
    return { success: false, error: "No se pudieron actualizar las notificaciones" };
  }
}

export async function markNotificationAsRead(id: string): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    await db.notification.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        read: true,
      },
    });

    revalidatePath("/dashboard/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    return { success: false, error: "No se pudo actualizar la notificación" };
  }
}
