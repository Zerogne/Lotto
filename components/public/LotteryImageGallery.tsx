"use client";

import { useState } from "react";
import Image from "next/image";

export default function LotteryImageGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);

  if (!images.length) {
    return (
      <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-slate-800 to-[#0c1222] flex items-center justify-center text-7xl select-none">
        🚗
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-slate-800 to-[#0c1222]">
        <Image
          src={images[active]}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover object-center"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 px-4 pt-2 overflow-x-auto max-w-lg mx-auto">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                i === active ? "border-amber-500" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
