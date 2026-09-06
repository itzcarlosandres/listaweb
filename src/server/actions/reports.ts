"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import type { ActionResponse } from "@/types";
import { ReportTarget, ReportType } from "@prisma/client";

const reportSchema = z.object({
  targetType: z.nativeEnum(ReportTarget),
  targetId: z.string().min(1),
  projectId: z.string().optional(),
  type: z.nativeEnum(ReportType),
  detail: z.string().max(1000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

export async function submitReport(input: ReportInput): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Debes iniciar sesión para poder enviar un reporte",
      };
    }

    const validated = reportSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Datos del reporte inválidos",
      };
    }

    const { targetType, targetId, projectId, type, detail } = validated.data;

    const report = await db.report.create({
      data: {
        targetType,
        targetId,
        projectId: projectId || (targetType === "PROJECT" ? targetId : undefined),
        reporterId: session.user.id,
        type,
        detail,
      },
      select: { id: true },
    });

    return {
      success: true,
      data: report,
    };
  } catch (error) {
    console.error("Error al enviar reporte:", error);
    return {
      success: false,
      error: "Ocurrió un error al enviar el reporte",
    };
  }
}
