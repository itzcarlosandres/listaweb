"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Correo electrónico o contraseña incorrectos");
        setIsLoading(false);
        return;
      }

      toast.success("¡Bienvenido de vuelta a LaunchHub!");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Error al iniciar sesión. Inténtalo de nuevo.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
          Correo Electrónico
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            {...register("email")}
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 focus:border-[#E4572E] transition-all"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
            Contraseña
          </label>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 focus:border-[#E4572E] transition-all"
          />
        </div>
        {errors.password && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-md shadow-[#E4572E]/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          <>
            Iniciar Sesión
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="pt-2 text-center text-xs text-neutral-600 dark:text-neutral-400">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-semibold text-[#E4572E] hover:underline">
          Regístrate gratis
        </Link>
      </div>
    </form>
  );
}
