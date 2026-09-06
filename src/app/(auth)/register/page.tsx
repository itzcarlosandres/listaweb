import { Suspense } from "react";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { BrandLogo } from "@/components/shared/BrandLogo";
import { getGeneralSeoSettings } from "@/server/actions/admin";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default async function RegisterPage() {
  const brandSettings = await getGeneralSeoSettings();

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FAF9F6] dark:bg-[#12110D]">
      {/* Columna Izquierda: Branding y Beneficios */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[#17150F] text-[#FAF9F6] relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#E4572E]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <BrandLogo
              mode={brandSettings.logoMode}
              logoUrl={brandSettings.logoUrl}
              iconName={brandSettings.logoIcon}
              text={brandSettings.logoText}
              textHighlight={brandSettings.logoTextHighlight}
              iconBg={brandSettings.logoIconBg}
              size="lg"
            />
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-md">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/20 text-[#E4572E] border border-[#E4572E]/30">
              <Sparkles className="w-3.5 h-3.5" />
              100% Free Submission
            </span>
            <h2 className="text-2xl font-bold tracking-tight font-display">
              Join thousands of founders and developers.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              "Launch your websites, apps, and tools without any cost.",
              "Gain genuine visibility through community-driven upvotes.",
              "Real-time analytics on visits, clicks, and feedback.",
              "Build your maker reputation with your public profile.",
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#E4572E] shrink-0 mt-0.5" />
                <span className="text-sm text-neutral-300 leading-snug">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} {brandSettings.siteName || "LaunchHub"} Inc.</span>
          <span>No credit card required</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <BrandLogo
                mode={brandSettings.logoMode}
                logoUrl={brandSettings.logoUrl}
                iconName={brandSettings.logoIcon}
                text={brandSettings.logoText}
                textHighlight={brandSettings.logoTextHighlight}
                iconBg={brandSettings.logoIconBg}
                size="md"
              />
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-[#17150F] dark:text-[#FAF9F6]">
              Create your free account
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Launch your project and start getting early traction today.
            </p>
          </div>

          <Suspense fallback={<div className="h-72 animate-pulse bg-neutral-100 dark:bg-neutral-800 rounded-xl" />}>
            <RegisterForm />
          </Suspense>

          <p className="text-center text-xs text-neutral-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#E4572E] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
