"use client";

import { useState, useTransition } from "react";
import {
  updateSmtpSettings,
  sendTestEmailAction,
  type SmtpSettingsInput,
} from "@/server/actions/admin";
import {
  Mail,
  Server,
  Lock,
  Send,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface SmtpSettingsFormProps {
  initialSettings: SmtpSettingsInput;
}

export function SmtpSettingsForm({ initialSettings }: SmtpSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isTesting, startTestTransition] = useTransition();

  const [formData, setFormData] = useState<SmtpSettingsInput>({
    host: initialSettings.host || "",
    port: initialSettings.port || 587,
    user: initialSettings.user || "",
    password: "", // Contraseña vacía para no exponerla, solo se actualiza si escribe una nueva
    secure: initialSettings.secure ?? false,
    fromName: initialSettings.fromName || "LaunchHub",
    fromEmail: initialSettings.fromEmail || "noreply@launchhub.dev",
    enabled: initialSettings.enabled ?? false,
  });

  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateSmtpSettings(formData);
      if (res.success) {
        toast.success("Configuración SMTP guardada correctamente");
      } else {
        toast.error(res.error || "Error al guardar la configuración SMTP");
      }
    });
  };

  const handleTestEmail = () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Por favor ingresa un correo de destino válido para la prueba");
      return;
    }

    setTestResult(null);
    startTestTransition(async () => {
      const res = await sendTestEmailAction(testEmail.trim());
      if (res.success) {
        toast.success(`¡Prueba exitosa! Correo enviado a ${testEmail}`);
        setTestResult({
          success: true,
          message: `Conexión SMTP verificada y correo de prueba entregado exitosamente a ${testEmail}.`,
        });
      } else {
        toast.error(res.error || "Fallo en la prueba SMTP");
        setTestResult({
          success: false,
          message: res.error || "No se pudo conectar al servidor SMTP. Revisa los datos ingresados.",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Estado y Activar/Desactivar */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-neutral-900 dark:text-white">
                Servicio de Correos Transaccionales
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Habilita el envío automático de correos (bienvenida, proyectos en revisión, aprobación y recibos de pago).
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6.5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5.5 after:w-5.5 after:transition-all peer-checked:bg-[#E4572E]"></div>
            <span className="ml-3 text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300">
              {formData.enabled ? "ACTIVADO" : "PAUSADO"}
            </span>
          </label>
        </div>
      </div>

      {/* 2. Parámetros del Servidor SMTP */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E8E5DC]/60 dark:border-[#25221B]/60">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-neutral-900 dark:text-white">
              Credenciales del Servidor Saliente (SMTP)
            </h3>
            <p className="text-xs text-neutral-500">
              Compatible con Resend, SendGrid, Amazon SES, Mailgun, Brevo, Gmail o tu propio servidor SMTP.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              Servidor SMTP (Host)
            </label>
            <input
              type="text"
              placeholder="smtp.resend.com o mail.tudominio.com"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-900 dark:text-white focus:outline-none focus:border-[#E4572E]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              Puerto
            </label>
            <input
              type="number"
              placeholder="587 o 465"
              value={formData.port}
              onChange={(e) => {
                const port = parseInt(e.target.value) || 587;
                setFormData({
                  ...formData,
                  port,
                  secure: port === 465,
                });
              }}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-900 dark:text-white focus:outline-none focus:border-[#E4572E]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              Usuario de Autenticación
            </label>
            <input
              type="text"
              placeholder="resend o usuario@tudominio.com"
              value={formData.user}
              onChange={(e) => setFormData({ ...formData, user: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-900 dark:text-white focus:outline-none focus:border-[#E4572E]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              Contraseña / API Key / App Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-sm font-mono bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-900 dark:text-white focus:outline-none focus:border-[#E4572E]"
              />
              <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Deja vacío para mantener la contraseña actual guardada en el sistema.
            </p>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.secure}
              onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
              className="w-4 h-4 rounded text-[#E4572E] focus:ring-[#E4572E] border-neutral-300 dark:border-neutral-700"
            />
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Conexión SSL/TLS Directa (Típico para puerto 465. Desmarcar si usas STARTTLS en puerto 587).
            </span>
          </label>
        </div>
      </div>

      {/* 3. Datos del Remitente */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E8E5DC]/60 dark:border-[#25221B]/60">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-bold text-neutral-900 dark:text-white">
              Identidad del Remitente (From)
            </h3>
            <p className="text-xs text-neutral-500">
              Cómo verán los destinatarios el remitente en su bandeja de entrada.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              Nombre Visible
            </label>
            <input
              type="text"
              placeholder="LaunchHub"
              value={formData.fromName}
              onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-900 dark:text-white focus:outline-none focus:border-[#E4572E]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
              Correo Electrónico (From Email)
            </label>
            <input
              type="email"
              placeholder="notificaciones@tudominio.com"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-900 dark:text-white focus:outline-none focus:border-[#E4572E]"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Asegúrate de que este dominio tenga configurados sus registros SPF y DKIM para evitar spam.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Diagnóstico y Prueba en Vivo */}
      <div className="p-6 rounded-2xl bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-heading font-bold text-neutral-900 dark:text-white">
            Probar Conexión y Envío en Vivo
          </h3>
        </div>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Guarda primero cualquier cambio que hayas realizado y luego ingresa un correo para enviar un mensaje de prueba con diagnóstico en tiempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="tu-correo-personal@ejemplo.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl text-sm bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] text-neutral-900 dark:text-white focus:outline-none focus:border-[#E4572E]"
          />
          <button
            type="button"
            onClick={handleTestEmail}
            disabled={isTesting || !testEmail}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer shrink-0 shadow-xs"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Probando Handshake...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Enviar Correo de Prueba
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div
            className={`p-4 rounded-xl text-xs flex items-start gap-3 ${
              testResult.success
                ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/40"
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{testResult.success ? "¡Prueba Exitosa!" : "Fallo de Envío"}</p>
              <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Guía de Notificaciones Activas */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#16140F] border border-[#E8E5DC] dark:border-[#25221B] shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-[#E4572E]" />
          <h3 className="text-sm font-heading font-bold text-neutral-900 dark:text-white">
            Notificaciones Automatizadas Activas en LaunchHub
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC]/70 dark:border-[#25221B]/70">
            <span className="font-bold text-neutral-900 dark:text-white block">🚀 1. Bienvenida al Registrarse</span>
            <span className="text-neutral-500">Envía guía de inicio a los nuevos usuarios registrados.</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC]/70 dark:border-[#25221B]/70">
            <span className="font-bold text-neutral-900 dark:text-white block">⏳ 2. Proyecto Recibido (Revisión)</span>
            <span className="text-neutral-500">Notifica al creador que su proyecto está en cola de moderación.</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC]/70 dark:border-[#25221B]/70">
            <span className="font-bold text-neutral-900 dark:text-white block">🎉 3. Proyecto Aprobado (En Vivo)</span>
            <span className="text-neutral-500">Envía el enlace público y consejos para conseguir votos del día.</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#110F0A] border border-[#E8E5DC]/70 dark:border-[#25221B]/70">
            <span className="font-bold text-neutral-900 dark:text-white block">🧾 4. Recibo de Pago (Pro / Boost)</span>
            <span className="text-neutral-500">Comprobante con desglose de compra, monto e ID de orden.</span>
          </div>
        </div>
      </div>

      {/* Botón de Guardado Flotante / Footer */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando Configuración...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Guardar Configuración SMTP
            </>
          )}
        </button>
      </div>
    </form>
  );
}
