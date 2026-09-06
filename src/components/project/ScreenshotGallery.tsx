"use client";

import { useState } from "react";
import Image from "next/image";

interface ScreenshotGalleryProps {
  screenshots: string[];
  projectName: string;
}

export function ScreenshotGallery({ screenshots, projectName }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!screenshots || screenshots.length === 0) return null;

  const currentImage = screenshots[selectedIndex] || screenshots[0];

  return (
    <div className="space-y-4">
      {/* Imagen Principal */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-[#E7E4DB] dark:border-[#2E2B23] shadow-md">
        <Image
          src={currentImage}
          alt={`Captura de pantalla de ${projectName} ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="object-cover"
        />
      </div>

      {/* Miniaturas si hay más de 1 */}
      {screenshots.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {screenshots.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-video w-24 sm:w-32 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                selectedIndex === idx
                  ? "border-[#E4572E] shadow-sm scale-105"
                  : "border-[#E7E4DB] dark:border-[#2E2B23] opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img}
                alt={`Miniatura ${idx + 1}`}
                fill
                sizes="128px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
