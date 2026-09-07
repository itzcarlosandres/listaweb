import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Edit,
  Eye,
  ChevronUp,
  MessageSquare,
  Bookmark,
  CheckCircle2,
  Clock,
  XCircle,
  AlertOctagon,
} from "lucide-react";
import { CategoryBadge } from "@/components/shared/CategoryBadge";
import { CryptoCheckoutButton } from "@/components/payment/CryptoCheckoutButton";
import { ProjectStatus } from "@prisma/client";

export default async function UserProjectsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [projects, boostProduct] = await Promise.all([
    db.project.findMany({
      where: { userId },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findFirst({
      where: { kind: "BOOST_7", active: true },
    }),
  ]);

  const getStatusBadge = (status: ProjectStatus, pricingType?: string, rejectionReason?: string | null) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            {pricingType === "PAID" ? "Payment Pending" : "In Review"}
          </span>
        );
      case "REJECTED":
        return (
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              <XCircle className="w-3.5 h-3.5" />
              Rejected
            </span>
            {rejectionReason && (
              <p className="text-[11px] text-red-500 max-w-xs">{rejectionReason}</p>
            )}
          </div>
        );
      case "SUSPENDED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
            <AlertOctagon className="w-3.5 h-3.5" />
            Suspended
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
            My Projects ({projects.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Manage, edit, and review the approval status of your project submissions.
          </p>
        </div>

        <Link
          href="/submit"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Submit New Project
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Info principal */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {project.logoUrl ? (
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-[#E7E4DB] dark:border-[#2E2B23] bg-neutral-50 dark:bg-neutral-900 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.logoUrl}
                      alt={project.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#E4572E] text-white font-bold flex items-center justify-center text-lg shrink-0">
                    {project.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="font-display font-bold text-base sm:text-lg text-[#17150F] dark:text-[#FAF9F6]">
                      {project.name}
                    </h2>
                    <CategoryBadge
                      slug={project.category.slug}
                      name={project.category.name}
                      icon={project.category.icon}
                      size="sm"
                    />
                    {getStatusBadge(project.status, project.pricingType, project.rejectionReason)}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-1">
                    {project.tagline}
                  </p>

                  {/* Métricas */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <ChevronUp className="w-3.5 h-3.5 text-[#E4572E]" />
                      {project.votesCount} upvotes
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      {project.viewsCount} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                      {project.favoritesCount} saved
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                      {project.commentsCount} comments
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-[#E7E4DB] dark:border-[#2E2B23] flex-wrap">
                {project.status === "PENDING" && project.pricingType === "PAID" && boostProduct && (
                  <CryptoCheckoutButton
                    productId={boostProduct.id}
                    projectId={project.id}
                    buttonText="Pay & Publish Now"
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] shadow-xs"
                  />
                )}

                {project.status === "APPROVED" && (
                  <Link
                    href={`/project/${project.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View live
                  </Link>
                )}

                <Link
                  href={`/dashboard/projects/${project.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-700 dark:text-neutral-300 hover:border-[#E4572E] hover:text-[#E4572E] transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 rounded-3xl bg-white dark:bg-[#1A1813] border border-dashed border-[#E7E4DB] dark:border-[#2E2B23] space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center mx-auto">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-[#17150F] dark:text-[#FAF9F6]">
              You don&apos;t have any projects registered
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Start by launching your first web, tool, SaaS, or startup for free.
            </p>
          </div>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Submit Project Free
          </Link>
        </div>
      )}
    </div>
  );
}
