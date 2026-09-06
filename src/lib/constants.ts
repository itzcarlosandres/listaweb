export const PAGE_SIZE = 12;
export const MAX_PROJECT_TAGS = 8;
export const MAX_PROJECT_TECHNOLOGIES = 10;
export const MAX_SCREENSHOTS = 6;
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_LOGO_SIZE_MB = 2;

export const CATEGORIES_SEED = [
  { slug: "ai", name: "AI", icon: "Bot", description: "Inteligencia artificial, agentes, modelos y automatizaciones", order: 1 },
  { slug: "saas", name: "SaaS", icon: "Cloud", description: "Software as a Service para empresas y usuarios", order: 2 },
  { slug: "websites", name: "Websites", icon: "Globe", description: "Sitios web, landing pages y experiencias web", order: 3 },
  { slug: "ecommerce", name: "E-commerce", icon: "ShoppingBag", description: "Tiendas online, pasarelas y plataformas de venta", order: 4 },
  { slug: "mobile-apps", name: "Mobile Apps", icon: "Smartphone", description: "Aplicaciones nativas e híbridas para iOS y Android", order: 5 },
  { slug: "developer-tools", name: "Developer Tools", icon: "Code2", description: "Herramientas, librerías, APIs y utilidades para programadores", order: 6 },
  { slug: "marketing", name: "Marketing", icon: "Megaphone", description: "SEO, analítica, email marketing y crecimiento", order: 7 },
  { slug: "design", name: "Design", icon: "Palette", description: "Herramientas de diseño, UI kits, recursos e ilustración", order: 8 },
  { slug: "productivity", name: "Productivity", icon: "Zap", description: "Gestión de tareas, notas, tiempo y flujos de trabajo", order: 9 },
  { slug: "finance", name: "Finance", icon: "DollarSign", description: "Contabilidad, inversiones, facturación y finanzas", order: 10 },
  { slug: "education", name: "Education", icon: "GraduationCap", description: "Cursos, plataformas de aprendizaje y recursos educativos", order: 11 },
  { slug: "games", name: "Games", icon: "Gamepad2", description: "Videojuegos independientes, web y móviles", order: 12 },
  { slug: "open-source", name: "Open Source", icon: "Github", description: "Software libre, proyectos comunitarios y repositorios abiertos", order: 13 },
  { slug: "wordpress", name: "WordPress", icon: "LayoutGrid", description: "Plugins, temas y utilidades del ecosistema WordPress", order: 14 },
  { slug: "hosting", name: "Hosting", icon: "Server", description: "Servidores, dominios, infraestructura y cloud", order: 15 },
  { slug: "other", name: "Other", icon: "Layers", description: "Otras herramientas y proyectos innovadores", order: 16 },
] as const;

export const TECHNOLOGIES_SEED = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Prisma",
  "Node.js", "Python", "FastAPI", "OpenAI", "Anthropic", "Supabase",
  "Vue.js", "Nuxt", "Svelte", "Astro", "Docker", "Kubernetes", "Redis",
  "GraphQL", "REST API", "Flutter", "React Native", "Swift", "Kotlin",
  "MongoDB", "MySQL", "AWS", "Cloudflare", "Vercel", "Stripe", "Go",
  "Rust", "PHP", "Laravel", "Django", "Ruby on Rails", "WordPress", "Shopify"
] as const;

export const PRODUCTS_SEED = [
  {
    slug: "pro-subscription",
    name: "Plan Pro LaunchHub",
    kind: "PRO_SUBSCRIPTION",
    priceCents: 1900,
    currency: "USD",
    active: true,
  },
  {
    slug: "boost-7",
    name: "Boost 7 Días",
    kind: "BOOST_7",
    priceCents: 2900,
    currency: "USD",
    active: true,
  },
  {
    slug: "boost-30",
    name: "Boost 30 Días",
    kind: "BOOST_30",
    priceCents: 7900,
    currency: "USD",
    active: true,
  },
  {
    slug: "sponsor-home",
    name: "Sponsor Homepage",
    kind: "SPONSOR",
    priceCents: 14900,
    currency: "USD",
    active: true,
  },
] as const;
