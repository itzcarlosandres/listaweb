# 🚀 LaunchHub — Plataforma SaaS & Showcase de Productos Digitales

**LaunchHub** es una plataforma moderna para descubrir, votar y publicar herramientas digitales, aplicaciones SaaS, startups y productos tech en español. Diseñado con una arquitectura modular para escalabilidad extrema, SEO dinámico de alto impacto y un sistema de monetización (Boosts, Featured, Planes PRO) que no bloquea la publicación libre y gratuita.

---

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 15.3+](https://nextjs.org/) (App Router, Server Components, Server Actions, Output Standalone).
- **Lenguaje**: [TypeScript 5](https://www.typescriptlang.org/) en modo estricto.
- **Base de Datos**: [PostgreSQL 16](https://www.postgresql.org/) con [Prisma ORM 6](https://www.prisma.io/) (IDs `@default(cuid(2))`, índices compuestos de alto rendimiento).
- **Estilos & Diseño**: Tailwind CSS 4, Google Fonts (*Bricolage Grotesque*, *Instrument Sans*, *JetBrains Mono*), paleta cálida editorial y modo oscuro nativo.
- **Iconografía**: [Lucide React](https://lucide.dev/) (sin emojis en interfaz).
- **Autenticación**: [Auth.js v5](https://authjs.dev/) con credenciales seguras (bcryptjs) y soporte OAuth.
- **Validación**: [Zod](https://zod.dev/) en frontend y backend.
- **Búsqueda Global**: Modal interactivo `⌘K` / `Ctrl+K` con búsqueda instantánea de productos, categorías y creadores.
- **Despliegue & Docker**: Multi-stage `Dockerfile` para producción standalone y `docker-compose.yml`.

---

## ⚡ Inicio Rápido en Local

### 1. Requisitos Previos
- Node.js 20+ y npm.
- Instancia activa de PostgreSQL 16 (local o Docker).

### 2. Instalación de Dependencias
```bash
git clone https://github.com/tu-usuario/launchhub.git
cd launchhub
npm install
```

### 3. Configuración de Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Configura tus credenciales:
```env
DATABASE_URL="postgresql://launchhub:launchhub@localhost:5432/launchhub?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="tu-clave-secreta-super-larga-y-segura-de-32-caracteres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Migraciones de Base de Datos y Seed
Ejecuta la sincronización de esquema y carga de datos iniciales con 16 categorías, usuarios, proyectos de demostración y votos:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 👤 Cuentas de Acceso Predefinidas (Seed)

| Rol | Email | Contraseña | Plan |
| :--- | :--- | :--- | :--- |
| **ADMINISTRADOR** | `carlos@launchhub.dev` | `password123` | PRO (Admin) |
| **USUARIO CREADOR** | `lucia@launchhub.dev` | `password123` | PRO |
| **USUARIO CREADOR** | `matias@launchhub.dev` | `password123` | FREE |
| **USUARIO CREADOR** | `sofia@launchhub.dev` | `password123` | FREE |

---

## 📊 Arquitectura del Sistema

### 1. Algoritmo de Ranking Dinámico (Trending & Leaderboard)
Calculado en base a la interacción temporal:
$$\text{Score} = \frac{\text{Votos} \times 3 + \text{Comentarios} \times 2 + \text{Bonus Boost} + \text{Vistas}}{\left(\frac{\text{Horas desde lanzamiento}}{24} + 2\right)^{1.5}}$$
- Incluye caché inteligente con `unstable_cache(..., 60s)` y tags `"rankings"` para invalidación bajo demanda.

### 2. Panel de Administración (`/admin`)
- **Dashboard**: Métricas en vivo de envíos pendientes, proyectos aprobados, reportes abiertos y usuarios.
- **Envíos (`/admin/submissions`)**: Flujo de aprobación rápida y rechazo motivado con notificación directa al autor.
- **Proyectos (`/admin/projects`)**: Destacado manual (Hero/Sección), suspensión y auditoría.
- **Reportes (`/admin/reports`)**: Resolución y descarte de reportes de spam o contenido inapropiado.
- **Usuarios (`/admin/users`)**: Control de roles (`USER` / `ADMIN`) y asignación de planes `PRO`.
- **Planes & Pagos (`/admin/plans`, `/admin/payments`)**: Gestión del catálogo comercial y transacciones.
- **Ajustes (`/admin/settings`)**: Monitor de estado de infraestructura y parámetros de moderación.

### 3. Panel de Usuario (`/dashboard`)
- Vista general de estadísticas (vistas, votos, comentarios, ranking actual).
- Gestión de proyectos propios (`/dashboard/projects`), creación (`/submit`) y edición (`/dashboard/projects/[id]/edit`).
- Gráficas de rendimiento con Recharts (`/dashboard/analytics`).
- Proyectos guardados en favoritos (`/dashboard/saved`).
- Centro de notificaciones en tiempo real (`/dashboard/notifications`).
- Ajustes de cuenta y exportación de datos en JSON (`/dashboard/settings`).

### 4. SEO & Metadatos Dinámicos
- **`sitemap.ts`**: Generación dinámica con todas las rutas estáticas, categorías, proyectos aprobados y perfiles públicos.
- **`robots.ts`**: Reglas de indexación protegiendo áreas privadas (`/admin`, `/dashboard`, `/api`).
- **OpenGraph Dinámico**: Generación de tarjetas sociales automáticas (`1200x630px`) vía `ImageResponse` en `/project/[slug]/opengraph-image`.
- **JSON-LD**: Microdatos Schema.org (`SoftwareApplication` / `Product`) inyectados en páginas de detalle.

---

## 🐳 Despliegue con Docker

### Producción Standalone con Docker Compose
```bash
docker compose up -d --build
```
La aplicación se compila en modo multi-stage ligero (Alpine) con usuario no privilegiado (`nextjs:nodejs`), exponiendo el puerto `3000`.

### Health Check Endpoint
Comprueba el estado del contenedor y conexión a PostgreSQL:
```bash
curl http://localhost:3000/api/health
```
Respuesta:
```json
{
  "status": "ok",
  "environment": "production",
  "timestamp": "2026-09-04T14:00:00.000Z",
  "uptime": 124.5,
  "database": {
    "status": "healthy",
    "latencyMs": 4
  }
}
```

---

## 🔒 Seguridad Implementada

- **Anti-Bot Honeypot**: Trampa invisible y validación de tiempo mínimo de llenado ($\ge 3\text{s}$) en envíos de proyectos.
- **Sanitización HTML**: Limpieza contra ataques XSS en descripciones y comentarios.
- **Rate Limiting en Memoria / DB**: Límite de 5 comentarios por minuto y deduplicación de vistas anónimas diarias.
- **Protección de Rutas**: Middleware con verificación de sesión y bloqueo estricto en `/admin` (solo rol `ADMIN`).
- **Registro de Auditoría**: Toda acción administrativa queda registrada en el modelo `AdminAction`.

---

## 📄 Licencia
Distribuido bajo la Licencia MIT.
