"use client";

import { useState, useTransition } from "react";
import { updatePaymentGatewaySettings, type PaymentGatewaySettingsInput } from "@/server/actions/admin";
import {
  CreditCard,
  Coins,
  Save,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface PaymentGatewaySettingsFormProps {
  initialSettings: PaymentGatewaySettingsInput;
}

export function PaymentGatewaySettingsForm({ initialSettings }: PaymentGatewaySettingsFormProps) {
  const [settings, setSettings] = useState<PaymentGatewaySettingsInput>(initialSettings);
  const [showNowApiKey, setShowNowApiKey] = useState(false);
  const [showNowSecret, setShowNowSecret] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [isPending, startTransition] = useTransition();

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://tu-dominio.com";
  const nowpaymentsWebhookUrl = `${appUrl}/api/webhooks/nowpayments`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiada al portapapeles`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updatePaymentGatewaySettings(settings);
      if (res.success) {
        toast.success("Configuración de pasarelas de pago guardada con éxito");
      } else {
        toast.error(res.error || "Error al guardar pasarelas");
      }
    });
  };

  return (
    <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Configuración de Pasarelas de Pago
            </h2>
            <p className="text-xs text-neutral-500">
              Administra credenciales de API para pagos en criptomonedas (NOWPayments) y tarjetas (Stripe).
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-60"
        >
          {isPending ? (
            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          Guardar Pasarelas
        </button>
      </div>

      {/* NOWPayments Section */}
      <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E7E4DB]/80 dark:border-[#2E2B23]/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              NOWPayments (Criptomonedas)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400 font-semibold">
              BTC, ETH, USDT, SOL +100 criptos
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.nowpaymentsEnabled}
              onChange={(e) => setSettings({ ...settings, nowpaymentsEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {settings.nowpaymentsEnabled ? "Pasarela Habilitada" : "Deshabilitada"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* API Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              API Key de NOWPayments
            </label>
            <div className="relative">
              <input
                type={showNowApiKey ? "text" : "password"}
                value={settings.nowpaymentsApiKey}
                onChange={(e) => setSettings({ ...settings, nowpaymentsApiKey: e.target.value })}
                placeholder="Pega aquí tu API Key de NOWPayments..."
                className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowNowApiKey(!showNowApiKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {showNowApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* IPN Secret */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              IPN Secret Key (Firma HMAC)
            </label>
            <div className="relative">
              <input
                type={showNowSecret ? "text" : "password"}
                value={settings.nowpaymentsIpnSecret}
                onChange={(e) => setSettings({ ...settings, nowpaymentsIpnSecret: e.target.value })}
                placeholder="Clave secreta IPN para verificar webhooks..."
                className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowNowSecret(!showNowSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {showNowSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-[#E7E4DB]/60 dark:border-[#2E2B23]/60">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.nowpaymentsSandbox}
              onChange={(e) => setSettings({ ...settings, nowpaymentsSandbox: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
            />
            <span className="text-neutral-700 dark:text-neutral-300">
              Modo Sandbox (Pruebas / Testnet)
            </span>
          </label>

          <div className="flex items-center gap-2 text-neutral-500 font-mono text-[11px]">
            <span>URL Callback IPN:</span>
            <code className="px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 truncate max-w-[200px] sm:max-w-none">
              {nowpaymentsWebhookUrl}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(nowpaymentsWebhookUrl, "URL de Webhook IPN")}
              className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400"
              title="Copiar URL"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stripe Section */}
      <div className="p-5 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-[#E7E4DB]/80 dark:border-[#2E2B23]/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Stripe (Tarjetas de Crédito y Débito)
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-semibold">
              Visa, Mastercard, Apple Pay
            </span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.stripeEnabled}
              onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-primary focus:ring-primary"
            />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              {settings.stripeEnabled ? "Pasarela Habilitada" : "Deshabilitada"}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Secret Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Stripe Secret Key (sk_live_... / sk_test_...)
            </label>
            <div className="relative">
              <input
                type={showStripeSecret ? "text" : "password"}
                value={settings.stripeSecretKey}
                onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                placeholder="sk_test_..."
                className="w-full pl-3 pr-9 py-2 text-xs font-mono bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowStripeSecret(!showStripeSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {showStripeSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Publishable Key */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Stripe Publishable Key (pk_live_... / pk_test_...)
            </label>
            <input
              type="text"
              value={settings.stripePublishableKey}
              onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
              placeholder="pk_test_..."
              className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-lg focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
