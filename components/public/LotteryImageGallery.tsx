"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

type MediaItem = { type: "video"; src: string } | { type: "image"; src: string };

export default function LotteryImageGallery({
  images,
  video,
  alt,
}: {
  images: string[];
  video?: string;
  alt: string;
}) {
  const media: MediaItem[] = [
    ...(video ? [{ type: "video" as const, src: video }] : []),
    ...images.map((src) => ({ type: "image" as const, src })),
  ];
  const [active, setActive] = useState(0);

  if (!media.length) {
    return (
      <div className="relative w-full h-64 sm:h-80 bg-gradient-to-br from-slate-800 to-[#0c1222] flex items-center justify-center text-7xl select-none">
        🚗
      </div>
    );
  }

  const current = media[active];

  return (
    <div className="w-full">
      <div className="relative w-full h-64 sm:h-80 bg-black">
        {current.type === "video" ? (
          <video
            key={current.src}
            src={current.src}
            controls
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <Image
            src={current.src}
            alt={alt}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        )}
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 px-4 pt-2 overflow-x-auto max-w-lg mx-auto">
          {media.map((item, i) => (
            <button
              key={item.src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 shrink-0 rounded-lg overflow-hidden border-2 transition-colors bg-black ${
                i === active ? "border-amber-500" : "border-transparent"
              }`}
            >
              {item.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-white" />
                </div>
              ) : (
                <Image src={item.src} alt="" fill sizes="56px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
