"use client";

import { useState, useTransition } from "react";
import { updateProduct, createProduct } from "@/server/actions/admin";
import { ProductKind } from "@prisma/client";
import { X, Save, Plus, Tag } from "lucide-react";
import { toast } from "sonner";

export interface ProductData {
  id?: string;
  name: string;
  slug: string;
  kind: ProductKind;
  priceCents: number;
  currency: string;
  active: boolean;
}

interface ProductEditModalProps {
  product?: ProductData;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductEditModal({ product, isOpen, onClose }: ProductEditModalProps) {
  const isEditing = !!product?.id;
  const [formData, setFormData] = useState<ProductData>({
    id: product?.id,
    name: product?.name || "",
    slug: product?.slug || "",
    kind: product?.kind || ProductKind.PRO_SUBSCRIPTION,
    priceCents: product?.priceCents || 1900,
    currency: product?.currency || "USD",
    active: product?.active ?? true,
  });

  const [priceUsd, setPriceUsd] = useState<string>(
    product ? (product.priceCents / 100).toFixed(2) : "19.00"
  );
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedCents = Math.round(parseFloat(priceUsd || "0") * 100);

    if (calculatedCents < 0 || isNaN(calculatedCents)) {
      toast.error("Por favor introduce un precio válido");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        kind: formData.kind,
        priceCents: calculatedCents,
        currency: formData.currency,
        active: formData.active,
      };

      if (isEditing && product?.id) {
        const res = await updateProduct(product.id, payload);
        if (res.success) {
          toast.success("Producto actualizado correctamente");
          onClose();
        } else {
          toast.error(res.error || "Error al actualizar producto");
        }
      } else {
        const res = await createProduct(payload);
        if (res.success) {
          toast.success("Nuevo producto creado correctamente");
          onClose();
        } else {
          toast.error(res.error || "Error al crear producto");
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#1E1C16] border border-[#E7E4DB] dark:border-[#2E2B23] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E7E4DB] dark:border-[#2E2B23] bg-[#FAF9F6] dark:bg-[#17150F]">
          <h2 className="text-base font-bold font-heading text-neutral-950 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            {isEditing ? "Editar Producto Comercial" : "Crear Nuevo Producto"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ej: Plan Pro Anual, Boost 14 Días"
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB] dark:border-[#2E2B23] rounded-xl focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Slug Identificador *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="ej: pro-anual"
                className="w-full px-3 py-2 text-sm font-mono bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB] dark:border-[#2E2B23] rounded-xl focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Tipo (Kind) *
              </label>
              <select
                value={formData.kind}
                onChange={(e) => setFormData({ ...formData, kind: e.target.value as ProductKind })}
                className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB] dark:border-[#2E2B23] rounded-xl focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
              >
                <option value={ProductKind.PRO_SUBSCRIPTION}>PRO_SUBSCRIPTION</option>
                <option value={ProductKind.BOOST_7}>BOOST_7 (1 semana)</option>
                <option value={ProductKind.BOOST_30}>BOOST_30 (1 mes)</option>
                <option value={ProductKind.SPONSOR}>SPONSOR</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Precio en USD ($) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  placeholder="19.00"
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold bg-neutral-50 dark:bg-neutral-900 border border-[#E7E4DB] dark:border-[#2E2B23] rounded-xl focus:outline-none focus:border-primary text-neutral-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1">
                Estado
              </label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded text-primary focus:ring-primary"
                />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {formData.active ? "Activo para venta" : "Inactivo (Oculto)"}
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E7E4DB] dark:border-[#2E2B23] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              {isPending ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isEditing ? (
                <Save className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {isEditing ? "Guardar Cambios" : "Crear Producto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
