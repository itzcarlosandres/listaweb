import { PrismaClient, Role, Plan, PricingType, ProjectType, ProjectStatus, CommentStatus, ReportTarget, ReportType, ReportStatus, ProductKind } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATEGORIES_SEED, TECHNOLOGIES_SEED, PRODUCTS_SEED } from "../src/lib/constants";
import { generateSvgAvatar } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting LaunchHub database seeding...");

  // 1. Categories
  console.log("Creating categories...");
  for (const cat of CATEGORIES_SEED) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description, order: cat.order },
      create: {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        order: cat.order,
      },
    });
  }

  // 2. Technologies
  console.log("Creating technologies...");
  for (const tech of TECHNOLOGIES_SEED) {
    const slug = tech.toLowerCase().replace(/[^a-z0-9]/g, "-");
    await prisma.technology.upsert({
      where: { slug },
      update: { name: tech },
      create: { slug, name: tech },
    });
  }

  // 3. Products
  console.log("Creating products...");
  for (const prod of PRODUCTS_SEED) {
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        kind: prod.kind as ProductKind,
        priceCents: prod.priceCents,
        currency: prod.currency,
        active: prod.active,
      },
      create: {
        slug: prod.slug,
        name: prod.name,
        kind: prod.kind as ProductKind,
        priceCents: prod.priceCents,
        currency: prod.currency,
        active: prod.active,
      },
    });
  }

  // 4. Users
  console.log("Creating demo users...");
  const hashedPassword = await bcrypt.hash("password123", 12);

  const demoUsers = [
    {
      name: "Carlos Mendoza",
      username: "carlos",
      email: process.env.ADMIN_EMAIL || "carlos@launchhub.dev",
      role: Role.ADMIN,
      plan: Plan.PRO,
      bio: "Fundador de LaunchHub. Apasionado por la tecnología, startups y software de código abierto.",
      website: "https://carlosmendoza.dev",
      country: "ES",
      image: generateSvgAvatar("CM", "#E4572E"),
    },
    {
      name: "Elena Rostova",
      username: "elena",
      email: "elena@launchhub.dev",
      role: Role.USER,
      plan: Plan.PRO,
      bio: "Diseñadora de producto y creadora de herramientas de IA para creadores.",
      website: "https://elenarostova.design",
      country: "US",
      image: generateSvgAvatar("ER", "#6366F1"),
    },
    {
      name: "Marcos Silva",
      username: "marcos",
      email: "marcos@launchhub.dev",
      role: Role.USER,
      plan: Plan.PRO,
      bio: "Ingeniero Full-stack & Indie Hacker construyendo micro-SaaS escalables.",
      website: "https://marcos.io",
      country: "BR",
      image: generateSvgAvatar("MS", "#10B981"),
    },
    {
      name: "Sofía Valenzuela",
      username: "sofia",
      email: "sofia@launchhub.dev",
      role: Role.USER,
      plan: Plan.FREE,
      bio: "Growth marketer y exploradora de herramientas de automatización y productividad.",
      website: "https://sofiaval.co",
      country: "MX",
      image: generateSvgAvatar("SV", "#F59E0B"),
    },
    {
      name: "Diego Navarro",
      username: "diego",
      email: "diego@launchhub.dev",
      role: Role.USER,
      plan: Plan.FREE,
      bio: "Desarrollador backend, entusiasta de PostgreSQL, Rust y sistemas distribuidos.",
      website: "https://diego.dev",
      country: "AR",
      image: generateSvgAvatar("DN", "#8B5CF6"),
    },
    {
      name: "Laura Gómez",
      username: "laura",
      email: "laura@launchhub.dev",
      role: Role.USER,
      plan: Plan.FREE,
      bio: "Community lead y entusiasta de software libre y diseño minimalista.",
      website: "https://lauragomez.blog",
      country: "CO",
      image: generateSvgAvatar("LG", "#EC4899"),
    },
  ];

  const createdUsers: Record<string, string> = {};

  for (const u of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        username: u.username,
        role: u.role,
        plan: u.plan,
        bio: u.bio,
        website: u.website,
        country: u.country,
        image: u.image,
      },
      create: {
        name: u.name,
        username: u.username,
        email: u.email,
        passwordHash: hashedPassword,
        role: u.role,
        plan: u.plan,
        bio: u.bio,
        website: u.website,
        country: u.country,
        image: u.image,
        emailVerified: new Date(),
      },
    });
    createdUsers[u.username] = user.id;
  }

  // Follows
  console.log("Creating demo follows...");
  const followPairs = [
    [createdUsers["elena"], createdUsers["carlos"]],
    [createdUsers["marcos"], createdUsers["carlos"]],
    [createdUsers["sofia"], createdUsers["elena"]],
    [createdUsers["diego"], createdUsers["marcos"]],
    [createdUsers["carlos"], createdUsers["elena"]],
    [createdUsers["laura"], createdUsers["sofia"]],
  ];

  for (const [followerId, followingId] of followPairs) {
    if (followerId && followingId) {
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId, followingId } },
        update: {},
        create: { followerId, followingId },
      });
    }
  }

  // 5. Projects
  console.log("Creating demo projects...");
  const categories = await prisma.category.findMany();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  const projectsData = [
    {
      name: "AI Writer Pro",
      slug: "ai-writer-pro",
      tagline: "Generador inteligente de artículos SEO y copy publicitario en segundos.",
      description: `AI Writer Pro es una plataforma integral impulsada por modelos de lenguaje de última generación diseñada para redactores, agencias y equipos de marketing digital que necesitan producir contenido original de alta conversión a gran velocidad.

La herramienta analiza las palabras clave de mayor competencia en Google, extrae la intención de búsqueda y estructura artículos completos con encabezados optimizados, enlaces sugeridos y metadescripciones listas para publicar.

Además, cuenta con un editor interactivo en tiempo real con sugerencias de legibilidad, detección de plagio integrado y exportación directa a WordPress, Ghost y Notion con un solo clic.`,
      websiteUrl: "https://aiwriterpro.example.com",
      logoColor: "#4F46E5",
      logoInitials: "AW",
      categorySlug: "ai",
      pricingType: PricingType.FREEMIUM,
      projectType: ProjectType.AI,
      country: "US",
      username: "elena",
      status: ProjectStatus.APPROVED,
      featured: true,
      tags: ["ia", "seo", "copywriting", "marketing", "automatizacion"],
      technologies: ["Next.js", "TypeScript", "OpenAI", "Tailwind CSS", "PostgreSQL"],
      daysAgo: 1,
      votesBase: 84,
      viewsBase: 1240,
      favoritesBase: 29,
    },
    {
      name: "CloudPanel X",
      slug: "cloudpanel-x",
      tagline: "Panel de control moderno para servidores PHP, Node.js y bases de datos.",
      description: `CloudPanel X simplifica la administración de servidores en la nube sin comprometer la seguridad ni el rendimiento. Diseñado tanto para desarrolladores individuales como para administradores de sistemas experimentados.

Permite aprovisionar instancias VPS en DigitalOcean, AWS, Hetzner o Linode en menos de 3 minutos, configurando automáticamente cortafuegos, certificados SSL Let's Encrypt y copias de seguridad incrementales automáticas en S3.

Incluye métricas de CPU y memoria en tiempo real, gestor de dominios con balanceo de carga y soporte nativo para despliegues Git con webhooks automatizados.`,
      websiteUrl: "https://cloudpanel-x.example.com",
      logoColor: "#0284C7",
      logoInitials: "CP",
      categorySlug: "developer-tools",
      pricingType: PricingType.FREE,
      projectType: ProjectType.TOOL,
      country: "ES",
      username: "carlos",
      status: ProjectStatus.APPROVED,
      featured: true,
      tags: ["devops", "cloud", "servidores", "php", "nodejs", "linux"],
      technologies: ["Node.js", "Docker", "PostgreSQL", "Tailwind CSS", "Redis"],
      daysAgo: 2,
      votesBase: 68,
      viewsBase: 980,
      favoritesBase: 21,
    },
    {
      name: "ShopFast Engine",
      slug: "shopfast-engine",
      tagline: "E-commerce ultrarrápido headless con carrito instantáneo y checkout global.",
      description: `ShopFast Engine redefine la velocidad en el comercio electrónico con una arquitectura headless ultraligera construida sobre Next.js y Edge Networks. Reduce la tasa de rebote y maximiza la tasa de conversión en dispositivos móviles.

Sincroniza inventarios en tiempo real entre múltiples almacenes físicos y plataformas como Shopify, WooCommerce o ERPs propietarios mediante webhooks asíncronos y colas seguras.

Ofrece soporte nativo para más de 40 divisas, cálculo dinámico de impuestos por geolocalización y métodos de pago locales como Stripe, MercadoPago, Pix y Klarna.`,
      websiteUrl: "https://shopfast.example.com",
      logoColor: "#16A34A",
      logoInitials: "SF",
      categorySlug: "ecommerce",
      pricingType: PricingType.PAID,
      projectType: ProjectType.ECOMMERCE,
      country: "MX",
      username: "marcos",
      status: ProjectStatus.APPROVED,
      featured: false,
      tags: ["ecommerce", "headless", "stripe", "tienda", "ventas"],
      technologies: ["Next.js", "React", "TypeScript", "Stripe", "PostgreSQL", "Cloudflare"],
      daysAgo: 3,
      votesBase: 53,
      viewsBase: 810,
      favoritesBase: 18,
    },
    {
      name: "InvoicePro App",
      slug: "invoicepro-app",
      tagline: "Facturación electrónica automatizada para freelancers y agencias digitales.",
      description: `InvoicePro elimina los dolores de cabeza de la facturación recurrente, la conciliación bancaria y el seguimiento de cobros atrasados con una interfaz limpia y moderna.

Crea presupuestos interactivos que tus clientes pueden aceptar y pagar directamente con tarjeta o transferencia. Convierte cotizaciones en facturas oficiales con un solo clic y envía recordatorios automáticos por WhatsApp y correo electrónico.

Incluye reportes financieros detallados con gráficos de flujo de caja, desglose de impuestos trimestrales y exportación a formatos contables estándar.`,
      websiteUrl: "https://invoicepro.example.com",
      logoColor: "#D97706",
      logoInitials: "IP",
      categorySlug: "finance",
      pricingType: PricingType.FREEMIUM,
      projectType: ProjectType.SAAS,
      country: "AR",
      username: "diego",
      status: ProjectStatus.APPROVED,
      featured: false,
      tags: ["finanzas", "facturacion", "freelance", "pagos", "contabilidad"],
      technologies: ["React", "TypeScript", "PostgreSQL", "Tailwind CSS", "REST API"],
      daysAgo: 4,
      votesBase: 42,
      viewsBase: 650,
      favoritesBase: 14,
    },
    {
      name: "TaskFlow Studio",
      slug: "taskflow-studio",
      tagline: "Tableros Kanban colaborativos con automatizaciones no-code y vistas de tiempo.",
      description: `TaskFlow Studio une la flexibilidad de los tableros Kanban con la potencia de diagramas de Gantt y automatizaciones visuales sin necesidad de código.

Diseñado para equipos remotos ágiles que necesitan visibilidad clara sobre sprints, dependencias de tareas y cargas de trabajo individuales sin la sobrecarga de herramientas corporativas tradicionales.

Permite conectar con GitHub, Slack, Figma y Google Calendar para centralizar actualizaciones y evitar cambios constantes de contexto.`,
      websiteUrl: "https://taskflow.example.com",
      logoColor: "#7C3AED",
      logoInitials: "TF",
      categorySlug: "productivity",
      pricingType: PricingType.FREEMIUM,
      projectType: ProjectType.SAAS,
      country: "CO",
      username: "laura",
      status: ProjectStatus.APPROVED,
      featured: false,
      tags: ["productividad", "kanban", "equipos", "proyectos", "nocode"],
      technologies: ["Vue.js", "Node.js", "PostgreSQL", "Redis", "Docker"],
      daysAgo: 5,
      votesBase: 38,
      viewsBase: 590,
      favoritesBase: 12,
    },
    {
      name: "CodeShare Hub",
      slug: "codeshare-hub",
      tagline: "Comparte fragmentos de código interactivos con resaltado de sintaxis y ejecución.",
      description: `CodeShare Hub es el playground definitivo para programadores que desean compartir snippets elegantes, documentación ejecutable y demostraciones técnicas con su comunidad.

Soporta más de 60 lenguajes de programación, temas visuales personalizables, generación de imágenes en alta resolución para redes sociales y embed interactivo para blogs o sitios de documentación.

Cuenta con un motor de ejecución en WebAssembly para lenguajes seleccionados, permitiendo probar código directamente en el navegador de forma segura.`,
      websiteUrl: "https://codeshare.example.com",
      logoColor: "#DB2777",
      logoInitials: "CS",
      categorySlug: "open-source",
      pricingType: PricingType.OPEN_SOURCE,
      projectType: ProjectType.OPEN_SOURCE,
      country: "ES",
      username: "carlos",
      status: ProjectStatus.APPROVED,
      featured: false,
      tags: ["codigo", "snippets", "desarrollo", "comunidad", "opensource"],
      technologies: ["Next.js", "TypeScript", "Prisma", "Tailwind CSS", "Rust"],
      daysAgo: 6,
      votesBase: 49,
      viewsBase: 730,
      favoritesBase: 16,
    },
    {
      name: "MeetNote AI",
      slug: "meetnote-ai",
      tagline: "Transcripción y resúmenes ejecutivos con puntos de acción de tus videollamadas.",
      description: `MeetNote AI se integra silenciosamente a tus reuniones en Google Meet, Zoom y Microsoft Teams para capturar cada detalle importante y generar actas de reunión estructuradas.

Identifica oradores con alta precisión, resalta decisiones clave, compromisos adquiridos y redacta correos de seguimiento automáticos listos para enviar al equipo.

Cumple con estrictos estándares de privacidad de datos, encriptación de extremo a extremo y opción de auto-eliminación de grabaciones tras el procesamiento.`,
      websiteUrl: "https://meetnote.example.com",
      logoColor: "#2563EB",
      logoInitials: "MN",
      categorySlug: "productivity",
      pricingType: PricingType.FREEMIUM,
      projectType: ProjectType.AI,
      country: "US",
      username: "sofia",
      status: ProjectStatus.APPROVED,
      featured: false,
      tags: ["ia", "reuniones", "transcripcion", "resumenes", "productividad"],
      technologies: ["Python", "FastAPI", "OpenAI", "React", "PostgreSQL"],
      daysAgo: 7,
      votesBase: 35,
      viewsBase: 510,
      favoritesBase: 9,
    },
    {
      name: "PixelForge Studio",
      slug: "pixelforge-studio",
      tagline: "Editor de gráficos vectoriales y mockups 3D directamente en el navegador.",
      description: `PixelForge Studio pone a disposición de diseñadores y desarrolladores herramientas vectoriales de nivel profesional sin necesidad de instalar software pesado.

Genera mockups tridimensionales de dispositivos en tiempo real con texturas personalizables, iluminación dinámica y renderizado acelerado por GPU en WebGL.

Exporta en formatos SVG limpios, PNG transparente, WebP y secuencias animadas optimizadas para presentaciones y lanzamientos de productos.`,
      websiteUrl: "https://pixelforge.example.com",
      logoColor: "#EA580C",
      logoInitials: "PF",
      categorySlug: "design",
      pricingType: PricingType.FREEMIUM,
      projectType: ProjectType.TOOL,
      country: "US",
      username: "elena",
      status: ProjectStatus.APPROVED,
      featured: false,
      tags: ["diseno", "mockups", "3d", "vectores", "ui-ux"],
      technologies: ["React", "TypeScript", "Tailwind CSS", "Cloudflare"],
      daysAgo: 8,
      votesBase: 31,
      viewsBase: 460,
      favoritesBase: 8,
    },
    {
      name: "Formly Forms",
      slug: "formly-forms",
      tagline: "Crea formularios conversacionales y encuestas inteligentes sin backend.",
      description: `Formly Forms te permite diseñar formularios tipo typeform en minutos con lógica condicional avanzada, validación de datos en tiempo real e integraciones directas con Notion, Airtable y Google Sheets.

Recibe alertas instantáneas en Discord o Telegram cuando un prospecto calificado completa un formulario, y conecta webhooks para automatizar flujos complejos en Zapier o Make.

Incluye analítica de abandono por pregunta para optimizar tasas de conversión y temas personalizables que se adaptan al branding de tu marca.`,
      websiteUrl: "https://formly.example.com",
      logoColor: "#0D9488",
      logoInitials: "FF",
      categorySlug: "marketing",
      pricingType: PricingType.FREEMIUM,
      projectType: ProjectType.SAAS,
      country: "BR",
      username: "marcos",
      status: ProjectStatus.APPROVED,
      featured: false,
      tags: ["formularios", "encuestas", "marketing", "leads", "nocode"],
      technologies: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
      daysAgo: 9,
      votesBase: 27,
      viewsBase: 410,
      favoritesBase: 7,
    },
    {
      name: "Nomadly Pass",
      slug: "nomadly-pass",
      tagline: "Comunidad y guía de ciudades para nómadas digitales y trabajadores remotos.",
      description: `Nomadly Pass reúne información verificada sobre costo de vida, velocidad de internet, espacios de coworking seguros y requisitos de visas para nómadas en más de 300 ciudades del mundo.

Conecta con otros profesionales remotos en tu misma ubicación mediante canales de chat geolocalizados, eventos comunitarios semanales y descuentos exclusivos en alojamientos de media estancia.

Filtra destinos según clima actual, zonas horarias compatibles con tu equipo y facilidades bancarias para expatriados.`,
      websiteUrl: "https://nomadly.example.com",
      logoColor: "#059669",
      logoInitials: "NP",
      categorySlug: "websites",
      pricingType: PricingType.FREE,
      projectType: ProjectType.WEBSITE,
      country: "ES",
      username: "carlos",
      status: ProjectStatus.APPROVED,
      featured: false,
      tags: ["nomadas", "viajes", "remoto", "comunidad", "ciudades"],
      technologies: ["Astro", "Tailwind CSS", "TypeScript", "PostgreSQL"],
      daysAgo: 10,
      votesBase: 24,
      viewsBase: 380,
      favoritesBase: 6,
    },
    // Proyectos pendientes para la bandeja de moderación del admin
    {
      name: "Hookline Analytics",
      slug: "hookline-analytics",
      tagline: "Monitor de webhooks en tiempo real con repetición de cargas y alertas de error.",
      description: `Hookline Analytics ofrece observabilidad completa para APIs y webhooks entrantes y salientes en sistemas distribuidos.

Captura cada payload HTTP con encabezados, latencias y códigos de respuesta, permitiendo reproducir llamadas fallidas con un solo clic para acelerar la depuración.

Configura alertas personalizadas en Slack o correo electrónico cuando la tasa de fallos de un endpoint supere umbrales críticos.`,
      websiteUrl: "https://hookline.example.com",
      logoColor: "#6D28D9",
      logoInitials: "HA",
      categorySlug: "developer-tools",
      pricingType: PricingType.FREEMIUM,
      projectType: ProjectType.TOOL,
      country: "AR",
      username: "diego",
      status: ProjectStatus.PENDING,
      featured: false,
      tags: ["webhooks", "apis", "monitoreo", "backend", "observabilidad"],
      technologies: ["Go", "PostgreSQL", "Redis", "React"],
      daysAgo: 0,
      votesBase: 0,
      viewsBase: 12,
      favoritesBase: 0,
    },
    {
      name: "Stackfire Cloud",
      slug: "stackfire-cloud",
      tagline: "Despliegue instantáneo de bases de datos PostgreSQL y Redis aisladas.",
      description: `Stackfire Cloud proporciona bases de datos administradas de baja latencia con escalado automático de recursos y almacenamiento NVMe ultrarrápido.

Aprovisiona réplicas de lectura globales con un clic, gestiona copias de seguridad continuas y accede a una consola SQL interactiva desde el navegador.

Ideal para proyectos en etapas tempranas que necesitan infraestructura confiable sin costos fijos prohibitivos.`,
      websiteUrl: "https://stackfire.example.com",
      logoColor: "#C026D3",
      logoInitials: "SC",
      categorySlug: "hosting",
      pricingType: PricingType.PAID,
      projectType: ProjectType.STARTUP,
      country: "CO",
      username: "laura",
      status: ProjectStatus.PENDING,
      featured: false,
      tags: ["hosting", "bases-de-datos", "postgresql", "redis", "cloud"],
      technologies: ["Kubernetes", "PostgreSQL", "Docker", "Next.js"],
      daysAgo: 0,
      votesBase: 0,
      viewsBase: 8,
      favoritesBase: 0,
    },
  ];

  const allUserIds = Object.values(createdUsers);

  for (const proj of projectsData) {
    const userId = createdUsers[proj.username] || allUserIds[0];
    const categoryId = catMap[proj.categorySlug] || categories[0].id;
    const launchDate = new Date(Date.now() - proj.daysAgo * 24 * 60 * 60 * 1000);
    const logoUrl = generateSvgAvatar(proj.logoInitials, proj.logoColor);

    const screenshots = [
      `https://picsum.photos/seed/${proj.slug}-1/1280/720`,
      `https://picsum.photos/seed/${proj.slug}-2/1280/720`,
      `https://picsum.photos/seed/${proj.slug}-3/1280/720`,
    ];

    const project = await prisma.project.upsert({
      where: { slug: proj.slug },
      update: {
        name: proj.name,
        tagline: proj.tagline,
        description: proj.description,
        websiteUrl: proj.websiteUrl,
        logoUrl,
        screenshots,
        categoryId,
        pricingType: proj.pricingType,
        projectType: proj.projectType,
        country: proj.country,
        launchDate,
        status: proj.status,
        featured: proj.featured,
        viewsCount: proj.viewsBase,
        votesCount: proj.votesBase,
        favoritesCount: proj.favoritesBase,
        isDemo: true,
      },
      create: {
        slug: proj.slug,
        name: proj.name,
        tagline: proj.tagline,
        description: proj.description,
        websiteUrl: proj.websiteUrl,
        logoUrl,
        screenshots,
        categoryId,
        pricingType: proj.pricingType,
        projectType: proj.projectType,
        country: proj.country,
        launchDate,
        status: proj.status,
        featured: proj.featured,
        viewsCount: proj.viewsBase,
        votesCount: proj.votesBase,
        favoritesCount: proj.favoritesBase,
        userId,
        isDemo: true,
      },
    });

    // Conectar Tags
    for (const tagSlug of proj.tags) {
      const tagName = tagSlug.replace(/-/g, " ");
      const tag = await prisma.tag.upsert({
        where: { slug: tagSlug },
        update: { name: tagName },
        create: { slug: tagSlug, name: tagName },
      });

      await prisma.projectTag.upsert({
        where: { projectId_tagId: { projectId: project.id, tagId: tag.id } },
        update: {},
        create: { projectId: project.id, tagId: tag.id },
      });
    }

    // Conectar Tecnologías
    for (const techName of proj.technologies) {
      const techSlug = techName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const tech = await prisma.technology.upsert({
        where: { slug: techSlug },
        update: { name: techName },
        create: { slug: techSlug, name: techName },
      });

      await prisma.projectTechnology.upsert({
        where: { projectId_technologyId: { projectId: project.id, technologyId: tech.id } },
        update: {},
        create: { projectId: project.id, technologyId: tech.id },
      });
    }

    // Crear votos demo
    if (proj.status === ProjectStatus.APPROVED) {
      for (const uId of allUserIds) {
        // Asignar voto con probabilidad
        if (Math.random() > 0.3) {
          const voteTime = new Date(Date.now() - Math.random() * (proj.daysAgo + 1) * 24 * 60 * 60 * 1000);
          await prisma.projectVote.upsert({
            where: { projectId_userId: { projectId: project.id, userId: uId } },
            update: { createdAt: voteTime },
            create: { projectId: project.id, userId: uId, createdAt: voteTime },
          });
        }
      }

      // Favoritos demo
      const randomFavUser = allUserIds[Math.floor(Math.random() * allUserIds.length)];
      await prisma.favorite.upsert({
        where: { projectId_userId: { projectId: project.id, userId: randomFavUser } },
        update: {},
        create: { projectId: project.id, userId: randomFavUser },
      });
    }
  }

  // 6. Comments demo (con anidación)
  console.log("Creating demo comments...");
  const firstApprovedProject = await prisma.project.findFirst({
    where: { slug: "ai-writer-pro" },
  });

  if (firstApprovedProject) {
    const comment1 = await prisma.comment.create({
      data: {
        projectId: firstApprovedProject.id,
        userId: createdUsers["carlos"],
        body: "¡Felicitaciones por el lanzamiento! La velocidad de generación y la integración con WordPress funcionan de maravilla. ¿Tienen planes de añadir soporte para Ghost en el roadmap?",
        status: CommentStatus.VISIBLE,
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
    });

    // Respuesta anidada
    await prisma.comment.create({
      data: {
        projectId: firstApprovedProject.id,
        userId: createdUsers["elena"],
        parentId: comment1.id,
        body: "¡Muchas gracias Carlos! Sí, la integración directa con Ghost y Notion ya está en desarrollo y saldrá en la versión 1.2 la próxima semana.",
        status: CommentStatus.VISIBLE,
        createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
      },
    });

    await prisma.comment.create({
      data: {
        projectId: firstApprovedProject.id,
        userId: createdUsers["marcos"],
        body: "Gran diseño de interfaz, muy limpio y rápido. Les dejé mi voto.",
        status: CommentStatus.VISIBLE,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      },
    });

    // Actualizar conteo de comentarios
    await prisma.project.update({
      where: { id: firstApprovedProject.id },
      data: { commentsCount: 3 },
    });
  }

  // 7. Demo Reports para admin
  console.log("Creating demo reports...");
  const devProject = await prisma.project.findFirst({
    where: { slug: "cloudpanel-x" },
  });

  if (devProject) {
    await prisma.report.create({
      data: {
        targetType: ReportTarget.PROJECT,
        targetId: devProject.id,
        projectId: devProject.id,
        reporterId: createdUsers["diego"],
        type: ReportType.OTHER,
        detail: "Reporte de prueba demo: Verificar enlace de documentación técnica.",
        status: ReportStatus.OPEN,
      },
    });
  }

  console.log("✅ LaunchHub Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
