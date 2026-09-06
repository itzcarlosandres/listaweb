"use client";

import { useState, useTransition } from "react";
import { createCryptoCheckout } from "@/server/actions/payments";
import { Coins, Sparkles, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface CryptoCheckoutButtonProps {
  productId: string;
  projectId?: string;
  buttonText?: string;
  className?: string;
}

export function CryptoCheckoutButton({
  productId,
  projectId,
  buttonText = "Pagar con Cripto (NOWPayments)",
  className = "",
}: CryptoCheckoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleCheckout = () => {
    startTransition(async () => {
      toast.loading("Generando pasarela de pago seguro en NOWPayments...", { id: "crypto-pay" });
      
      const res = await createCryptoCheckout({ productId, projectId });

      if (res.success && res.data?.checkoutUrl) {
        toast.success("Redirigiendo a NOWPayments...", { id: "crypto-pay" });
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error(res.error || "No se pudo iniciar el pago", { id: "crypto-pay" });
      }
    });
  };

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleCheckout}
      className={`inline-flex items-center justify-center gap-2 font-bold transition-all disabled:opacity-60 cursor-pointer ${
        className ||
        "w-full py-3 px-4 rounded-xl text-xs sm:text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-sm"
      }`}
    >
      {isPending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Generando Factura...</span>
        </>
      ) : (
        <>
          <Coins className="w-4 h-4 text-amber-500" />
          <span>{buttonText}</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-70" />
        </>
      )}
    </button>
  );
}
