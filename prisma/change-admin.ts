import { PrismaClient, Role, Plan } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function changeAdmin() {
  const args = process.argv.slice(2);
  const newEmail = args[0] || process.env.NEW_ADMIN_EMAIL;
  const newPassword = args[1] || process.env.NEW_ADMIN_PASSWORD;
  const targetUsername = args[2] || "admin";

  if (!newEmail || !newPassword) {
    console.log(`
======================================================
🔑 LaunchHub - Actualizar Credenciales de Administrador
======================================================

Uso:
  npx tsx prisma/change-admin.ts <nuevo_correo> <nueva_contraseña>

Ejemplo:
  npx tsx prisma/change-admin.ts micorreo@empresa.com ClaveSegura2026!

O mediante variables de entorno:
  NEW_ADMIN_EMAIL=micorreo@empresa.com NEW_ADMIN_PASSWORD=ClaveSegura2026! npx tsx prisma/change-admin.ts
======================================================
`);
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("❌ Error: La contraseña debe tener al menos 6 caracteres.");
    process.exit(1);
  }

  try {
    console.log(`🔍 Buscando cuenta de administrador existente...`);

    // 1. Buscar si ya existe algún usuario con rol ADMIN
    let adminUser = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
    });

    // Si no hay admin por rol, buscar si existe el default 'carlos@launchhub.dev'
    if (!adminUser) {
      adminUser = await prisma.user.findFirst({
        where: { email: "carlos@launchhub.dev" },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    if (adminUser) {
      // 2. Actualizar el admin existente
      const updated = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          email: newEmail.trim().toLowerCase(),
          passwordHash: hashedPassword,
          role: Role.ADMIN,
          plan: Plan.PRO,
          emailVerified: new Date(),
        },
      });

      console.log(`
✅ ¡Credenciales de Administrador actualizadas con éxito!
------------------------------------------------------
👤 ID de Usuario:    ${updated.id}
📧 Nuevo Correo:     ${updated.email}
🔑 Nueva Contraseña: [ACTUALIZADA Y ENCRIPTADA]
🛡️ Rol:              ${updated.role}
------------------------------------------------------
Ya puedes iniciar sesión en /login con estas credenciales.
`);
    } else {
      // 3. Si no existe ninguno, crear el nuevo Administrador
      const created = await prisma.user.create({
        data: {
          email: newEmail.trim().toLowerCase(),
          username: targetUsername.toLowerCase().replace(/[^a-z0-9]/g, ""),
          name: "Administrador",
          passwordHash: hashedPassword,
          role: Role.ADMIN,
          plan: Plan.PRO,
          emailVerified: new Date(),
        },
      });

      console.log(`
✅ ¡Nuevo Administrador creado con éxito!
------------------------------------------------------
👤 ID de Usuario:    ${created.id}
📧 Correo:           ${created.email}
👤 Username:         ${created.username}
🔑 Contraseña:       [GUARDADA Y ENCRIPTADA]
🛡️ Rol:              ${created.role}
------------------------------------------------------
Ya puedes iniciar sesión en /login con estas credenciales.
`);
    }
  } catch (error) {
    console.error("❌ Error al actualizar las credenciales:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

changeAdmin();
