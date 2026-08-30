"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionUser } from "./types";

/**
 * 로그인 상태를 클라이언트에서 조회한다.
 * 루트 레이아웃에서 쿠키를 읽으면 모든 페이지가 동적 렌더링이 되므로,
 * 헤더/예약 폼 같은 일부 영역만 이 훅으로 처리해 정적 페이지를 유지한다.
 */
export function useCurrentUser() {
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        setUser(json.user ?? null);
        setLoaded(true);
      })
      .catch(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  return { user, loaded };
}
