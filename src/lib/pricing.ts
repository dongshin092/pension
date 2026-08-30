import { priceForDate, type Room } from "./data";

export const EXTRA_PERSON_FEE = 20000;

export function eachNight(checkIn: string, checkOut: string): Date[] {
  const out: Date[] = [];
  const cur = new Date(`${checkIn}T12:00:00`);
  const end = new Date(`${checkOut}T12:00:00`);
  while (cur < end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export type Quote = {
  nights: number;
  roomAmount: number;
  extraAmount: number;
  total: number;
  breakdown: { date: string; price: number }[];
};

/** 기간 요금 계산. 기준 인원 초과 시 1인당 추가 요금이 1박마다 붙는다. */
export function quote(room: Room, checkIn: string, checkOut: string, guests = 2): Quote {
  const nightsList = eachNight(checkIn, checkOut);
  const breakdown = nightsList.map((d) => ({
    date: d.toISOString().slice(0, 10),
    price: priceForDate(room, d),
  }));
  const roomAmount = breakdown.reduce((sum, n) => sum + n.price, 0);
  const extraGuests = Math.max(0, Math.min(guests, room.max) - room.standard);
  const extraAmount = extraGuests * EXTRA_PERSON_FEE * nightsList.length;
  return {
    nights: nightsList.length,
    roomAmount,
    extraAmount,
    total: roomAmount + extraAmount,
    breakdown,
  };
}

export function isValidRange(checkIn: string, checkOut: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return false;
  return checkOut > checkIn;
}

export function todayStr() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
