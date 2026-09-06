"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { signOut } from "next-auth/react";
import { updateUserProfile, exportUserData, type ProfileUpdateInput } from "@/server/actions/users";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  User,
  Globe,
  MapPin,
  Upload,
  Download,
  LogOut,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileSettingsFormProps {
  user: {
    id: string;
    name?: string | null;
    username: string;
    email: string;
    image?: string | null;
    bio?: string | null;
    website?: string | null;
    country?: string | null;
    role: string;
    plan: string;
  };
}

export function ProfileSettingsForm({ user }: ProfileSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    defaultValues: {
      name: user.name || "",
      bio: user.bio || "",
      website: user.website || "",
      country: user.country || "",
      image: user.image || "",
    },
  });

  const currentImage = watch("image");

  const handleAvatarUpload = async (file: File) => {
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Error al subir avatar");
        return;
      }

      setValue("image", data.url);
      toast.success("Avatar actualizado");
    } catch {
      toast.error("Error al subir imagen");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = (data: ProfileUpdateInput) => {
    startTransition(async () => {
      const res = await updateUserProfile(data);
      if (!res.success) {
        toast.error(res.error || "No se pudo actualizar el perfil");
      } else {
        toast.success("Perfil actualizado correctamente");
      }
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportUserData();
      if (!res.success || !res.data) {
        toast.error(res.error || "Error al exportar datos");
        return;
      }

      // Descargar archivo JSON en el navegador
      const blob = new Blob([res.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `launchhub-data-${user.username}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Tus datos han sido exportados en formato JSON");
    } catch {
      toast.error("Error al exportar datos");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Formulario de Perfil */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-6 shadow-xs">
        <h2 className="font-display font-bold text-lg text-[#17150F] dark:text-[#FAF9F6]">
          Información del Perfil
        </h2>

        {/* Avatar Upload */}
        <div className="flex items-center gap-5">
          <UserAvatar
            src={currentImage}
            name={watch("name") || user.username}
            size="xl"
            className="w-20 h-20"
          />

          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors cursor-pointer">
              {isUploadingAvatar ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              Cambiar foto de perfil
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
            </label>
            <p className="text-[11px] text-neutral-500 mt-1">
              JPG, PNG o WebP, máx 2MB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Nombre Completo
            </label>
            <input
              {...register("name")}
              type="text"
              placeholder="Tu nombre"
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Nombre de Usuario (@)
            </label>
            <input
              type="text"
              disabled
              value={user.username}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-neutral-100 dark:bg-neutral-800/50 border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-500 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Biografía Breve
          </label>
          <textarea
            {...register("bio")}
            rows={3}
            maxLength={300}
            placeholder="Cuéntale a la comunidad qué proyectos estás creando, tus intereses o especialidad..."
            className="w-full p-3.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              Sitio Web Personal
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                {...register("website")}
                type="url"
                placeholder="https://tudominio.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
              />
            </div>
            {errors.website && (
              <p className="mt-1 text-xs text-red-500">{errors.website.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
              País (Código ISO, ej: ES, MX)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                {...register("country")}
                type="text"
                maxLength={2}
                placeholder="ES"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm uppercase bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* 2. Exportar Datos y Privacidad (GDPR) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-4 shadow-xs">
        <h2 className="font-display font-bold text-lg text-[#17150F] dark:text-[#FAF9F6]">
          Privacidad y Exportación de Datos
        </h2>
        <p className="text-xs text-neutral-500">
          Descarga una copia completa de toda tu información, historial de votos, comentarios y proyectos en formato JSON.
        </p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          Exportar mis datos (JSON)
        </button>
      </div>

      {/* 3. Sesión y Cierre */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-red-200 dark:border-red-950/50 space-y-4 shadow-xs">
        <h2 className="font-display font-bold text-lg text-red-600 dark:text-red-400">
          Cerrar Sesión
        </h2>
        <p className="text-xs text-neutral-500">
          Finaliza tu sesión activa en este dispositivo de forma segura.
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
