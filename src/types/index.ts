import { Role, Plan, PricingType, ProjectType, ProjectStatus, CommentStatus, NotificationType } from "@prisma/client";

export type { Role, Plan, PricingType, ProjectType, ProjectStatus, CommentStatus, NotificationType };

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SessionUser {
  id: string;
  name?: string | null;
  username: string;
  email: string;
  image?: string | null;
  role: Role;
  plan: Plan;
}

export interface ProjectWithDetails {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string | null;
  screenshots: string[];
  categoryId: string;
  pricingType: PricingType;
  projectType: ProjectType;
  country?: string | null;
  launchDate: Date;
  status: ProjectStatus;
  featured: boolean;
  boostedUntil?: Date | null;
  viewsCount: number;
  votesCount: number;
  favoritesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name?: string | null;
    username: string;
    image?: string | null;
    bio?: string | null;
    website?: string | null;
    role: Role;
    plan: Plan;
  };
  category: {
    id: string;
    slug: string;
    name: string;
    icon: string;
  };
  tags: { tag: { id: string; slug: string; name: string } }[];
  technologies: { technology: { id: string; slug: string; name: string } }[];
  hasVoted?: boolean;
  hasFavorited?: boolean;
}
