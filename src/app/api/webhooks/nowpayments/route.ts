import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyNowPaymentsIpnSignature } from "@/lib/nowpayments";
import { PaymentStatus, OrderStatus, ProductKind, Plan, BoostStatus, ProjectStatus } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import { renderPaymentReceiptEmail } from "@/lib/email-templates";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-nowpayments-sig");

    // Verificar firma criptográfica HMAC-SHA512
    const isValid = verifyNowPaymentsIpnSignature(rawBody, signature);
    if (!isValid) {
      console.warn("Firma IPN de NOWPayments inválida recibida");
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const {
      payment_id,
      payment_status,
      order_id,
      price_amount,
      pay_currency,
      actually_paid,
    } = payload;

    console.log(`[NOWPayments IPN] Payment ID: ${payment_id}, Status: ${payment_status}, Order: ${order_id}`);

    if (!order_id) {
      return NextResponse.json({ received: true, note: "Sin order_id" }, { status: 200 });
    }

    // Extraer IDs
    const [paymentId, orderId] = (order_id as string).split("_");

    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        product: true,
        user: true,
      },
    });

    if (!payment) {
      console.warn(`[NOWPayments IPN] Pago no encontrado para ID: ${paymentId}`);
      return NextResponse.json({ received: true, error: "Pago no encontrado" }, { status: 200 });
    }

    // Si el estado es de pago completado / confirmado
    if (payment_status === "finished" || payment_status === "confirmed") {
      if (payment.status === PaymentStatus.PAID) {
        return NextResponse.json({ received: true, message: "Ya procesado previamente" }, { status: 200 });
      }

      const product = payment.product;
      const user = payment.user;

      // Obtener items de la orden para saber si hay projectId asociado
      let targetProjectId: string | null = null;
      if (orderId) {
        const order = await db.order.findUnique({ where: { id: orderId } });
        if (order && Array.isArray(order.items) && order.items.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const firstItem = order.items[0] as any;
          targetProjectId = firstItem?.projectId || null;
        }
      }

      await db.$transaction(async (tx) => {
        // 1. Marcar Payment como PAID
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAID,
            providerRef: payment_id ? payment_id.toString() : payment.providerRef,
          },
        });

        // 2. Marcar Order como COMPLETED
        if (orderId) {
          await tx.order.update({
            where: { id: orderId },
            data: { status: OrderStatus.COMPLETED },
          });
        }

        // 3. Entregar beneficio según producto
        if (product.kind === ProductKind.PRO_SUBSCRIPTION) {
          // Actualizar plan del usuario a PRO
          await tx.user.update({
            where: { id: user.id },
            data: { plan: Plan.PRO },
          });

          // Crear o renovar suscripción (30 días)
          const endsAt = new Date();
          endsAt.setDate(endsAt.getDate() + 30);

          await tx.subscription.create({
            data: {
              userId: user.id,
              productId: product.id,
              status: "ACTIVE",
              currentPeriodEnd: endsAt,
              provider: "NOWPAYMENTS",
              providerRef: payment_id ? payment_id.toString() : undefined,
            },
          });

          // Notificar al usuario
          await tx.notification.create({
            data: {
              userId: user.id,
              type: "PROJECT_APPROVED", // Notificación informativa
            },
          });
        } else if (
          product.kind === ProductKind.BOOST_7 ||
          product.kind === ProductKind.BOOST_30
        ) {
          const days = product.kind === ProductKind.BOOST_7 ? 7 : 30;

          if (targetProjectId) {
            const project = await tx.project.findUnique({
              where: { id: targetProjectId },
            });

            if (project) {
              const currentBoostEnd =
                project.boostedUntil && project.boostedUntil > new Date()
                  ? project.boostedUntil
                  : new Date();

              const newBoostEnd = new Date(
                currentBoostEnd.getTime() + days * 24 * 60 * 60 * 1000
              );

              await tx.project.update({
                where: { id: project.id },
                data: {
                  boostedUntil: newBoostEnd,
                  status: ProjectStatus.APPROVED, // Auto-aprobado y publicado al pagar
                },
              });

              await tx.boost.create({
                data: {
                  projectId: project.id,
                  productId: product.id,
                  startsAt: new Date(),
                  endsAt: newBoostEnd,
                  status: BoostStatus.ACTIVE,
                },
              });
            }
          }
        } else if (product.kind === ProductKind.SPONSOR) {
          const days = 30;

          if (targetProjectId) {
            const project = await tx.project.findUnique({
              where: { id: targetProjectId },
            });

            if (project) {
              const currentBoostEnd =
                project.boostedUntil && project.boostedUntil > new Date()
                  ? project.boostedUntil
                  : new Date();

              const newBoostEnd = new Date(
                currentBoostEnd.getTime() + days * 24 * 60 * 60 * 1000
              );

              await tx.project.update({
                where: { id: project.id },
                data: {
                  boostedUntil: newBoostEnd,
                  featured: true,
                  status: ProjectStatus.APPROVED, // Auto-aprobado y publicado al pagar
                },
              });

              await tx.featuredProject.create({
                data: {
                  projectId: project.id,
                  placement: "HOME_HERO",
                  startsAt: new Date(),
                  endsAt: newBoostEnd,
                },
              });
            }
          }
        }

        // Garantizar que cualquier proyecto con orden de pago quede publicado
        if (targetProjectId) {
          await tx.project.updateMany({
            where: { id: targetProjectId, status: ProjectStatus.PENDING },
            data: { status: ProjectStatus.APPROVED },
          });
        }
      });

      // Enviar recibo de pago por correo (asíncrono y fail-safe)
      try {
        if (user.email) {
          const siteSetting = await db.systemSetting.findUnique({ where: { key: "SITE_URL" } });
          const siteUrl = siteSetting?.value || process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "https://launchhub.dev";
          const emailData = renderPaymentReceiptEmail({
            userName: user.name || "Customer",
            productName: product.name,
            amountCents: payment.amountCents,
            currency: payment.currency,
            orderId: orderId || payment.id,
            siteUrl,
          });
          sendEmail({
            to: user.email,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          }).catch((err) => console.error("Error sending payment receipt email:", err));
        }
      } catch (emailErr) {
        console.error("Error preparing payment receipt email:", emailErr);
      }

      console.log(`[NOWPayments IPN] Beneficios otorgados exitosamente a ${user.email}`);
    } else if (payment_status === "failed" || payment_status === "expired") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
    }

    return NextResponse.json({ received: true, status: payment_status }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error processing NOWPayments IPN webhook:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
