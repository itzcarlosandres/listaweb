"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { registerSchema, type RegisterInput } from "@/schemas/auth";
import { registerUser } from "@/server/actions/users";
import { Loader2, Mail, Lock, User, AtSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    try {
      const res = await registerUser(data);

      if (!res.success) {
        toast.error(res.error || "Could not complete registration");
        setIsLoading(false);
        return;
      }

      toast.success("Account created successfully! Signing in...");

      // Autologin
      const signInRes = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push("/login");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Network error during registration. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              {...register("name")}
              type="text"
              placeholder="Carlos Mendoza"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 focus:border-[#E4572E] transition-all"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Username
          </label>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              {...register("username")}
              type="text"
              placeholder="carlosm"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 focus:border-[#E4572E] transition-all"
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.username.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            {...register("email")}
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 focus:border-[#E4572E] transition-all"
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              {...register("password")}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 focus:border-[#E4572E] transition-all"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#E4572E]/20 focus:border-[#E4572E] transition-all"
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-md shadow-[#E4572E]/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating your account...
          </>
        ) : (
          <>
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
