"use client";

import { useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/server/actions/notifications";
import {
  ChevronUp,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  XCircle,
  Flame,
  Zap,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { NotificationType } from "@prisma/client";

export interface NotificationItemData {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date | string;
  actorId?: string | null;
  projectId?: string | null;
  project?: { name: string; slug: string } | null;
}

interface NotificationListProps {
  notifications: NotificationItemData[];
}

export function NotificationList({ notifications }: NotificationListProps) {
  const [isPending, startTransition] = useTransition();

  const handleMarkAll = () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsRead();
      if (!res.success) toast.error("Could not update notifications");
      else toast.success("All notifications marked as read");
    });
  };

  const handleMarkOne = (id: string) => {
    startTransition(async () => {
      await markNotificationAsRead(id);
    });
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "VOTE":
        return <ChevronUp className="w-4 h-4 text-[#E4572E] stroke-[3]" />;
      case "COMMENT":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case "FOLLOW":
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      case "PROJECT_APPROVED":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "PROJECT_REJECTED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "TRENDING":
        return <Flame className="w-4 h-4 text-amber-500" />;
      case "BOOST_ENDED":
        return <Zap className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getNotificationText = (n: NotificationItemData) => {
    switch (n.type) {
      case "VOTE":
        return (
          <span>
            Your project{" "}
            {n.project ? (
              <Link href={`/project/${n.project.slug}`} className="font-bold text-[#E4572E] hover:underline">
                {n.project.name}
              </Link>
            ) : (
              "a project"
            )}{" "}
            received a new upvote.
          </span>
        );
      case "COMMENT":
        return (
          <span>
            Someone left a comment on your project{" "}
            {n.project ? (
              <Link href={`/project/${n.project.slug}#comments`} className="font-bold text-[#E4572E] hover:underline">
                {n.project.name}
              </Link>
            ) : (
              "a project"
            )}
            .
          </span>
        );
      case "FOLLOW":
        return <span>You have a new follower on LaunchHub!</span>;
      case "PROJECT_APPROVED":
        return (
          <span>
            🎉 Great news! Your project{" "}
            {n.project ? (
              <Link href={`/project/${n.project.slug}`} className="font-bold text-emerald-600 hover:underline">
                {n.project.name}
              </Link>
            ) : (
              "your project"
            )}{" "}
            has been approved and is now live on public rankings.
          </span>
        );
      case "PROJECT_REJECTED":
        return (
          <span>
            Your project requires revisions before it can be approved. Check details on your projects dashboard.
          </span>
        );
      case "TRENDING":
        return (
          <span>
            🔥 Congratulations! Your project made it into today&apos;s Trending Top.
          </span>
        );
      case "BOOST_ENDED":
        return <span>The boost promotion for your project has concluded.</span>;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-neutral-500">
          {unreadCount} unread of {notifications.length} total
        </span>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-700 dark:text-neutral-300 hover:border-[#E4572E] transition-colors cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCheck className="w-3.5 h-3.5" />
            )}
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const timeAgo = formatDistanceToNow(new Date(n.createdAt), {
            addSuffix: true,
            locale: enUS,
          });

          return (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) handleMarkOne(n.id);
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                !n.read
                  ? "bg-white dark:bg-[#1A1813] border-[#E4572E]/40 shadow-xs"
                  : "bg-[#FAF9F6] dark:bg-[#14120E] border-[#E7E4DB] dark:border-[#2E2B23] opacity-80"
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                {getNotificationIcon(n.type)}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs sm:text-sm text-[#17150F] dark:text-[#FAF9F6] leading-snug">
                  {getNotificationText(n)}
                </div>
                <span className="text-[11px] font-mono text-neutral-400 block">
                  {timeAgo}
                </span>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-[#E4572E] shrink-0 mt-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
