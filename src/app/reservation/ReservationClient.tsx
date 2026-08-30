"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { pension, won } from "@/lib/data";
import { useCurrentUser } from "@/lib/useCurrentUser";

type AvailableRoom = {
  slug: string;
  name: string;
  buildingLabel: string;
  floor: string;
  concept: string;
  size: string;
  standard: number;
  max: number;
  hue: [string, string];
  photo: string;
  photoAlt: string;
  available: boolean;
  reason: string | null;
  nights: number;
  roomAmount: number;
  extraAmount: number;
  total: number;
  breakdown: { date: string; price: number }[];
};

type Availability = {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  rooms: AvailableRoom[];
  availableCount: number;
};

type Done = {
  id: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  total: number;
};

function shift(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function weekday(dateStr: string) {
  const labels = ["일", "월", "화", "수", "목", "금", "토"];
  return labels[new Date(`${dateStr}T12:00:00`).getDay()];
}

export default function ReservationClient({ initialRoom }: { initialRoom?: string }) {
  const today = shift(0);
  const [checkIn, setCheckIn] = useState(shift(1));
  const [checkOut, setCheckOut] = useState(shift(2));
  const [guests, setGuests] = useState(2);
  const [selected, setSelected] = useState<string | undefined>(initialRoom);

  const [data, setData] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // null = 사용자가 아직 손대지 않음 -> 로그인 회원 정보로 자동 입력
  const [nameInput, setNameInput] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const { user, loaded: userLoaded } = useCurrentUser();
  const name = nameInput ?? user?.name ?? "";
  const phone = phoneInput ?? user?.phone ?? "";
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  const load = useCallback(async () => {
    if (checkOut <= checkIn) {
      setError("체크아웃 날짜가 체크인보다 뒤여야 합니다.");
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`,
        { cache: "no-store" },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "조회에 실패했습니다.");
      setData(json as Availability);
    } catch (e) {
      setError(e instanceof Error ? e.message : "조회 중 오류가 발생했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [checkIn, checkOut, guests]);

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
  }, [load]);

  const picked = useMemo(
    () => data?.rooms.find((r) => r.slug === selected && r.available),
    [data, selected],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!picked) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomSlug: picked.slug,
          checkIn,
          checkOut,
          guests,
          name,
          phone,
          memo,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "예약에 실패했습니다.");
      setDone({
        id: json.reservation.id,
        roomName: picked.name,
        checkIn,
        checkOut,
        nights: json.reservation.nights,
        guests,
        total: json.reservation.total,
      });
      setNameInput("");
      setPhoneInput("");
      setMemo("");
      setAgree(false);
      setSelected(undefined);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "예약 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-forest-100 bg-white p-8 text-center shadow-sm md:p-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest-100">
          <svg viewBox="0 0 24 24" className="h-8 w-8 text-forest-600" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold text-forest-800">예약 신청이 접수됐습니다</h2>
        <p className="mt-2 text-sm text-forest-500">
          예약금 입금이 확인되면 확정으로 바뀝니다. 확인 문자를 보내드립니다.
        </p>

        <dl className="mt-8 divide-y divide-forest-50 rounded-2xl bg-mist px-6 text-left text-sm">
          {[
            ["예약번호", done.id],
            ["객실", done.roomName],
            ["일정", `${done.checkIn} → ${done.checkOut} (${done.nights}박)`],
            ["인원", `${done.guests}명`],
            ["총 결제 예정 금액", won(done.total)],
            ["예약금 (30%)", won(Math.round(done.total * 0.3))],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3.5">
              <dt className="text-forest-500">{k}</dt>
              <dd className="font-semibold text-forest-800">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 rounded-xl bg-forest-50 px-5 py-4 text-left text-sm leading-relaxed text-forest-700">
          입금 계좌 <b>{pension.account}</b>
          <br />
          예약 후 24시간 안에 예약금이 확인되지 않으면 자동 취소됩니다.
          <br />
          문의 {pension.phone}
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => setDone(null)}
            className="rounded-full bg-forest-600 px-7 py-3.5 text-sm font-semibold text-white hover:bg-forest-700"
          >
            다른 날짜 더 예약하기
          </button>
          <Link
            href="/board"
            className="rounded-full border border-forest-200 px-7 py-3.5 text-sm font-semibold text-forest-700 hover:bg-forest-50"
          >
            게시판에서 문의하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        {/* STEP 1 날짜 선택 */}
        <section className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm md:p-7">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-600 text-xs text-white">
              1
            </span>
            날짜와 인원 선택
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold text-forest-500">체크인</span>
              <input
                type="date"
                value={checkIn}
                min={today}
                onChange={(e) => {
                  const v = e.target.value;
                  setCheckIn(v);
                  if (v >= checkOut) {
                    const d = new Date(`${v}T12:00:00`);
                    d.setDate(d.getDate() + 1);
                    setCheckOut(d.toISOString().slice(0, 10));
                  }
                }}
                className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm text-forest-800 outline-none focus:border-forest-500"
              />
              <span className="mt-1 block text-xs text-forest-400">
                {weekday(checkIn)}요일 {pension.checkIn} 입실
              </span>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-forest-500">체크아웃</span>
              <input
                type="date"
                value={checkOut}
                min={shift(1)}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm text-forest-800 outline-none focus:border-forest-500"
              />
              <span className="mt-1 block text-xs text-forest-400">
                {weekday(checkOut)}요일 {pension.checkOut} 퇴실
              </span>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-forest-500">인원</span>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm text-forest-800 outline-none focus:border-forest-500"
              >
                {[1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}명 {n > 2 ? "(추가요금)" : ""}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-xs text-forest-400">기준 2인 / 최대 3인</span>
            </label>
          </div>
          {data && (
            <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-forest-600">
              {data.nights}박 · 예약 가능한 방{" "}
              <b className="text-forest-800">{data.availableCount}개</b> / 전체 6개
            </p>
          )}
        </section>

        {/* STEP 2 객실 선택 */}
        <section className="mt-6 rounded-2xl border border-forest-100 bg-white p-6 shadow-sm md:p-7">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-600 text-xs text-white">
              2
            </span>
            객실 선택
          </h2>

          {loading && <p className="mt-5 text-sm text-forest-400">실시간 예약 현황을 불러오는 중…</p>}
          {error && !loading && (
            <p className="mt-5 rounded-xl bg-bark-100 px-4 py-3 text-sm text-bark-700">{error}</p>
          )}

          <div className="mt-5 space-y-3">
            {data?.rooms.map((room) => {
              const active = selected === room.slug && room.available;
              return (
                <button
                  key={room.slug}
                  type="button"
                  disabled={!room.available}
                  onClick={() => setSelected(room.slug)}
                  className={`flex w-full items-stretch gap-4 overflow-hidden rounded-2xl border p-3 text-left transition ${
                    !room.available
                      ? "cursor-not-allowed border-forest-100 bg-forest-50/60 opacity-60"
                      : active
                        ? "border-forest-500 bg-forest-50 ring-2 ring-forest-500/30"
                        : "border-forest-100 bg-white hover:border-forest-300"
                  }`}
                >
                  <div className="relative hidden w-32 shrink-0 overflow-hidden rounded-xl sm:block">
                    <Image
                      src={room.photo}
                      alt={room.photoAlt}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-lg font-bold text-forest-800">
                        {room.name}
                      </span>
                      <span className="rounded-full bg-forest-100 px-2.5 py-0.5 text-xs text-forest-600">
                        {room.buildingLabel} {room.floor}
                      </span>
                      {!room.available && (
                        <span className="rounded-full bg-bark-300/40 px-2.5 py-0.5 text-xs font-semibold text-bark-700">
                          {room.reason}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-forest-500">{room.concept}</p>
                    <p className="mt-1 text-xs text-forest-400">
                      {room.size} · 기준 {room.standard}인 / 최대 {room.max}인
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-center pr-1 text-right">
                    <span className="text-xs text-forest-400">{room.nights}박 합계</span>
                    <span className="font-display text-lg font-bold text-forest-800">
                      {won(room.total)}
                    </span>
                    {room.extraAmount > 0 && (
                      <span className="text-xs text-forest-400">
                        추가인원 {won(room.extraAmount)} 포함
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STEP 3 예약자 정보 */}
        <section className="mt-6 rounded-2xl border border-forest-100 bg-white p-6 shadow-sm md:p-7">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold text-forest-800">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-600 text-xs text-white">
              3
            </span>
            예약자 정보
          </h2>
          {userLoaded && (
            <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-forest-600">
              {user ? (
                <>
                  <b className="font-semibold text-forest-800">{user.name}님</b>으로 로그인되어
                  있습니다. 예약 내역은 마이페이지에서 확인하실 수 있습니다.
                </>
              ) : (
                <>
                  비회원으로도 예약할 수 있습니다.{" "}
                  <Link href="/login?next=/reservation" className="font-semibold text-forest-700 underline">
                    로그인
                  </Link>
                  하면 정보가 자동으로 채워지고 예약 내역이 저장됩니다.
                </>
              )}
            </p>
          )}
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-forest-500">예약자 성함 *</span>
                <input
                  value={name}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="홍길동"
                  required
                  minLength={2}
                  className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm outline-none focus:border-forest-500"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-forest-500">연락처 *</span>
                <input
                  value={phone}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="010-1234-5678"
                  required
                  pattern="[0-9-]{9,14}"
                  className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm outline-none focus:border-forest-500"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-semibold text-forest-500">요청사항</span>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={3}
                placeholder="바비큐 신청, 늦은 체크인 등 필요한 내용을 적어주세요."
                className="mt-1.5 w-full resize-none rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm outline-none focus:border-forest-500"
              />
            </label>
            <label className="flex items-start gap-3 text-sm text-forest-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 accent-forest-600"
              />
              <span>
                예약 확인을 위한 개인정보(성함·연락처) 수집과 취소 규정에 동의합니다. 이용 7일 전 전액,
                3일 전 50% 환불되며 당일 취소는 환불되지 않습니다.
              </span>
            </label>

            {error && !loading && (
              <p className="rounded-xl bg-bark-100 px-4 py-3 text-sm text-bark-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={!picked || !agree || submitting}
              className="w-full rounded-full bg-forest-600 py-4 text-base font-semibold text-white transition enabled:hover:bg-forest-700 disabled:cursor-not-allowed disabled:bg-forest-200"
            >
              {submitting
                ? "접수 중…"
                : !picked
                  ? "객실을 먼저 선택해 주세요"
                  : !agree
                    ? "약관에 동의해 주세요"
                    : `${picked.name} ${won(picked.total)} 예약 신청`}
            </button>
          </form>
        </section>
      </div>

      {/* 요약 사이드 */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm">
          <p className="font-display text-base font-bold text-forest-800">예약 요약</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-forest-500">일정</dt>
              <dd className="text-right font-medium text-forest-800">
                {checkIn}
                <br />→ {checkOut}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-forest-500">숙박</dt>
              <dd className="font-medium text-forest-800">{data?.nights ?? 0}박</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-forest-500">인원</dt>
              <dd className="font-medium text-forest-800">{guests}명</dd>
            </div>
            <div className="flex justify-between border-t border-forest-50 pt-3">
              <dt className="text-forest-500">객실</dt>
              <dd className="font-medium text-forest-800">{picked ? picked.name : "미선택"}</dd>
            </div>
          </dl>

          {picked && (
            <>
              <div className="mt-4 space-y-1.5 border-t border-forest-50 pt-4 text-xs text-forest-500">
                {picked.breakdown.map((n) => (
                  <div key={n.date} className="flex justify-between">
                    <span>
                      {n.date} ({weekday(n.date)})
                    </span>
                    <span>{won(n.price)}</span>
                  </div>
                ))}
                {picked.extraAmount > 0 && (
                  <div className="flex justify-between">
                    <span>추가 인원</span>
                    <span>{won(picked.extraAmount)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-forest-100 pt-4">
                <span className="text-sm text-forest-500">합계</span>
                <span className="font-display text-2xl font-bold text-forest-800">
                  {won(picked.total)}
                </span>
              </div>
              <p className="mt-1 text-right text-xs text-forest-400">
                예약금 {won(Math.round(picked.total * 0.3))} (30%)
              </p>
            </>
          )}

          <p className="mt-5 rounded-xl bg-mist px-4 py-3 text-xs leading-relaxed text-forest-600">
            현장 결제 옵션(바비큐·장작)은 도착 후 정산합니다.
            <br />
            전화 예약 {pension.phone} (09:00~21:00)
          </p>
        </div>
      </aside>
    </div>
  );
}
