import { z } from "zod";
import { PricingType, ProjectType } from "@prisma/client";

export const projectSubmitSchema = z.object({
  // Paso 1: Esenciales
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede exceder 60 caracteres"),
  tagline: z
    .string()
    .min(10, "El tagline debe tener al menos 10 caracteres")
    .max(90, "El tagline no puede exceder los 90 caracteres"),
  websiteUrl: z
    .string()
    .url("Ingresa una URL válida (ej: https://ejemplo.com)"),
  categoryId: z.string().min(1, "Debes seleccionar una categoría principal"),

  // Paso 2: Detalles y Media
  logoUrl: z.string().optional().nullable(),
  screenshots: z.array(z.string()).max(6, "Máximo 6 capturas de pantalla"),
  description: z
    .string()
    .min(120, "La descripción debe tener al menos 120 caracteres para explicar bien el proyecto")
    .max(8000, "La descripción no puede exceder 8000 caracteres"),
  tags: z.array(z.string()).max(8, "Máximo 8 etiquetas").default([]).optional(),
  technologies: z.array(z.string()).max(10, "Máximo 10 tecnologías").default([]).optional(),

  // Paso 3: Precio y Metadatos
  pricingType: z.nativeEnum(PricingType),
  paidProductId: z.string().optional(),
  projectType: z.nativeEnum(ProjectType),
  country: z.string().max(2).optional().nullable(),
  launchDate: z.string().optional(),

  // Anti-bot
  honeypot: z.string().optional(),
  renderTime: z.number().optional(),
});

export type ProjectSubmitInput = z.infer<typeof projectSubmitSchema>;
