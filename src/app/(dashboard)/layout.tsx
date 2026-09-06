import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const unreadCount = await db.notification.count({
    where: {
      userId: session.user.id,
      read: false,
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] dark:bg-[#12110D]">
      <Navbar />
      <DashboardNav
        role={session.user.role}
        unreadNotificationsCount={unreadCount}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
