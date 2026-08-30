"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pension } from "@/lib/data";

export default function SiteFooter() {
  const pathname = usePathname();
  // 대문 페이지에는 푸터를 띄우지 않는다
  if (pathname === "/") return null;

  return (
    <footer className="mt-24 bg-forest-900 text-forest-100">
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-white">{pension.name}</p>
          <p className="mt-3 text-sm leading-relaxed text-forest-200">
            {pension.tagline}
            <br />
            {pension.address}
          </p>
        </div>
        <div className="text-sm leading-relaxed">
          <p className="mb-3 font-semibold text-white">예약 문의</p>
          <p>전화 {pension.phone}</p>
          <p>이메일 {pension.email}</p>
          <p className="mt-2 text-forest-200">입금 계좌 {pension.account}</p>
          <p className="text-forest-200">
            체크인 {pension.checkIn} / 체크아웃 {pension.checkOut}
          </p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold text-white">바로가기</p>
          <div className="grid grid-cols-2 gap-y-2">
            <Link href="/about" className="hover:text-white">펜션 소개</Link>
            <Link href="/rooms" className="hover:text-white">룸 정보</Link>
            <Link href="/reservation" className="hover:text-white">실시간 예약</Link>
            <Link href="/facilities" className="hover:text-white">부대시설</Link>
            <Link href="/board" className="hover:text-white">게시판</Link>
            <Link href="/credits" className="hover:text-white">사진 출처</Link>
            <Link href="/" className="hover:text-white">대문 페이지</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-forest-200">
        © {new Date().getFullYear()} {pension.name}. 이 사이트는 MVP 데모입니다.
      </div>
    </footer>
  );
}
