import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProfileSettingsForm } from "@/components/dashboard/ProfileSettingsForm";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const user = await db.user.findUnique({
    where: { id: session!.user.id },
  });

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#E4572E] uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#17150F] dark:text-[#FAF9F6]">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Customize your public maker information, avatar, and manage your data privacy.
        </p>
      </div>

      <ProfileSettingsForm user={user} />
    </div>
  );
}
