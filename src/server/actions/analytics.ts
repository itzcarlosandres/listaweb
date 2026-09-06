"use server";

import { db } from "@/lib/db";
import { headers } from "next/headers";
import crypto from "crypto";

/**
 * Registra una vista de proyecto deduplicada por visitorId anónimo diario (sha256(ip+ua+salt))
 */
export async function recordProjectView(projectId: string): Promise<void> {
  try {
    const headersList = await headers();
    const ip =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = headersList.get("user-agent") || "unknown";

    // Salto diario para evitar rastreo persistente entre días
    const today = new Date().toISOString().slice(0, 10);
    const salt = process.env.AUTH_SECRET || "launchhub_anonymous_salt";
    const rawString = `${ip}-${userAgent}-${today}-${salt}`;
    const visitorId = crypto.createHash("sha256").update(rawString).digest("hex");

    // Verificar si ya existe una vista de este visitante para este proyecto hoy
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingView = await db.projectView.findFirst({
      where: {
        projectId,
        visitorId,
        createdAt: { gte: startOfDay },
      },
    });

    if (!existingView) {
      await db.$transaction([
        db.projectView.create({
          data: {
            projectId,
            visitorId,
          },
        }),
        db.project.update({
          where: { id: projectId },
          data: { viewsCount: { increment: 1 } },
        }),
      ]);
    }
  } catch (error) {
    // Analytics nunca debe romper la carga de la página
    console.error("Error no bloqueante en recordProjectView:", error);
  }
}

/**
 * Registra un click en el enlace externo del sitio web
 */
export async function recordWebsiteClick(projectId: string): Promise<void> {
  try {
    await db.websiteClick.create({
      data: {
        projectId,
      },
    });
  } catch (error) {
    console.error("Error no bloqueante en recordWebsiteClick:", error);
  }
}
