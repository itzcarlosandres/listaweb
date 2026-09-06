"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";
import {
  Role,
  Plan,
  ProductKind,
  ProjectStatus,
  ReportStatus,
  AdminActionType,
  FeaturedPlacement,
} from "@prisma/client";
import { getSmtpConfig, sendEmail, testSmtpConnection } from "@/lib/email";
import { renderProjectApprovedEmail } from "@/lib/email-templates";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("No autorizado: se requieren permisos de administrador");
  }
  return session.user;
}

export async function approveProject(projectId: string): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, name: true, slug: true },
    });

    if (!project) return { success: false, error: "Proyecto no encontrado" };

    await db.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          status: ProjectStatus.APPROVED,
          rejectionReason: null,
        },
      });

      // Registrar acción de auditoría
      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.APPROVE,
          targetType: "PROJECT",
          targetId: projectId,
          detail: `Proyecto "${project.name}" aprobado para publicación pública`,
        },
      });

      // Notificar al dueño
      await tx.notification.create({
        data: {
          userId: project.userId,
          actorId: admin.id,
          projectId: project.id,
          type: "PROJECT_APPROVED",
        },
      });
    });

    // Enviar notificación por correo al creador (asíncrono y fail-safe)
    try {
      const owner = await db.user.findUnique({
        where: { id: project.userId },
        select: { name: true, email: true },
      });
      if (owner?.email) {
        const siteSetting = await db.systemSetting.findUnique({ where: { key: "SITE_URL" } });
        const siteUrl = siteSetting?.value || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://launchhub.dev";
        const emailData = renderProjectApprovedEmail({
          creatorName: owner.name || "Creator",
          projectName: project.name,
          projectSlug: project.slug,
          siteUrl,
        });
        sendEmail({
          to: owner.email,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        }).catch((err) => console.error("Error sending project approval email:", err));
      }
    } catch (emailErr) {
      console.error("Error dispatching project approval email:", emailErr);
    }

    revalidatePath("/admin/submissions");
    revalidatePath("/admin/projects");
    revalidatePath(`/project/${project.slug}`);
    revalidatePath("/");
    revalidatePath("/explore");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error al aprobar proyecto:", error);
    const message = error instanceof Error ? error.message : "Error al procesar la aprobación";
    return { success: false, error: message };
  }
}

export async function rejectProject(projectId: string, reason: string): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, name: true },
    });

    if (!project) return { success: false, error: "Proyecto no encontrado" };

    await db.$transaction(async (tx) => {
      await tx.project.update({
        where: { id: projectId },
        data: {
          status: ProjectStatus.REJECTED,
          rejectionReason: reason,
        },
      });

      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.REJECT,
          targetType: "PROJECT",
          targetId: projectId,
          detail: `Rechazado con motivo: ${reason}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: project.userId,
          actorId: admin.id,
          projectId: project.id,
          type: "PROJECT_REJECTED",
        },
      });
    });

    revalidatePath("/admin/submissions");
    revalidatePath("/admin/projects");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error al rechazar proyecto:", error);
    const message = error instanceof Error ? error.message : "Error al procesar el rechazo";
    return { success: false, error: message };
  }
}

export async function suspendProject(projectId: string, reason: string): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    await db.$transaction([
      db.project.update({
        where: { id: projectId },
        data: {
          status: ProjectStatus.SUSPENDED,
          rejectionReason: reason,
        },
      }),
      db.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.SUSPEND,
          targetType: "PROJECT",
          targetId: projectId,
          detail: `Suspendido con motivo: ${reason}`,
        },
      }),
    ]);

    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al suspender proyecto";
    return { success: false, error: message };
  }
}

export async function featureProject(
  projectId: string,
  placement: FeaturedPlacement = "HOME_HERO",
  days = 7
): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + days * 24 * 60 * 60 * 1000);

    await db.$transaction([
      db.project.update({
        where: { id: projectId },
        data: { featured: true },
      }),
      db.featuredProject.create({
        data: {
          projectId,
          placement,
          startsAt,
          endsAt,
        },
      }),
      db.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.FEATURE,
          targetType: "PROJECT",
          targetId: projectId,
          detail: `Destacado en ${placement} por ${days} días`,
        },
      }),
    ]);

    revalidatePath("/admin/projects");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al destacar proyecto";
    return { success: false, error: message };
  }
}

export async function resolveReport(
  reportId: string,
  status: ReportStatus,
  resolutionDetail?: string
): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    await db.$transaction([
      db.report.update({
        where: { id: reportId },
        data: { status },
      }),
      db.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.RESOLVE_REPORT,
          targetType: "REPORT",
          targetId: reportId,
          detail: `Reporte ${status}: ${resolutionDetail || "Sin notas adicionales"}`,
        },
      }),
    ]);

    revalidatePath("/admin/reports");
    revalidatePath("/admin");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al resolver reporte";
    return { success: false, error: message };
  }
}

export async function updateUserRole(targetUserId: string, role: Role): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    await db.$transaction([
      db.user.update({
        where: { id: targetUserId },
        data: { role },
      }),
      db.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.EDIT,
          targetType: "USER",
          targetId: targetUserId,
          detail: `Rol cambiado a ${role}`,
        },
      }),
    ]);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al cambiar rol";
    return { success: false, error: message };
  }
}

export async function updateUserPlan(targetUserId: string, plan: Plan): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    await db.$transaction([
      db.user.update({
        where: { id: targetUserId },
        data: { plan },
      }),
      db.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.EDIT,
          targetType: "USER",
          targetId: targetUserId,
          detail: `Plan cambiado a ${plan}`,
        },
      }),
    ]);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al cambiar plan";
    return { success: false, error: message };
  }
}

export interface RankingSettingsInput {
  voteWeight: number;
  commentWeight: number;
  boostBonus: number;
  decayExponent: number;
  viewDivisor: number;
}

export async function getRankingSettings(): Promise<RankingSettingsInput> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            "RANK_VOTE_WEIGHT",
            "RANK_COMMENT_WEIGHT",
            "RANK_BOOST_BONUS",
            "RANK_DECAY_EXPONENT",
            "RANK_VIEW_DIVISOR",
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, parseFloat(s.value)]));

    return {
      voteWeight: map.get("RANK_VOTE_WEIGHT") ?? 4.0,
      commentWeight: map.get("RANK_COMMENT_WEIGHT") ?? 5.0,
      boostBonus: map.get("RANK_BOOST_BONUS") ?? 100.0,
      decayExponent: map.get("RANK_DECAY_EXPONENT") ?? 0.4,
      viewDivisor: map.get("RANK_VIEW_DIVISOR") ?? 10.0,
    };
  } catch (error) {
    console.error("Error getting ranking settings:", error);
    return {
      voteWeight: 4.0,
      commentWeight: 5.0,
      boostBonus: 100.0,
      decayExponent: 0.4,
      viewDivisor: 10.0,
    };
  }
}

export async function updateRankingSettings(input: RankingSettingsInput): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const pairs: [string, number][] = [
      ["RANK_VOTE_WEIGHT", input.voteWeight],
      ["RANK_COMMENT_WEIGHT", input.commentWeight],
      ["RANK_BOOST_BONUS", input.boostBonus],
      ["RANK_DECAY_EXPONENT", input.decayExponent],
      ["RANK_VIEW_DIVISOR", input.viewDivisor],
    ];

    await db.$transaction(async (tx) => {
      for (const [key, value] of pairs) {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value: value.toString() },
          create: { key, value: value.toString(), description: `Parámetro de ranking: ${key}` },
        });
      }

      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.EDIT,
          targetType: "SYSTEM_SETTING",
          targetId: "RANKING_ALGORITHM",
          detail: `Parámetros actualizados: Votos x${input.voteWeight}, Comentarios x${input.commentWeight}, Boost +${input.boostBonus}, Decay ${input.decayExponent}`,
        },
      });
    });

    revalidatePath("/admin/settings");
    revalidatePath("/trending");
    revalidatePath("/today");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar parámetros";
    return { success: false, error: message };
  }
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    slug: string;
    kind: ProductKind;
    priceCents: number;
    currency?: string;
    active?: boolean;
  }
): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const updated = await db.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        kind: data.kind,
        priceCents: data.priceCents,
        currency: data.currency || "USD",
        active: data.active ?? true,
      },
    });

    await db.adminAction.create({
      data: {
        adminId: admin.id,
        action: AdminActionType.EDIT,
        targetType: "PRODUCT",
        targetId: id,
        detail: `Producto "${updated.name}" actualizado. Precio: $${(updated.priceCents / 100).toFixed(2)} USD`,
      },
    });

    revalidatePath("/admin/plans");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al actualizar producto";
    return { success: false, error: message };
  }
}

export async function createProduct(data: {
  name: string;
  slug: string;
  kind: ProductKind;
  priceCents: number;
  currency?: string;
  active?: boolean;
}): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const created = await db.product.create({
      data: {
        name: data.name,
        slug: data.slug.toLowerCase().trim(),
        kind: data.kind,
        priceCents: data.priceCents,
        currency: data.currency || "USD",
        active: data.active ?? true,
      },
    });

    await db.adminAction.create({
      data: {
        adminId: admin.id,
        action: AdminActionType.EDIT,
        targetType: "PRODUCT",
        targetId: created.id,
        detail: `Nuevo producto "${created.name}" creado. Precio: $${(created.priceCents / 100).toFixed(2)} USD`,
      },
    });

    revalidatePath("/admin/plans");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al crear producto";
    return { success: false, error: message };
  }
}

export async function toggleProductActive(id: string): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, error: "Producto no encontrado" };

    const updated = await db.product.update({
      where: { id },
      data: { active: !product.active },
    });

    await db.adminAction.create({
      data: {
        adminId: admin.id,
        action: AdminActionType.EDIT,
        targetType: "PRODUCT",
        targetId: id,
        detail: `Estado de "${updated.name}" cambiado a ${updated.active ? "ACTIVO" : "INACTIVO"}`,
      },
    });

    revalidatePath("/admin/plans");
    revalidatePath("/pricing");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al cambiar estado del producto";
    return { success: false, error: message };
  }
}

export interface PaymentGatewaySettingsInput {
  nowpaymentsApiKey: string;
  nowpaymentsIpnSecret: string;
  nowpaymentsSandbox: boolean;
  nowpaymentsEnabled: boolean;
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  stripeEnabled: boolean;
}

export async function getPaymentGatewaySettings(): Promise<PaymentGatewaySettingsInput> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            "NOWPAYMENTS_API_KEY",
            "NOWPAYMENTS_IPN_SECRET",
            "NOWPAYMENTS_SANDBOX",
            "NOWPAYMENTS_ENABLED",
            "STRIPE_SECRET_KEY",
            "STRIPE_PUBLISHABLE_KEY",
            "STRIPE_WEBHOOK_SECRET",
            "STRIPE_ENABLED",
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      nowpaymentsApiKey: map.get("NOWPAYMENTS_API_KEY") || process.env.NOWPAYMENTS_API_KEY || "",
      nowpaymentsIpnSecret: map.get("NOWPAYMENTS_IPN_SECRET") || process.env.NOWPAYMENTS_IPN_SECRET || "",
      nowpaymentsSandbox: (map.get("NOWPAYMENTS_SANDBOX") || process.env.NOWPAYMENTS_SANDBOX) === "true",
      nowpaymentsEnabled: (map.get("NOWPAYMENTS_ENABLED") ?? "true") === "true",
      stripeSecretKey: map.get("STRIPE_SECRET_KEY") || process.env.STRIPE_SECRET_KEY || "",
      stripePublishableKey: map.get("STRIPE_PUBLISHABLE_KEY") || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
      stripeWebhookSecret: map.get("STRIPE_WEBHOOK_SECRET") || process.env.STRIPE_WEBHOOK_SECRET || "",
      stripeEnabled: (map.get("STRIPE_ENABLED") ?? "false") === "true",
    };
  } catch (error) {
    console.error("Error getting payment gateway settings:", error);
    return {
      nowpaymentsApiKey: process.env.NOWPAYMENTS_API_KEY || "",
      nowpaymentsIpnSecret: process.env.NOWPAYMENTS_IPN_SECRET || "",
      nowpaymentsSandbox: process.env.NOWPAYMENTS_SANDBOX === "true",
      nowpaymentsEnabled: true,
      stripeSecretKey: "",
      stripePublishableKey: "",
      stripeWebhookSecret: "",
      stripeEnabled: false,
    };
  }
}

export async function updatePaymentGatewaySettings(
  input: PaymentGatewaySettingsInput
): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const pairs: [string, string][] = [
      ["NOWPAYMENTS_API_KEY", input.nowpaymentsApiKey.trim()],
      ["NOWPAYMENTS_IPN_SECRET", input.nowpaymentsIpnSecret.trim()],
      ["NOWPAYMENTS_SANDBOX", input.nowpaymentsSandbox ? "true" : "false"],
      ["NOWPAYMENTS_ENABLED", input.nowpaymentsEnabled ? "true" : "false"],
      ["STRIPE_SECRET_KEY", input.stripeSecretKey.trim()],
      ["STRIPE_PUBLISHABLE_KEY", input.stripePublishableKey.trim()],
      ["STRIPE_WEBHOOK_SECRET", input.stripeWebhookSecret.trim()],
      ["STRIPE_ENABLED", input.stripeEnabled ? "true" : "false"],
    ];

    await db.$transaction(async (tx) => {
      for (const [key, value] of pairs) {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, description: `Configuración de pasarela de pago: ${key}` },
        });
      }

      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.EDIT,
          targetType: "SYSTEM_SETTING",
          targetId: "PAYMENT_GATEWAYS",
          detail: `Configuración de pasarelas de pago actualizada (NOWPayments: ${
            input.nowpaymentsEnabled ? "ACTIVO" : "INACTIVO"
          }, Stripe: ${input.stripeEnabled ? "ACTIVO" : "INACTIVO"})`,
        },
      });
    });

    revalidatePath("/admin/settings");
    revalidatePath("/pricing");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar configuración de pagos";
    return { success: false, error: message };
  }
}

export interface GeneralSeoSettingsInput {
  siteName: string;
  siteTagline: string;
  siteUrl: string;
  logoMode: "image" | "text_icon" | "text";
  logoIcon: string;
  logoText: string;
  logoTextHighlight: string;
  logoIconBg: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  twitterHandle: string;
  googleAnalyticsId: string;
  googleSiteVerification: string;
  allowIndexing: boolean;
}

export async function getGeneralSeoSettings(): Promise<GeneralSeoSettingsInput> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            "SITE_NAME",
            "SITE_TAGLINE",
            "SITE_URL",
            "SITE_LOGO_MODE",
            "SITE_LOGO_ICON",
            "SITE_LOGO_TEXT",
            "SITE_LOGO_TEXT_HIGHLIGHT",
            "SITE_LOGO_ICON_BG",
            "SITE_LOGO_URL",
            "SITE_FAVICON_URL",
            "SITE_OG_IMAGE_URL",
            "SEO_META_TITLE",
            "SEO_META_DESCRIPTION",
            "SEO_META_KEYWORDS",
            "SEO_TWITTER_HANDLE",
            "SEO_GOOGLE_ANALYTICS_ID",
            "SEO_GOOGLE_SITE_VERIFICATION",
            "SEO_ALLOW_INDEXING",
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      siteName: map.get("SITE_NAME") || "LaunchHub",
      siteTagline: map.get("SITE_TAGLINE") || "La plataforma definitiva de lanzamientos en español",
      siteUrl: map.get("SITE_URL") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      logoMode: (map.get("SITE_LOGO_MODE") as "image" | "text_icon" | "text") || "text_icon",
      logoIcon: map.get("SITE_LOGO_ICON") || "Rocket",
      logoText: map.get("SITE_LOGO_TEXT") || "Launch",
      logoTextHighlight: map.get("SITE_LOGO_TEXT_HIGHLIGHT") || "Hub",
      logoIconBg: map.get("SITE_LOGO_ICON_BG") || "#E4572E",
      logoUrl: map.get("SITE_LOGO_URL") || "",
      faviconUrl: map.get("SITE_FAVICON_URL") || "",
      ogImageUrl: map.get("SITE_OG_IMAGE_URL") || "",
      metaTitle: map.get("SEO_META_TITLE") || "LaunchHub — Descubre lo que están construyendo",
      metaDescription:
        map.get("SEO_META_DESCRIPTION") ||
        "Explora diariamente nuevas herramientas de IA, SaaS, aplicaciones y startups creadas por desarrolladores y emprendedores.",
      metaKeywords:
        map.get("SEO_META_KEYWORDS") ||
        "saas, startups, herramientas, inteligencia artificial, software, lanzamientos, directorio, creadores",
      twitterHandle: map.get("SEO_TWITTER_HANDLE") || "@launchhub",
      googleAnalyticsId: map.get("SEO_GOOGLE_ANALYTICS_ID") || "",
      googleSiteVerification: map.get("SEO_GOOGLE_SITE_VERIFICATION") || "",
      allowIndexing: (map.get("SEO_ALLOW_INDEXING") ?? "true") === "true",
    };
  } catch (error) {
    console.error("Error getting general SEO settings:", error);
    return {
      siteName: "LaunchHub",
      siteTagline: "La plataforma definitiva de lanzamientos en español",
      siteUrl: "http://localhost:3000",
      logoMode: "text_icon",
      logoIcon: "Rocket",
      logoText: "Launch",
      logoTextHighlight: "Hub",
      logoIconBg: "#E4572E",
      logoUrl: "",
      faviconUrl: "",
      ogImageUrl: "",
      metaTitle: "LaunchHub — Descubre lo que están construyendo",
      metaDescription:
        "Explora diariamente nuevas herramientas de IA, SaaS, aplicaciones y startups creadas por desarrolladores y emprendedores.",
      metaKeywords: "saas, startups, herramientas, inteligencia artificial, software, lanzamientos, directorio, creadores",
      twitterHandle: "@launchhub",
      googleAnalyticsId: "",
      googleSiteVerification: "",
      allowIndexing: true,
    };
  }
}

export async function updateGeneralSeoSettings(
  input: GeneralSeoSettingsInput
): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const pairs: [string, string][] = [
      ["SITE_NAME", input.siteName.trim()],
      ["SITE_TAGLINE", input.siteTagline.trim()],
      ["SITE_URL", input.siteUrl.trim()],
      ["SITE_LOGO_MODE", input.logoMode || "text_icon"],
      ["SITE_LOGO_ICON", input.logoIcon || "Rocket"],
      ["SITE_LOGO_TEXT", input.logoText.trim()],
      ["SITE_LOGO_TEXT_HIGHLIGHT", input.logoTextHighlight.trim()],
      ["SITE_LOGO_ICON_BG", input.logoIconBg || "#E4572E"],
      ["SITE_LOGO_URL", input.logoUrl.trim()],
      ["SITE_FAVICON_URL", input.faviconUrl.trim()],
      ["SITE_OG_IMAGE_URL", input.ogImageUrl.trim()],
      ["SEO_META_TITLE", input.metaTitle.trim()],
      ["SEO_META_DESCRIPTION", input.metaDescription.trim()],
      ["SEO_META_KEYWORDS", input.metaKeywords.trim()],
      ["SEO_TWITTER_HANDLE", input.twitterHandle.trim()],
      ["SEO_GOOGLE_ANALYTICS_ID", input.googleAnalyticsId.trim()],
      ["SEO_GOOGLE_SITE_VERIFICATION", input.googleSiteVerification.trim()],
      ["SEO_ALLOW_INDEXING", input.allowIndexing ? "true" : "false"],
    ];

    await db.$transaction(async (tx) => {
      for (const [key, value] of pairs) {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, description: `Configuración SEO y Marca: ${key}` },
        });
      }

      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.EDIT,
          targetType: "SYSTEM_SETTING",
          targetId: "SEO_BRANDING",
          detail: `Configuración de Marca, Logo (Modo: ${input.logoMode}) y SEO actualizada (Sitio: ${input.siteName}, Indexación: ${
            input.allowIndexing ? "ACTIVA" : "BLOQUEADA"
          })`,
        },
      });
    });

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
    revalidatePath("/(marketing)", "layout");
    revalidatePath("/admin", "layout");
    revalidatePath("/(auth)", "layout");

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar configuración de SEO";
    return { success: false, error: message };
  }
}

export interface SmtpSettingsInput {
  host: string;
  port: number;
  user: string;
  password?: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
  enabled: boolean;
}

export async function getSmtpSettings(): Promise<SmtpSettingsInput> {
  try {
    return await getSmtpConfig();
  } catch (error) {
    console.error("Error getting SMTP settings:", error);
    return {
      host: "",
      port: 587,
      user: "",
      password: "",
      secure: false,
      fromName: "LaunchHub",
      fromEmail: "noreply@launchhub.dev",
      enabled: false,
    };
  }
}

export async function updateSmtpSettings(input: SmtpSettingsInput): Promise<ActionResponse> {
  try {
    const admin = await requireAdmin();

    const pairs: [string, string][] = [
      ["SMTP_HOST", input.host.trim()],
      ["SMTP_PORT", String(input.port || 587)],
      ["SMTP_USER", input.user.trim()],
      ["SMTP_SECURE", input.secure ? "true" : "false"],
      ["SMTP_FROM_NAME", input.fromName.trim() || "LaunchHub"],
      ["SMTP_FROM_EMAIL", input.fromEmail.trim() || "noreply@launchhub.dev"],
      ["SMTP_ENABLED", input.enabled ? "true" : "false"],
    ];

    // Solo actualizar contraseña si se proporcionó una nueva
    if (input.password && input.password.trim().length > 0) {
      pairs.push(["SMTP_PASSWORD", input.password.trim()]);
    }

    await db.$transaction(async (tx) => {
      for (const [key, value] of pairs) {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, description: `Configuración Servidor SMTP: ${key}` },
        });
      }

      await tx.adminAction.create({
        data: {
          adminId: admin.id,
          action: AdminActionType.EDIT,
          targetType: "SYSTEM_SETTING",
          targetId: "SMTP_CONFIG",
          detail: `Configuración SMTP actualizada (Host: ${input.host}, Puerto: ${input.port}, Remitente: ${input.fromEmail}, Estado: ${
            input.enabled ? "HABILITADO" : "DESHABILITADO"
          })`,
        },
      });
    });

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al guardar configuración SMTP";
    return { success: false, error: message };
  }
}

export async function sendTestEmailAction(targetEmail: string): Promise<ActionResponse> {
  try {
    await requireAdmin();

    if (!targetEmail || !targetEmail.includes("@")) {
      return { success: false, error: "Ingresa un correo electrónico de destino válido" };
    }

    const result = await testSmtpConnection(targetEmail);
    if (!result.success) {
      return { success: false, error: result.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error al enviar correo de prueba";
    return { success: false, error: message };
  }
}



