"use client";

import Image from "next/image";
import { useState } from "react";

export type GalleryItem = { src: string; alt: string; caption: string };

/** 객실 상세 사진 갤러리 (큰 사진 + 썸네일) */
export default function RoomGallery({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const current = items[index] ?? items[0];

  return (
    <div>
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-forest-100">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 760px"
          className="object-cover"
          priority={index === 0}
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-900/80 to-transparent px-5 pb-4 pt-10">
          <p className="text-sm font-medium text-white">{current.caption}</p>
        </div>
        <span className="absolute right-3 top-3 rounded-full bg-forest-900/70 px-3 py-1 text-xs font-semibold text-white">
          {index + 1} / {items.length}
        </span>

        {items.length > 1 && (
          <>
            <button
              type="button"
              aria-label="이전 사진"
              onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-forest-800 transition hover:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="다음 사진"
              onClick={() => setIndex((i) => (i + 1) % items.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2 text-forest-800 transition hover:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
        {items.map((item, i) => (
          <button
            key={item.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`${item.caption} 사진 보기`}
            className={`relative aspect-[4/3] overflow-hidden rounded-xl transition ${
              i === index
                ? "ring-2 ring-forest-600 ring-offset-2 ring-offset-cream"
                : "opacity-75 hover:opacity-100"
            }`}
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="180px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
