"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pension } from "@/lib/data";

/** 먼지·꽃가루 (SSR 불일치를 막기 위해 값을 고정해 둔다) */
const motes = [
  { left: "8%", delay: "0s", duration: "17s", size: 3 },
  { left: "16%", delay: "4s", duration: "21s", size: 2 },
  { left: "24%", delay: "9s", duration: "19s", size: 4 },
  { left: "33%", delay: "2s", duration: "24s", size: 2 },
  { left: "41%", delay: "12s", duration: "18s", size: 3 },
  { left: "49%", delay: "6s", duration: "22s", size: 2 },
  { left: "57%", delay: "15s", duration: "20s", size: 3 },
  { left: "64%", delay: "3s", duration: "25s", size: 2 },
  { left: "72%", delay: "10s", duration: "18s", size: 4 },
  { left: "79%", delay: "7s", duration: "23s", size: 2 },
  { left: "86%", delay: "14s", duration: "19s", size: 3 },
  { left: "93%", delay: "5s", duration: "21s", size: 2 },
];

export default function GatePage() {
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  function enter(href: string) {
    setLeaving(true);
    setTimeout(() => router.push(href), 600);
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-forest-900">
      {/* 숲에서 맞이하는 아침 */}
      <Image
        src="/images/hero.jpg"
        alt="아침 햇살이 스며드는 숲길"
        fill
        priority
        sizes="100vw"
        className="gate-zoom object-cover"
      />

      {/* 아침 색감 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100/20 via-forest-900/35 to-forest-900/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,236,190,0.45),transparent_58%)]" />

      {/* 해 */}
      <div className="sun-glow absolute right-[18%] top-[12%] h-40 w-40 rounded-full bg-amber-100/70 blur-3xl md:h-56 md:w-56" />

      {/* 나무 사이로 들어오는 빛줄기 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { left: "58%", w: "70px", delay: "0s" },
          { left: "66%", w: "40px", delay: "2.5s" },
          { left: "74%", w: "90px", delay: "5s" },
          { left: "83%", w: "50px", delay: "1.2s" },
        ].map((ray) => (
          <div
            key={ray.left}
            className="ray-sway absolute -top-1/4 h-[150%] origin-top bg-gradient-to-b from-amber-50/70 via-amber-50/20 to-transparent blur-md"
            style={{ left: ray.left, width: ray.w, animationDelay: ray.delay, rotate: "12deg" }}
          />
        ))}
      </div>

      {/* 골짜기 안개 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[18%] h-40">
        <div className="mist-flow absolute inset-x-0 top-0 h-24 rounded-full bg-white/45 blur-2xl" />
        <div
          className="mist-flow absolute inset-x-0 top-14 h-20 rounded-full bg-white/35 blur-2xl"
          style={{ animationDelay: "8s" }}
        />
      </div>

      {/* 떠다니는 먼지 */}
      <div className="pointer-events-none absolute inset-0">
        {motes.map((m) => (
          <span
            key={m.left}
            className="mote absolute bottom-0 rounded-full bg-amber-50/80"
            style={{
              left: m.left,
              width: m.size,
              height: m.size,
              animationDelay: m.delay,
              animationDuration: m.duration,
            }}
          />
        ))}
      </div>

      {/* 본문 */}
      <div className="relative flex h-full flex-col">
        <header className="container-x flex items-center justify-between pt-7">
          <span
            className="rise-in flex items-center gap-2.5 text-white"
            style={{ animationDelay: "0.2s" }}
          >
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
              <path d="M16 5 8 19h16L16 5Z" fill="#e5ede0" />
              <path d="M16 11 10.5 21h11L16 11Z" fill="#a2bf92" />
              <rect x="15" y="19" width="2" height="8" rx="1" fill="#efe6da" />
            </svg>
            <span className="font-display text-base font-bold tracking-tight">{pension.name}</span>
          </span>
          <a
            href={`tel:${pension.phone}`}
            className="rise-in text-sm font-semibold text-white/85 hover:text-white"
            style={{ animationDelay: "0.35s" }}
          >
            {pension.phone}
          </a>
        </header>

        <main className="container-x flex flex-1 flex-col items-center justify-center pb-16 text-center">
          <p
            className="rise-in text-[11px] font-semibold tracking-[0.4em] text-amber-50/90 md:text-xs"
            style={{ animationDelay: "0.5s" }}
          >
            GYEONGGI GAPYEONG
          </p>

          <h1
            className="rise-in mt-6 font-display text-5xl font-bold leading-[1.15] text-white drop-shadow-lg sm:text-6xl md:text-7xl"
            style={{ animationDelay: "0.75s" }}
          >
            마음속 쉼터
          </h1>

          <div
            className="line-grow mt-8 h-px w-40 bg-white/50 md:w-56"
            style={{ animationDelay: "1.1s" }}
          />

          <p
            className="rise-in mt-8 font-display text-xl leading-relaxed text-white/95 md:text-2xl"
            style={{ animationDelay: "1.3s" }}
          >
            숲에서 맞이하는 아침
          </p>
          <p
            className="rise-in mt-4 max-w-md text-sm leading-relaxed text-white/75 md:text-base"
            style={{ animationDelay: "1.5s" }}
          >
            잣나무 숲 안에 세 동, 한 동에 두 방씩.
            <br />
            모두 여섯 개뿐인 10평 원룸형 객실입니다.
          </p>

          <div
            className="rise-in mt-11 flex flex-col items-center gap-3 sm:flex-row"
            style={{ animationDelay: "1.75s" }}
          >
            <button
              type="button"
              onClick={() => enter("/home")}
              className="group w-64 rounded-full bg-white/95 px-8 py-4 text-base font-semibold text-forest-800 shadow-xl shadow-forest-900/30 transition hover:bg-white sm:w-auto"
            >
              들어가기
              <span className="ml-2 inline-block transition group-hover:translate-x-1" aria-hidden>
                →
              </span>
            </button>
            <button
              type="button"
              onClick={() => enter("/reservation")}
              className="w-64 rounded-full border border-white/50 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/15 sm:w-auto"
            >
              바로 예약하기
            </button>
          </div>

          <div
            className="rise-in mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/70"
            style={{ animationDelay: "2s" }}
          >
            <span>3개 동 · 6개 객실</span>
            <span className="hidden h-3 w-px bg-white/30 sm:block" />
            <span>10평 원룸형 · 기준 2인</span>
            <span className="hidden h-3 w-px bg-white/30 sm:block" />
            <span>서울에서 1시간 10분</span>
          </div>
        </main>

        <footer className="container-x pb-8">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span className="rise-in" style={{ animationDelay: "2.2s" }}>
              {pension.address}
            </span>
            <Link
              href="/credits"
              className="rise-in hover:text-white/90"
              style={{ animationDelay: "2.2s" }}
            >
              사진 출처
            </Link>
          </div>
          <button
            type="button"
            onClick={() => enter("/home")}
            aria-label="펜션 홈으로 들어가기"
            className="nudge-down mx-auto mt-4 block text-white/70 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </footer>
      </div>

      {/* 입장 전환 효과 */}
      {leaving && (
        <div className="gate-leave pointer-events-none absolute inset-0 z-20 bg-cream" />
      )}
    </div>
  );
}
