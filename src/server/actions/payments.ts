"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createNowPaymentsInvoice } from "@/lib/nowpayments";
import { PaymentStatus, OrderStatus, ProductKind, Plan, BoostStatus } from "@prisma/client";
import type { ActionResponse } from "@/types";

export interface CreateCheckoutInput {
  productId: string;
  projectId?: string;
}

export async function createCryptoCheckout(
  input: CreateCheckoutInput
): Promise<ActionResponse<{ checkoutUrl: string; paymentId: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Debes iniciar sesión para realizar una compra" };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return { success: false, error: "Usuario no encontrado" };

    const product = await db.product.findUnique({
      where: { id: input.productId },
    });

    if (!product || !product.active) {
      return { success: false, error: "Producto no disponible para compra" };
    }

    // Si es un Boost, verificar que el proyecto pertenezca al usuario
    if (product.kind === ProductKind.BOOST_7 || product.kind === ProductKind.BOOST_30) {
      if (!input.projectId) {
        return { success: false, error: "Debes seleccionar el proyecto que deseas impulsar con el Boost" };
      }
      const project = await db.project.findFirst({
        where: { id: input.projectId, userId: user.id },
      });
      if (!project) {
        return { success: false, error: "Proyecto no encontrado o no te pertenece" };
      }
    }

    const priceUsd = Number((product.priceCents / 100).toFixed(2));

    // Crear registro de Payment pendiente
    const payment = await db.payment.create({
      data: {
        userId: user.id,
        productId: product.id,
        amountCents: product.priceCents,
        currency: product.currency || "USD",
        status: PaymentStatus.PENDING,
      },
    });

    // Crear registro de Order
    const order = await db.order.create({
      data: {
        userId: user.id,
        totalCents: product.priceCents,
        status: OrderStatus.PENDING,
        items: [
          {
            productId: product.id,
            productName: product.name,
            kind: product.kind,
            priceCents: product.priceCents,
            projectId: input.projectId || null,
          },
        ],
      },
    });

    // Llamar a la API de NOWPayments
    const invoiceRes = await createNowPaymentsInvoice({
      priceAmount: priceUsd,
      priceCurrency: product.currency?.toLowerCase() || "usd",
      orderId: `${payment.id}_${order.id}`,
      orderDescription: `LaunchHub: ${product.name} para @${user.username}`,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?payment=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/pricing?payment=cancel`,
    });

    if (!invoiceRes.success || !invoiceRes.data?.invoice_url) {
      // Marcar payment como fallido
      await db.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      return { success: false, error: invoiceRes.error || "No se pudo generar la factura en NOWPayments" };
    }

    // Guardar referencia en el Payment
    await db.payment.update({
      where: { id: payment.id },
      data: { providerRef: invoiceRes.data.id },
    });

    return {
      success: true,
      data: {
        checkoutUrl: invoiceRes.data.invoice_url,
        paymentId: payment.id,
      },
    };
  } catch (error: unknown) {
    console.error("Error creating crypto checkout:", error);
    const message = error instanceof Error ? error.message : "Error al procesar el pago";
    return { success: false, error: message };
  }
}
