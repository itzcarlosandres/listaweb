"use client";

import { useState, useTransition } from "react";
import { toggleProductActive } from "@/server/actions/admin";
import { ProductEditModal, type ProductData } from "./ProductEditModal";
import { ProductKind } from "@prisma/client";
import { Edit2, Power, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    kind: ProductKind;
    priceCents: number;
    currency: string;
    active: boolean;
  };
}

export function ProductActions({ product }: ProductActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await toggleProductActive(product.id);
      if (res.success) {
        toast.success(`Estado de "${product.name}" actualizado`);
      } else {
        toast.error(res.error || "No se pudo cambiar el estado");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="p-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors inline-flex items-center gap-1 border border-[#E7E4DB] dark:border-[#2E2B23]"
          title="Editar precio y detalles"
        >
          <Edit2 className="w-3.5 h-3.5 text-primary" />
          <span>Editar</span>
        </button>

        <button
          type="button"
          disabled={isPending}
          onClick={handleToggle}
          className={`p-1.5 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1 border ${
            product.active
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200"
          }`}
          title={product.active ? "Desactivar venta" : "Activar venta"}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{product.active ? "Activo" : "Inactivo"}</span>
        </button>
      </div>

      <ProductEditModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}

export function CreateProductButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Nuevo Producto / Plan
      </button>

      <ProductEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
