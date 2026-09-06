import nodemailer from "nodemailer";
import { db } from "@/lib/db";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  secure: boolean;
  fromName: string;
  fromEmail: string;
  enabled: boolean;
}

/**
 * Obtiene la configuración de SMTP almacenada en SystemSetting
 * con respaldo en variables de entorno.
 */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  try {
    const settings = await db.systemSetting.findMany({
      where: {
        key: {
          in: [
            "SMTP_HOST",
            "SMTP_PORT",
            "SMTP_USER",
            "SMTP_PASSWORD",
            "SMTP_SECURE",
            "SMTP_FROM_NAME",
            "SMTP_FROM_EMAIL",
            "SMTP_ENABLED",
          ],
        },
      },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    const host = map.get("SMTP_HOST") || process.env.SMTP_HOST || "";
    const port = Number(map.get("SMTP_PORT") || process.env.SMTP_PORT || "587");
    const user = map.get("SMTP_USER") || process.env.SMTP_USER || "";
    const password = map.get("SMTP_PASSWORD") || process.env.SMTP_PASSWORD || "";
    const secure = (map.get("SMTP_SECURE") ?? (port === 465 ? "true" : "false")) === "true";
    const fromName = map.get("SMTP_FROM_NAME") || process.env.SMTP_FROM_NAME || "LaunchHub";
    const fromEmail = map.get("SMTP_FROM_EMAIL") || process.env.SMTP_FROM_EMAIL || "noreply@launchhub.dev";
    const enabled = (map.get("SMTP_ENABLED") ?? (host ? "true" : "false")) === "true";

    return {
      host,
      port: isNaN(port) ? 587 : port,
      user,
      password,
      secure,
      fromName,
      fromEmail,
      enabled,
    };
  } catch (error) {
    console.error("Error reading SMTP config from database:", error);
    return {
      host: process.env.SMTP_HOST || "",
      port: Number(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER || "",
      password: process.env.SMTP_PASSWORD || "",
      secure: process.env.SMTP_SECURE === "true",
      fromName: process.env.SMTP_FROM_NAME || "LaunchHub",
      fromEmail: process.env.SMTP_FROM_EMAIL || "noreply@launchhub.dev",
      enabled: Boolean(process.env.SMTP_HOST),
    };
  }
}

/**
 * Crea un transporter de nodemailer según la configuración provista o leída de la DB.
 */
export function createMailTransporter(config: SmtpConfig) {
  if (!config.host || !config.user) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user && config.password ? {
      user: config.user,
      pass: config.password,
    } : undefined,
    tls: {
      rejectUnauthorized: false, // Permite certificados autofirmados si fuera necesario
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Envío de correo electrónico seguro y a prueba de fallos (fail-safe).
 * Si el servidor SMTP no está configurado o falla, no bloquea ni rompe la petición del usuario.
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getSmtpConfig();

    if (!config.enabled) {
      console.warn(`[EMAIL SKIPPED] SMTP está deshabilitado. No se envió correo a: ${options.to}`);
      return { success: false, error: "SMTP deshabilitado en configuración" };
    }

    const transporter = createMailTransporter(config);
    if (!transporter) {
      console.warn(`[EMAIL SKIPPED] Configuración SMTP incompleta (falta host o usuario). Correo para: ${options.to}`);
      return { success: false, error: "Configuración SMTP incompleta" };
    }

    const fromAddress = `"${config.fromName}" <${config.fromEmail}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo || config.fromEmail,
    });

    console.log(`[EMAIL SENT] Mensaje enviado a ${options.to}. ID: ${info.messageId}`);
    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al enviar correo";
    console.error(`[EMAIL ERROR] Fallo al enviar correo a ${options.to}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Valida la conexión SMTP y envía un correo de prueba para diagnóstico en vivo.
 */
export async function testSmtpConnection(targetEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    const config = await getSmtpConfig();

    if (!config.host) {
      return { success: false, message: "Debes configurar el Servidor SMTP (Host) antes de probar." };
    }

    const transporter = createMailTransporter(config);
    if (!transporter) {
      return { success: false, message: "No se pudo inicializar el transporte. Verifica el usuario y host." };
    }

    // 1. Verificar conexión / handshake
    await transporter.verify();

    // 2. Enviar correo de prueba
    const now = new Date().toLocaleString();
    const testHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; max-width: 500px; border: 1px solid #E7E4DB; border-radius: 12px; background: #FFFFFF;">
        <h2 style="color: #10B981; margin-top: 0;">✅ Conexión SMTP Exitosa</h2>
        <p style="color: #4A463D; font-size: 14px; line-height: 1.5;">
          Este es un correo de prueba enviado desde el panel de administración de <strong>${config.fromName}</strong>.
        </p>
        <div style="background: #F8F7F4; border-radius: 8px; padding: 12px; font-size: 12px; color: #716C61; margin: 16px 0;">
          <p style="margin: 0 0 4px 0;"><strong>Servidor:</strong> ${config.host}:${config.port}</p>
          <p style="margin: 0 0 4px 0;"><strong>Cifrado SSL:</strong> ${config.secure ? "Sí" : "No"}</p>
          <p style="margin: 0 0 4px 0;"><strong>Remitente:</strong> ${config.fromName} &lt;${config.fromEmail}&gt;</p>
          <p style="margin: 0;"><strong>Fecha y Hora:</strong> ${now}</p>
        </div>
        <p style="font-size: 12px; color: #A09B90; margin-bottom: 0;">
          Tu servidor de correo está listo para enviar notificaciones de registro, aprobación y pagos.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: targetEmail,
      subject: `[Prueba SMTP Exitosa] ${config.fromName} - ${now}`,
      html: testHtml,
      text: `Conexión SMTP exitosa desde ${config.fromName}. Servidor: ${config.host}:${config.port}`,
    });

    return {
      success: true,
      message: `¡Handshake y envío exitoso! Se envió un correo de prueba a ${targetEmail}`,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Error al conectar con el servidor SMTP";
    return { success: false, message: `Fallo de conexión SMTP: ${errorMsg}` };
  }
}
