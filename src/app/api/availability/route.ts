import { NextResponse } from "next/server";
import { rooms } from "@/lib/data";
import { isValidRange, quote } from "@/lib/pricing";
import { getBookedRoomSlugs } from "@/lib/repo";

export const dynamic = "force-dynamic";

/** GET /api/availability?checkIn=2026-08-24&checkOut=2026-08-25&guests=2 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const checkIn = url.searchParams.get("checkIn") ?? "";
  const checkOut = url.searchParams.get("checkOut") ?? "";
  const guests = Number(url.searchParams.get("guests") ?? 2);

  if (!isValidRange(checkIn, checkOut)) {
    return NextResponse.json(
      { error: "체크인/체크아웃 날짜를 확인해 주세요. (체크아웃이 체크인보다 뒤여야 합니다)" },
      { status: 400 },
    );
  }

  const booked = new Set(await getBookedRoomSlugs(checkIn, checkOut));

  const result = rooms.map((room) => {
    const q = quote(room, checkIn, checkOut, guests);
    return {
      slug: room.slug,
      name: room.name,
      buildingLabel: room.buildingLabel,
      floor: room.floor,
      concept: room.concept,
      size: room.size,
      standard: room.standard,
      max: room.max,
      hue: room.hue,
      photo: room.photos[0].src,
      photoAlt: room.photos[0].alt,
      available: !booked.has(room.slug) && guests <= room.max,
      reason: booked.has(room.slug) ? "예약 마감" : guests > room.max ? "인원 초과" : null,
      nights: q.nights,
      roomAmount: q.roomAmount,
      extraAmount: q.extraAmount,
      total: q.total,
      breakdown: q.breakdown,
    };
  });

  return NextResponse.json({
    checkIn,
    checkOut,
    guests,
    nights: result[0]?.nights ?? 0,
    rooms: result,
    availableCount: result.filter((r) => r.available).length,
  });
}
