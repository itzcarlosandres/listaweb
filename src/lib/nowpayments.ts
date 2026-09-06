import crypto from "crypto";

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY || "";
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET || "";
const IS_SANDBOX = process.env.NOWPAYMENTS_SANDBOX === "true";

const BASE_URL = IS_SANDBOX
  ? "https://api-sandbox.nowpayments.io/v1"
  : "https://api.nowpayments.io/v1";

export interface CreateInvoiceParams {
  priceAmount: number; // en USD (ej: 19.00)
  priceCurrency?: string; // default "usd"
  orderId: string;
  orderDescription: string;
  ipnCallbackUrl?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface NowPaymentsInvoiceResponse {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: string;
  price_currency: string;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
  updated_at: string;
}

export async function createNowPaymentsInvoice(
  params: CreateInvoiceParams
): Promise<{ success: boolean; data?: NowPaymentsInvoiceResponse; error?: string }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const apiKey = NOWPAYMENTS_API_KEY;

    if (!apiKey) {
      // Mock fallback para entorno de desarrollo sin API key
      const mockInvoiceId = `np_inv_${Date.now()}`;
      return {
        success: true,
        data: {
          id: mockInvoiceId,
          order_id: params.orderId,
          order_description: params.orderDescription,
          price_amount: params.priceAmount.toString(),
          price_currency: params.priceCurrency || "usd",
          invoice_url: `https://nowpayments.io/payment/?iid=${mockInvoiceId}`,
          success_url: params.successUrl || `${appUrl}/dashboard?payment=success`,
          cancel_url: params.cancelUrl || `${appUrl}/pricing?payment=cancel`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    const payload = {
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency || "usd",
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url:
        params.ipnCallbackUrl || `${appUrl}/api/webhooks/nowpayments`,
      success_url: params.successUrl || `${appUrl}/dashboard?payment=success`,
      cancel_url: params.cancelUrl || `${appUrl}/pricing?payment=cancel`,
    };

    const res = await fetch(`${BASE_URL}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("NOWPayments invoice error:", data);
      return {
        success: false,
        error: data.message || "Error al generar factura en NOWPayments",
      };
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error("Error creating NOWPayments invoice:", error);
    const message =
      error instanceof Error ? error.message : "Error de conexión con NOWPayments";
    return { success: false, error: message };
  }
}

/**
 * Valida la firma HMAC-SHA512 del webhook IPN de NOWPayments
 */
export function verifyNowPaymentsIpnSignature(
  rawBody: string | Record<string, unknown>,
  signatureHeader: string | null,
  secret = NOWPAYMENTS_IPN_SECRET
): boolean {
  if (!signatureHeader || !secret) {
    // Si no hay clave secreta configurada en desarrollo, permitir
    if (process.env.NODE_ENV === "development") return true;
    return false;
  }

  try {
    let payloadStr: string;
    if (typeof rawBody === "string") {
      const parsed = JSON.parse(rawBody);
      // NOWPayments ordena alfabéticamente las claves
      payloadStr = JSON.stringify(sortObject(parsed));
    } else {
      payloadStr = JSON.stringify(sortObject(rawBody));
    }

    const hmac = crypto.createHmac("sha512", secret);
    hmac.update(payloadStr);
    const calculatedSignature = hmac.digest("hex");

    return calculatedSignature === signatureHeader;
  } catch (error) {
    console.error("Error verifying IPN signature:", error);
    return false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortObject(obj: Record<string, any>): Record<string, any> {
  return Object.keys(obj)
    .sort()
    .reduce((result: Record<string, unknown>, key: string) => {
      result[key] =
        obj[key] && typeof obj[key] === "object" && !Array.isArray(obj[key])
          ? sortObject(obj[key])
          : obj[key];
      return result;
    }, {});
}
