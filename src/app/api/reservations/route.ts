import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRoom } from "@/lib/data";
import { isValidRange, quote } from "@/lib/pricing";
import { createReservation, getBookedRoomSlugs, getReservations } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await getReservations();
  // 개인정보는 목록에서 마스킹해 내보낸다.
  return NextResponse.json(
    list.map((r) => ({
      id: r.id,
      roomSlug: r.roomSlug,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      nights: r.nights,
      status: r.status,
    })),
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const roomSlug = String(body.roomSlug ?? "");
  const checkIn = String(body.checkIn ?? "");
  const checkOut = String(body.checkOut ?? "");
  const guests = Number(body.guests ?? 2);
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const memo = body.memo ? String(body.memo).trim() : undefined;

  const room = getRoom(roomSlug);
  if (!room) {
    return NextResponse.json({ error: "존재하지 않는 객실입니다." }, { status: 400 });
  }
  if (!isValidRange(checkIn, checkOut)) {
    return NextResponse.json({ error: "날짜를 다시 확인해 주세요." }, { status: 400 });
  }
  if (name.length < 2) {
    return NextResponse.json({ error: "예약자 성함을 입력해 주세요." }, { status: 400 });
  }
  if (!/^[0-9-]{9,14}$/.test(phone)) {
    return NextResponse.json({ error: "연락처를 숫자와 하이픈으로 입력해 주세요." }, { status: 400 });
  }
  if (guests < 1 || guests > room.max) {
    return NextResponse.json(
      { error: `${room.name}은 최대 ${room.max}인까지 이용할 수 있습니다.` },
      { status: 400 },
    );
  }

  const booked = await getBookedRoomSlugs(checkIn, checkOut);
  if (booked.includes(roomSlug)) {
    return NextResponse.json(
      { error: "방금 다른 예약이 들어왔습니다. 다른 날짜나 객실을 선택해 주세요." },
      { status: 409 },
    );
  }

  const q = quote(room, checkIn, checkOut, guests);
  const user = await getCurrentUser(); // 로그인 상태면 회원 예약으로 연결

  try {
    const reservation = await createReservation({
      roomSlug,
      checkIn,
      checkOut,
      guests,
      name,
      phone,
      memo,
      total: q.total,
      nights: q.nights,
      userId: user?.id ?? null,
    });
    return NextResponse.json({ reservation, quote: q }, { status: 201 });
  } catch (e) {
    // PostgreSQL 배타 제약(reservations_no_overlap) 위반 = 동시 예약 충돌
    if (typeof e === "object" && e !== null && (e as { code?: string }).code === "23P01") {
      return NextResponse.json(
        { error: "같은 날짜에 이미 예약이 있습니다. 새로고침 후 다시 확인해 주세요." },
        { status: 409 },
      );
    }
    console.error("[reservations] 저장 실패", e);
    return NextResponse.json({ error: "예약 저장 중 오류가 발생했습니다." }, { status: 500 });
  }
}
