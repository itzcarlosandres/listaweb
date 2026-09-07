"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectSubmitSchema, type ProjectSubmitInput } from "@/schemas/project";
import { slugify } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import { ProjectStatus, PricingType, ProductKind } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { renderProjectSubmittedEmail } from "@/lib/email-templates";
import { createCryptoCheckout } from "@/server/actions/payments";

export async function createProject(
  input: ProjectSubmitInput
): Promise<ActionResponse<{ id: string; slug: string; checkoutUrl?: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Debes iniciar sesión para publicar un proyecto",
      };
    }

    const userId = session.user.id;

    // Rate limit: 10 publicaciones por hora por usuario (exento para administradores)
    if (session.user.role !== "ADMIN") {
      const rl = checkRateLimit(`submit:${userId}`, 10, 10 / 3600);
      if (!rl.success) {
        return {
          success: false,
          error: "Has alcanzado el límite de publicaciones por hora. Inténtalo más tarde.",
        };
      }
    }

    // Anti-bot check: Honeypot & RenderTime >= 3s
    if (input.honeypot && input.honeypot.length > 0) {
      return { success: false, error: "Solicitud no permitida" };
    }
    if (input.renderTime && Date.now() - input.renderTime < 3000) {
      return { success: false, error: "Envío demasiado rápido. Por favor verifica los datos." };
    }

    // Limitación Plan Free: Máximo 1 proyecto
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        plan: true,
        role: true,
        _count: {
          select: {
            projects: {
              where: { status: { not: ProjectStatus.REJECTED } },
            },
          },
        },
      },
    });

    if (
      user &&
      user.plan === "FREE" &&
      user.role !== "ADMIN" &&
      user._count.projects >= 1 &&
      input.pricingType === "FREE"
    ) {
      return {
        success: false,
        error: "El Plan Free permite publicar hasta 1 proyecto gratuito. Si deseas publicar más proyectos o promocionarlo de inmediato, selecciona la opción de Pago.",
      };
    }

    const validated = projectSubmitSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Datos del proyecto inválidos",
      };
    }

    const {
      name,
      tagline,
      websiteUrl,
      categoryId,
      logoUrl,
      screenshots,
      description,
      tags,
      technologies,
      pricingType,
      projectType,
      country,
      launchDate,
    } = validated.data;

    // Generar slug con protección anti-colisión
    let baseSlug = slugify(name);
    if (!baseSlug) baseSlug = "proyecto";

    const existingSlug = await db.project.findUnique({ where: { slug: baseSlug } });
    const finalSlug = existingSlug ? `${baseSlug}-${createId().slice(0, 5)}` : baseSlug;

    // Resolver categoryId (soporta tanto CUID ID como slug de categoría)
    const category = await db.category.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { slug: categoryId },
        ],
      },
    });

    const finalCategoryId =
      category?.id ||
      (await db.category.findFirst({ orderBy: { order: "asc" } }))?.id;

    if (!finalCategoryId) {
      return {
        success: false,
        error: "No se encontró una categoría válida en el sistema",
      };
    }

    // Si el usuario es PRO o ADMIN, se aprueba automáticamente; si es FREE, pasa a revisión
    const isInstantApproval = user?.plan === "PRO" || user?.role === "ADMIN";
    const initialStatus = isInstantApproval ? ProjectStatus.APPROVED : ProjectStatus.PENDING;

    // Crear proyecto en transacción
    const project = await db.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          slug: finalSlug,
          name,
          tagline,
          description,
          websiteUrl,
          logoUrl: logoUrl || null,
          screenshots: screenshots || [],
          categoryId: finalCategoryId,
          pricingType,
          projectType,
          country: country || null,
          launchDate: launchDate ? new Date(launchDate) : new Date(),
          status: initialStatus,
          userId,
        },
      });

      // Conectar / Crear Tags
      for (const tagText of tags || []) {
        const tagSlug = slugify(tagText);
        if (!tagSlug) continue;

        const tag = await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { slug: tagSlug, name: tagText.trim() },
        });

        await tx.projectTag.create({
          data: { projectId: created.id, tagId: tag.id },
        });
      }

      // Conectar / Crear Tecnologías
      for (const techText of technologies || []) {
        const techSlug = slugify(techText);
        if (!techSlug) continue;

        const tech = await tx.technology.upsert({
          where: { slug: techSlug },
          update: {},
          create: { slug: techSlug, name: techText.trim() },
        });

        await tx.projectTechnology.create({
          data: { projectId: created.id, technologyId: tech.id },
        });
      }

      return created;
    });

    revalidatePath("/dashboard/projects");

    // Enviar confirmación de envío de proyecto (asíncrono y fail-safe)
    try {
      if (session?.user?.email) {
        const siteSetting = await db.systemSetting.findUnique({ where: { key: "SITE_URL" } });
        const siteUrl = siteSetting?.value || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://launchhub.dev";
        const emailData = renderProjectSubmittedEmail({
          creatorName: session.user.name || "Creator",
          projectName: project.name,
          siteUrl,
        });
        sendEmail({
          to: session.user.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }).catch((err) => console.error("Error sending project submission email:", err));
      }
    } catch (emailErr) {
      console.error("Error preparing project submission email:", emailErr);
    }

    let checkoutUrl: string | undefined;

    // Si seleccionó Pago, generar de inmediato la factura de NOWPayments para pagar y publicar
    if (pricingType === PricingType.PAID) {
      let product = null;
      if (validated.data.paidProductId) {
        product = await db.product.findFirst({
          where: {
            OR: [
              { id: validated.data.paidProductId },
              { slug: validated.data.paidProductId },
            ],
            active: true,
          },
        });
      }

      if (!product) {
        product = await db.product.findFirst({
          where: {
            kind: { in: [ProductKind.BOOST_7, ProductKind.BOOST_30, ProductKind.SPONSOR] },
            active: true,
          },
          orderBy: { priceCents: "asc" },
        });
      }

      if (product) {
        const checkoutRes = await createCryptoCheckout({
          productId: product.id,
          projectId: project.id,
        });

        if (checkoutRes.success && checkoutRes.data?.checkoutUrl) {
          checkoutUrl = checkoutRes.data.checkoutUrl;
        } else {
          console.error("Error al generar checkout de pago:", checkoutRes.error);
        }
      }
    }

    return {
      success: true,
      data: { id: project.id, slug: project.slug, checkoutUrl },
    };
  } catch (error) {
    console.error("Error al crear proyecto:", error);
    const errorMsg = error instanceof Error ? error.message : "Ocurrió un error inesperado al publicar el proyecto";
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function updateProject(
  projectId: string,
  input: ProjectSubmitInput
): Promise<ActionResponse<{ id: string; slug: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "No autorizado",
      };
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        tags: true,
        technologies: true,
      },
    });

    if (!project) {
      return { success: false, error: "Proyecto no encontrado" };
    }

    const isOwner = project.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return { success: false, error: "No tienes permisos para editar este proyecto" };
    }

    const validated = projectSubmitSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Datos inválidos",
      };
    }

    const {
      name,
      tagline,
      websiteUrl,
      categoryId,
      logoUrl,
      screenshots,
      description,
      tags,
      technologies,
      pricingType,
      projectType,
      country,
      launchDate,
    } = validated.data;

    // Resolver categoryId (soporta tanto CUID ID como slug de categoría)
    const category = await db.category.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { slug: categoryId },
        ],
      },
    });

    const finalCategoryId = category?.id || project.categoryId;

    // Si el proyecto estaba aprobado y el dueño no admin edita campos sensibles, vuelve a PENDING
    let nextStatus = project.status;
    if (project.status === "APPROVED" && !isAdmin) {
      if (
        project.name !== name ||
        project.tagline !== tagline ||
        project.description !== description ||
        project.websiteUrl !== websiteUrl
      ) {
        nextStatus = ProjectStatus.PENDING;
      }
    }

    await db.$transaction(async (tx) => {
      // Limpiar relaciones previas
      await tx.projectTag.deleteMany({ where: { projectId } });
      await tx.projectTechnology.deleteMany({ where: { projectId } });

      // Actualizar datos del proyecto
      await tx.project.update({
        where: { id: projectId },
        data: {
          name,
          tagline,
          description,
          websiteUrl,
          logoUrl: logoUrl || null,
          screenshots: screenshots || [],
          categoryId: finalCategoryId,
          pricingType,
          projectType,
          country: country || null,
          launchDate: launchDate ? new Date(launchDate) : project.launchDate,
          status: nextStatus,
        },
      });

      // Reconectar Tags
      for (const tagText of tags || []) {
        const tagSlug = slugify(tagText);
        if (!tagSlug) continue;
        const tag = await tx.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { slug: tagSlug, name: tagText.trim() },
        });
        await tx.projectTag.create({
          data: { projectId, tagId: tag.id },
        });
      }

      // Reconectar Tecnologías
      for (const techText of technologies || []) {
        const techSlug = slugify(techText);
        if (!techSlug) continue;
        const tech = await tx.technology.upsert({
          where: { slug: techSlug },
          update: {},
          create: { slug: techSlug, name: techText.trim() },
        });
        await tx.projectTechnology.create({
          data: { projectId, technologyId: tech.id },
        });
      }
    });

    revalidatePath(`/project/${project.slug}`);
    revalidatePath("/dashboard/projects");

    return {
      success: true,
      data: { id: project.id, slug: project.slug },
    };
  } catch (error) {
    console.error("Error al actualizar proyecto:", error);
    return {
      success: false,
      error: "Ocurrió un error al actualizar el proyecto",
    };
  }
}
