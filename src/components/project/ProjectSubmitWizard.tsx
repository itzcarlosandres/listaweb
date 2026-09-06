"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSubmitSchema, type ProjectSubmitInput } from "@/schemas/project";
import { createProject, updateProject } from "@/server/actions/projects";
import { CATEGORIES_SEED, TECHNOLOGIES_SEED } from "@/lib/constants";
import { ProjectCard } from "@/components/project/ProjectCard";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import {
  Rocket,
  Check,
  ArrowRight,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  Loader2,
  Sparkles,
  Layers,
  FileText,
  DollarSign,
  Eye,
  Globe,
  ChevronDown,
} from "lucide-react";
import { PricingType, ProjectType, Role, Plan, ProjectStatus } from "@prisma/client";
import { toast } from "sonner";
import type { ProjectWithDetails } from "@/types";

interface ProjectSubmitWizardProps {
  initialData?: ProjectSubmitInput & { id?: string };
  isEditing?: boolean;
}

const STEPS = [
  { id: 1, title: "Essentials", description: "Name, link and category", icon: Layers },
  { id: 2, title: "Details & Media", description: "Logo, screenshots and description", icon: FileText },
  { id: 3, title: "Model & Data", description: "Pricing and project type", icon: DollarSign },
  { id: 4, title: "Review & Submit", description: "Live preview and confirmation", icon: Eye },
];

export function ProjectSubmitWizard({ initialData, isEditing = false }: ProjectSubmitWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [renderTime] = useState(Date.now());
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [techInput, setTechInput] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProjectSubmitInput>({
    resolver: zodResolver(projectSubmitSchema),
    defaultValues: initialData || {
      name: "",
      tagline: "",
      websiteUrl: "",
      categoryId: CATEGORIES_SEED[0].slug,
      logoUrl: "",
      screenshots: [],
      description: "",
      tags: ["saas", "startup"],
      technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
      pricingType: PricingType.FREE,
      projectType: ProjectType.SAAS,
      country: "US",
      launchDate: new Date().toISOString().slice(0, 10),
      honeypot: "",
      renderTime,
    },
  });

  const formValues = watch();

  const faviconUrl = (() => {
    const url = (formValues.websiteUrl || "").trim();
    if (!url || url.length < 4) return null;
    try {
      const formatted = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
      const parsed = new URL(formatted);
      if (!parsed.hostname || !parsed.hostname.includes(".")) return null;
      return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
    } catch {
      return null;
    }
  })();

  // Autosave draft in localStorage (only if creating)
  useEffect(() => {
    if (!isEditing && typeof window !== "undefined") {
      const saved = localStorage.getItem("launchhub_submit_draft");
      if (saved && !initialData) {
        try {
          const parsed = JSON.parse(saved);
          Object.keys(parsed).forEach((k) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue(k as any, parsed[k]);
          });
        } catch {}
      }
    }
  }, [isEditing, initialData, setValue]);

  // Save on every change
  useEffect(() => {
    if (!isEditing && typeof window !== "undefined") {
      localStorage.setItem("launchhub_submit_draft", JSON.stringify(formValues));
    }
  }, [formValues, isEditing]);

  // Upload image via API route
  const handleFileUpload = async (file: File, type: "logo" | "screenshot") => {
    if (type === "logo") setIsUploadingLogo(true);
    else setIsUploadingScreenshot(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to upload image");
        return;
      }

      if (type === "logo") {
        setValue("logoUrl", data.url);
        toast.success("Logo uploaded successfully");
      } else {
        const currentScreenshots = formValues.screenshots || [];
        if (currentScreenshots.length >= 6) {
          toast.error("Maximum 6 screenshots allowed");
          return;
        }
        setValue("screenshots", [...currentScreenshots, data.url]);
        toast.success("Screenshot uploaded");
      }
    } catch {
      toast.error("Network error while uploading image");
    } finally {
      if (type === "logo") setIsUploadingLogo(false);
      else setIsUploadingScreenshot(false);
    }
  };

  // Add Tag
  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!clean) return;
    const currentTags = formValues.tags || [];
    if (currentTags.includes(clean)) return;
    if (currentTags.length >= 8) {
      toast.error("Maximum 8 tags allowed");
      return;
    }
    setValue("tags", [...currentTags, clean]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setValue(
      "tags",
      (formValues.tags || []).filter((t) => t !== tag)
    );
  };

  // Add Technology
  const handleAddTech = (techName?: string) => {
    const val = (techName || techInput).trim();
    if (!val) return;
    const currentTechs = formValues.technologies || [];
    if (currentTechs.includes(val)) return;
    if (currentTechs.length >= 10) {
      toast.error("Maximum 10 technologies allowed");
      return;
    }
    setValue("technologies", [...currentTechs, val]);
    setTechInput("");
  };

  const handleRemoveTech = (tech: string) => {
    setValue(
      "technologies",
      (formValues.technologies || []).filter((t) => t !== tech)
    );
  };

  // Validate before step change
  const nextStep = async () => {
    let fieldsToValidate: (keyof ProjectSubmitInput)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["name", "tagline", "websiteUrl", "categoryId"];
    } else if (currentStep === 2) {
      fieldsToValidate = ["description", "screenshots"];
    } else if (currentStep === 3) {
      fieldsToValidate = ["pricingType", "projectType"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit Form
  const onSubmit = async (data: ProjectSubmitInput) => {
    startTransition(async () => {
      data.renderTime = renderTime;

      let res;
      if (isEditing && initialData?.id) {
        res = await updateProject(initialData.id, data);
      } else {
        res = await createProject(data);
      }

      if (!res.success) {
        toast.error(res.error || "Could not save project");
      } else {
        if (!isEditing && typeof window !== "undefined") {
          localStorage.removeItem("launchhub_submit_draft");
        }
        toast.success(
          isEditing
            ? "Project updated successfully"
            : "Project submitted for review! An administrator will verify it before it goes live."
        );
        router.push("/dashboard/projects");
        router.refresh();
      }
    });
  };

  // Mock project object para la previsualización en vivo (Paso 4)
  const categorySelected =
    CATEGORIES_SEED.find((c) => c.slug === formValues.categoryId) || CATEGORIES_SEED[0];

  const previewProject: ProjectWithDetails = {
    id: "preview-id",
    slug: "preview-slug",
    name: formValues.name || "Your Project Name",
    tagline: formValues.tagline || "Tagline explaining your project and value proposition",
    description: formValues.description || "Detailed description...",
    websiteUrl: formValues.websiteUrl || "https://example.com",
    logoUrl: formValues.logoUrl,
    screenshots: formValues.screenshots || [],
    categoryId: categorySelected.slug,
    pricingType: formValues.pricingType,
    projectType: formValues.projectType,
    country: formValues.country,
    launchDate: new Date(),
    status: ProjectStatus.PENDING,
    featured: false,
    viewsCount: 1,
    votesCount: 0,
    favoritesCount: 0,
    commentsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: "preview-user",
      name: "You",
      username: "your_username",
      role: Role.USER,
      plan: Plan.FREE,
    },
    category: {
      id: "cat-id",
      slug: categorySelected.slug,
      name: categorySelected.name,
      icon: categorySelected.icon,
    },
    tags: (formValues.tags || []).map((t) => ({ tag: { id: t, slug: t, name: t } })),
    technologies: (formValues.technologies || []).map((tech) => ({
      technology: { id: tech, slug: tech, name: tech },
    })),
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Step Indicator */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                isCurrent
                  ? "bg-white dark:bg-[#1A1813] border-[#E4572E] shadow-xs"
                  : isDone
                  ? "bg-neutral-50 dark:bg-[#14120E] border-[#E7E4DB] dark:border-[#2E2B23]"
                  : "bg-neutral-50/50 dark:bg-[#14120E]/50 border-transparent opacity-60"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-[#E4572E] text-white"
                      : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.id}
                </div>
                <span className="font-display font-bold text-xs text-[#17150F] dark:text-[#FAF9F6] truncate">
                  {step.title}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 truncate hidden sm:block">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* 2. Multi-Step Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Invisible Honeypot */}
        <input type="text" {...register("honeypot")} className="hidden" tabIndex={-1} />

        {/* STEP 1: ESSENTIALS */}
        {currentStep === 1 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-6 shadow-xs animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-xl text-[#17150F] dark:text-[#FAF9F6]">
                Step 1: Essential Information
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Key details to identify your project across directory listings and rankings.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Project Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  placeholder="e.g. CloudPanel X"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Tagline or Short Pitch *
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {(formValues.tagline || "").length} / 90
                  </span>
                </div>
                <input
                  {...register("tagline")}
                  type="text"
                  maxLength={90}
                  placeholder="e.g. Modern server management panel for cloud infrastructure"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
                />
                {errors.tagline && (
                  <p className="mt-1 text-xs text-red-500">{errors.tagline.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Website or App URL *
                  </label>
                  {faviconUrl && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Favicon detected
                    </span>
                  )}
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3 flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 border border-[#E7E4DB] dark:border-[#2E2B23] overflow-hidden shrink-0 pointer-events-none transition-all">
                    {faviconUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={faviconUrl}
                        alt="Favicon"
                        className="w-4 h-4 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                  </div>
                  <input
                    {...register("websiteUrl")}
                    type="url"
                    placeholder="https://yourproject.com"
                    className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
                  />
                </div>

                {faviconUrl && !formValues.logoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue("logoUrl", faviconUrl);
                      toast.success("Favicon set as project logo");
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Do you want to use this favicon as your project logo?
                  </button>
                )}

                {errors.websiteUrl && (
                  <p className="mt-1 text-xs text-red-500">{errors.websiteUrl.message}</p>
                )}
              </div>

              <div ref={categoryDropdownRef}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Primary Category *
                </label>

                {/* Hidden input to keep react-hook-form registered */}
                <input type="hidden" {...register("categoryId")} />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E] text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#E4572E]/10 text-[#E4572E] flex items-center justify-center shrink-0">
                        <CategoryIcon name={categorySelected.icon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-xs sm:text-sm block truncate text-[#17150F] dark:text-[#FAF9F6]">
                          {categorySelected.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 truncate block">
                          {categorySelected.description}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform shrink-0 ml-2 ${
                        isCategoryDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-2xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] shadow-xl z-50 max-h-72 overflow-y-auto space-y-1">
                      {CATEGORIES_SEED.map((cat) => {
                        const isSelected = formValues.categoryId === cat.slug;
                        return (
                          <button
                            key={cat.slug}
                            type="button"
                            onClick={() => {
                              setValue("categoryId", cat.slug, { shouldValidate: true });
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#E4572E]/10 text-[#E4572E]"
                                : "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#17150F] dark:text-[#FAF9F6]"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? "bg-[#E4572E] text-white"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                                }`}
                              >
                                <CategoryIcon name={cat.icon} className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-bold text-xs sm:text-sm block truncate">
                                  {cat.name}
                                </span>
                                <span className="text-[11px] text-neutral-500 truncate block">
                                  {cat.description}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[#E4572E] shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {errors.categoryId && (
                  <p className="mt-1 text-xs text-red-500">{errors.categoryId.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DETAILS AND MEDIA */}
        {currentStep === 2 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-6 shadow-xs animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-xl text-[#17150F] dark:text-[#FAF9F6]">
                Step 2: Details, Images & Description
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Add visual assets and tell makers what makes your product unique.
              </p>
            </div>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                  Project Logo or Icon (PNG, JPG, SVG or WebP, max 2MB)
                </label>
                <div className="flex items-center gap-4">
                  {formValues.logoUrl ? (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#E7E4DB] dark:border-[#2E2B23] bg-neutral-50 dark:bg-neutral-900 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formValues.logoUrl}
                        alt="Logo Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setValue("logoUrl", "")}
                        className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px]"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#E7E4DB] dark:border-[#2E2B23] flex flex-col items-center justify-center text-neutral-400 hover:border-[#E4572E] hover:text-[#E4572E] transition-colors cursor-pointer shrink-0">
                      {isUploadingLogo ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "logo");
                        }}
                      />
                    </label>
                  )}
                  <div className="space-y-1.5">
                    <p className="text-xs text-neutral-500">
                      Upload a square, high-resolution image so your project looks sharp on discovery cards.
                    </p>
                    {faviconUrl && !formValues.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setValue("logoUrl", faviconUrl);
                          toast.success("Favicon set as logo");
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-[#E7E4DB] dark:border-[#2E2B23] transition-colors"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={faviconUrl} alt="Favicon" className="w-4 h-4 object-contain" />
                        Use automatically detected favicon
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Screenshots Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-2">
                  Screenshots (Up to 6 images, max 5MB each)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(formValues.screenshots || []).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-xl overflow-hidden border border-[#E7E4DB] dark:border-[#2E2B23] bg-neutral-100 dark:bg-neutral-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() =>
                          setValue(
                            "screenshots",
                            (formValues.screenshots || []).filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {(formValues.screenshots || []).length < 6 && (
                    <label className="aspect-video rounded-xl border-2 border-dashed border-[#E7E4DB] dark:border-[#2E2B23] flex flex-col items-center justify-center text-neutral-400 hover:border-[#E4572E] hover:text-[#E4572E] transition-colors cursor-pointer">
                      {isUploadingScreenshot ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 mb-1" />
                          <span className="text-[11px] font-semibold">Upload Screenshot</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "screenshot");
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Full Description * (minimum 120 characters)
                  </label>
                  <span className="text-[11px] font-mono text-neutral-400">
                    {(formValues.description || "").length} / 8000
                  </span>
                </div>
                <textarea
                  {...register("description")}
                  rows={6}
                  placeholder="Describe in detail what problem your project solves, key features, competitive advantages, and how to get started..."
                  className="w-full p-4 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E] resize-y"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Tags Chips Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Tags (Max 8)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="e.g. automation"
                    className="flex-1 px-4 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(formValues.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Technologies Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Technologies & Tech Stack (Max 10)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTech();
                      }
                    }}
                    placeholder="e.g. PostgreSQL"
                    className="flex-1 px-4 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddTech()}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(formValues.technologies || []).map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-white dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-neutral-700 dark:text-neutral-300"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(tech)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Popular suggestions */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[11px] text-neutral-400">Suggestions:</span>
                  {TECHNOLOGIES_SEED.slice(0, 8).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTech(t)}
                      className="text-[11px] text-neutral-500 hover:text-[#E4572E] underline decoration-dotted"
                    >
                      +{t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: PRICING AND METADATA */}
        {currentStep === 3 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-6 shadow-xs animate-in fade-in duration-200">
            <div className="space-y-1">
              <h2 className="font-display font-extrabold text-xl text-[#17150F] dark:text-[#FAF9F6]">
                Step 3: Pricing Model & Classification
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Help visitors understand your project model and access tiers.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Pricing Model *
                  </label>
                  <select
                    {...register("pricingType")}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
                  >
                    <option value={PricingType.FREE}>Free</option>
                    <option value={PricingType.FREEMIUM}>Freemium (Free tier + Pro plans)</option>
                    <option value={PricingType.PAID}>Paid (Paid / Subscription only)</option>
                    <option value={PricingType.OPEN_SOURCE}>Open Source</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Project Type *
                  </label>
                  <select
                    {...register("projectType")}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
                  >
                    <option value={ProjectType.SAAS}>SaaS</option>
                    <option value={ProjectType.AI}>Artificial Intelligence</option>
                    <option value={ProjectType.WEBSITE}>Website</option>
                    <option value={ProjectType.WEB_APP}>Web Application</option>
                    <option value={ProjectType.MOBILE_APP}>Mobile App</option>
                    <option value={ProjectType.TOOL}>Developer Tool / Utility</option>
                    <option value={ProjectType.ECOMMERCE}>E-commerce</option>
                    <option value={ProjectType.OPEN_SOURCE}>Open Source</option>
                    <option value={ProjectType.STARTUP}>Startup</option>
                    <option value={ProjectType.OTHER}>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Country of Origin (2-letter ISO code, e.g. US, GB, ES)
                  </label>
                  <input
                    {...register("country")}
                    type="text"
                    maxLength={2}
                    placeholder="US"
                    className="w-full px-4 py-3 rounded-xl text-sm uppercase bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Launch Date
                  </label>
                  <input
                    {...register("launchDate")}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl text-sm bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] text-[#17150F] dark:text-[#FAF9F6] focus:outline-none focus:border-[#E4572E]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LIVE REVIEW AND SUBMISSION */}
        {currentStep === 4 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1813] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-8 shadow-xs animate-in fade-in duration-200">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E4572E]/10 text-[#E4572E]">
                <Sparkles className="w-3.5 h-3.5" />
                Live Preview
              </span>
              <h2 className="font-display font-extrabold text-2xl text-[#17150F] dark:text-[#FAF9F6]">
                Here is how your project will look on LaunchHub
              </h2>
              <p className="text-xs sm:text-sm text-neutral-500">
                Review how your card will appear across homepages and directories before submitting.
              </p>
            </div>

            {/* Live Project Card Preview */}
            <div className="max-w-md mx-auto">
              <ProjectCard project={previewProject} />
            </div>

            {/* Data Summary */}
            <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#12110D] border border-[#E7E4DB] dark:border-[#2E2B23] space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#E7E4DB]/60 dark:border-[#2E2B23]/60">
                <span className="text-neutral-500">Official website:</span>
                <span className="font-mono text-neutral-700 dark:text-neutral-300 font-semibold truncate max-w-xs">
                  {formValues.websiteUrl}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E7E4DB]/60 dark:border-[#2E2B23]/60">
                <span className="text-neutral-500">Category:</span>
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">{categorySelected.name}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-neutral-500">Initial status after submit:</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">Pending Approval</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>100% Free Submission (No Charges)</span>
              </div>
              <p className="text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                No payment or credit card required. Your project enters the moderation queue with <strong>Pending Approval</strong> status and will be verified by our team before going live publicly on LaunchHub.
              </p>
            </div>
          </div>
        )}

        {/* 3. Wizard Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 pt-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Step
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-md shadow-[#E4572E]/20 cursor-pointer"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold bg-[#E4572E] text-white hover:bg-[#CE4A24] transition-all shadow-lg shadow-[#E4572E]/30 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  {isEditing ? "Save Changes" : "Confirm & Submit for Free"}
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
