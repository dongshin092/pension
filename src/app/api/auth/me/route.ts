import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** 현재 로그인 상태. 헤더·예약 폼에서 사용한다 */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json(
    { user },
    { headers: { "Cache-Control": "no-store, must-revalidate" } },
  );
}
