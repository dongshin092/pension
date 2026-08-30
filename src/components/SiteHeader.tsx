"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { pension } from "@/lib/data";
import { useCurrentUser } from "@/lib/useCurrentUser";

const nav = [
  { href: "/about", label: "펜션 소개" },
  { href: "/rooms", label: "룸 정보" },
  { href: "/reservation", label: "실시간 예약하기" },
  { href: "/facilities", label: "부대시설" },
  { href: "/board", label: "게시판" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { user, loaded } = useCurrentUser();
  const isGate = pathname === "/";
  const isHome = pathname === "/home";

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !solid && !open;

  // 대문 페이지에는 헤더를 띄우지 않는다
  if (isGate) return null;

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "bg-transparent"
          : "bg-cream/90 backdrop-blur-md border-b border-forest-100 shadow-[0_1px_20px_rgba(23,40,23,0.06)]"
      }`}
    >
      <div className="container-x flex h-16 items-center justify-between gap-4 md:h-20">
        <Link href="/home" className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" aria-hidden>
            <circle cx="16" cy="16" r="15" fill={transparent ? "#ffffff22" : "#e5ede0"} />
            <path d="M16 5 8 19h16L16 5Z" fill="#446a39" />
            <path d="M16 11 10.5 21h11L16 11Z" fill="#7ba36a" />
            <rect x="15" y="19" width="2" height="8" rx="1" fill="#5f4a33" />
          </svg>
          <span
            className={`font-display text-lg font-bold tracking-tight md:text-xl ${
              transparent ? "text-white" : "text-forest-800"
            }`}
          >
            {pension.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            if (item.href === "/reservation") {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="ml-2 rounded-full bg-forest-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  transparent
                    ? "text-white/90 hover:bg-white/15 hover:text-white"
                    : active
                      ? "bg-forest-100 text-forest-800"
                      : "text-forest-700 hover:bg-forest-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {/* 로그인 영역 */}
          <div className="hidden items-center gap-2 lg:flex">
            {loaded && user ? (
              <>
                <Link
                  href="/mypage"
                  className={`text-sm font-semibold ${
                    transparent ? "text-white hover:underline" : "text-forest-700 hover:text-forest-900"
                  }`}
                >
                  {user.name}님
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className={`text-sm ${
                      transparent ? "text-white/80 hover:text-white" : "text-forest-400 hover:text-forest-600"
                    }`}
                  >
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-semibold ${
                    transparent ? "text-white hover:underline" : "text-forest-700 hover:text-forest-900"
                  }`}
                >
                  로그인
                </Link>
                <span className={transparent ? "text-white/40" : "text-forest-200"}>|</span>
                <Link
                  href="/signup"
                  className={`text-sm ${
                    transparent ? "text-white/85 hover:text-white" : "text-forest-500 hover:text-forest-700"
                  }`}
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          <a
            href={`tel:${pension.phone}`}
            className={`hidden text-sm font-semibold md:block lg:hidden ${
              transparent ? "text-white" : "text-forest-700"
            }`}
          >
            {pension.phone}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="메뉴 열기"
            aria-expanded={open}
            className={`rounded-lg p-2 lg:hidden ${transparent ? "text-white" : "text-forest-800"}`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-forest-100 bg-cream lg:hidden">
          <nav className="container-x flex flex-col py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-forest-50 py-3.5 text-base font-medium text-forest-800"
              >
                {item.label}
                <span className="text-forest-300">→</span>
              </Link>
            ))}

            {loaded && user ? (
              <>
                <Link
                  href="/mypage"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-forest-50 py-3.5 text-base font-medium text-forest-800"
                >
                  마이페이지 ({user.name}님)
                  <span className="text-forest-300">→</span>
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="py-3.5 text-sm text-forest-500">
                    로그아웃
                  </button>
                </form>
              </>
            ) : (
              <div className="flex gap-3 pt-4">
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full bg-forest-600 py-3 text-center text-sm font-semibold text-white"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-forest-200 py-3 text-center text-sm font-semibold text-forest-700"
                >
                  회원가입
                </Link>
              </div>
            )}

            <a href={`tel:${pension.phone}`} className="pt-4 text-sm text-forest-600">
              전화 예약 {pension.phone}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
