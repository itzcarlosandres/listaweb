"use client";

import { useTransition } from "react";
import { updateUserRole, updateUserPlan } from "@/server/actions/admin";
import { Role, Plan } from "@prisma/client";
import { toast } from "sonner";

interface UserRoleActionsProps {
  userId: string;
  currentRole: Role;
  currentPlan: Plan;
}

export function UserRoleActions({ userId, currentRole, currentPlan }: UserRoleActionsProps) {
  const [, startTransition] = useTransition();

  const handleRoleChange = (newRole: Role) => {
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole);
      if (!res.success) toast.error(res.error || "No se pudo cambiar el rol");
      else toast.success(`Rol de usuario cambiado a ${newRole}`);
    });
  };

  const handlePlanChange = (newPlan: Plan) => {
    startTransition(async () => {
      const res = await updateUserPlan(userId, newPlan);
      if (!res.success) toast.error(res.error || "No se pudo cambiar el plan");
      else toast.success(`Plan cambiado a ${newPlan}`);
    });
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      <select
        value={currentRole}
        onChange={(e) => handleRoleChange(e.target.value as Role)}
        className="px-2 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-700 dark:text-neutral-300"
      >
        <option value={Role.USER}>USER</option>
        <option value={Role.ADMIN}>ADMIN</option>
      </select>

      <select
        value={currentPlan}
        onChange={(e) => handlePlanChange(e.target.value as Plan)}
        className="px-2 py-1 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-700 dark:text-neutral-300"
      >
        <option value={Plan.FREE}>FREE</option>
        <option value={Plan.PRO}>PRO</option>
      </select>
    </div>
  );
}
