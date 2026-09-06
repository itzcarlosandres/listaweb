"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { Role, Plan } from "@prisma/client";
import { generateSvgAvatar, getInitials } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ActionResponse } from "@/types";

export async function registerUser(input: RegisterInput): Promise<ActionResponse<{ id: string; email: string }>> {
  try {
    const validated = registerSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Datos de registro inválidos",
      };
    }

    const { name, username, email, password } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Comprobar existencia previa de email
    const existingEmail = await db.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      return {
        success: false,
        error: "El correo electrónico ya está registrado",
      };
    }

    // Comprobar existencia previa de username
    const existingUsername = await db.user.findUnique({
      where: { username: normalizedUsername },
    });
    if (existingUsername) {
      return {
        success: false,
        error: "El nombre de usuario ya está en uso",
      };
    }

    // Asignar rol ADMIN si coincide con ADMIN_EMAIL configurado
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const role = adminEmail && normalizedEmail === adminEmail ? Role.ADMIN : Role.USER;

    const passwordHash = await bcrypt.hash(password, 12);
    const initials = getInitials(name);
    const avatar = generateSvgAvatar(initials, "#E4572E");

    const user = await db.user.create({
      data: {
        name,
        username: normalizedUsername,
        email: normalizedEmail,
        passwordHash,
        role,
        plan: Plan.FREE,
        image: avatar,
      },
      select: {
        id: true,
        email: true,
      },
    });

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar el registro",
    };
  }
}

const profileUpdateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  bio: z.string().max(300, "La biografía no puede exceder 300 caracteres").optional(),
  website: z.string().url("URL de sitio web no válida").or(z.literal("")).optional(),
  country: z.string().max(2).optional(),
  image: z.string().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export async function updateUserProfile(input: ProfileUpdateInput): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const validated = profileUpdateSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Datos inválidos",
      };
    }

    const { name, bio, website, country, image } = validated.data;

    await db.user.update({
      where: { id: session.user.id },
      data: {
        name,
        bio: bio || null,
        website: website || null,
        country: country || null,
        image: image || undefined,
      },
    });

    revalidatePath("/dashboard/settings");
    revalidatePath(`/user/${session.user.username}`);

    return { success: true };
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return { success: false, error: "No se pudo actualizar el perfil" };
  }
}

export async function exportUserData(): Promise<ActionResponse<string>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const userData = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        projects: true,
        votes: { include: { project: { select: { name: true, slug: true } } } },
        favorites: { include: { project: { select: { name: true, slug: true } } } },
        comments: { include: { project: { select: { name: true, slug: true } } } },
        following: { include: { following: { select: { username: true } } } },
        followers: { include: { follower: { select: { username: true } } } },
      },
    });

    if (!userData) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const cleanData = {
      ...userData,
      passwordHash: undefined,
    };

    return {
      success: true,
      data: JSON.stringify(cleanData, null, 2),
    };
  } catch (error) {
    console.error("Error al exportar datos:", error);
    return { success: false, error: "No se pudieron exportar los datos" };
  }
}
