import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RoomGallery from "@/components/RoomGallery";
import { getRoom, pension, rooms, stayNotes, won } from "@/lib/data";
import { getBookedDatesByRoom } from "@/lib/repo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return rooms.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(props: PageProps<"/rooms/[slug]">) {
  const { slug } = await props.params;
  const room = getRoom(slug);
  return { title: room ? `${room.name} (${room.buildingLabel})` : "룸 정보" };
}

function nextDays(count: number) {
  const out: Date[] = [];
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  for (let i = 0; i < count; i += 1) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push(d);
  }
  return out;
}

const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export default async function RoomDetailPage(props: PageProps<"/rooms/[slug]">) {
  const { slug } = await props.params;
  const room = getRoom(slug);
  if (!room) notFound();

  const booked = new Set((await getBookedDatesByRoom())[room.slug] ?? []);
  const others = rooms.filter((r) => r.slug !== room.slug).slice(0, 3);

  return (
    <>
      {/* 상단 대표 사진 */}
      <section className="relative isolate overflow-hidden bg-forest-900">
        <Image
          src={room.photos[0].src}
          alt={room.photos[0].alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/95 via-forest-900/55 to-forest-900/45" />
        <div className="container-x relative pb-12 pt-20 md:pb-16 md:pt-28">
          <nav className="text-sm text-forest-200">
            <Link href="/rooms" className="hover:text-white">
              룸 정보
            </Link>
            <span className="px-2">/</span>
            <span className="text-white">{room.name}</span>
          </nav>
          <p className="mt-6 text-xs font-semibold tracking-[0.24em] text-forest-200">
            {room.building}동 {room.buildingLabel} · {room.floor}
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white drop-shadow md:text-5xl">
            {room.name}
          </h1>
          <p className="mt-3 max-w-xl text-white/85">{room.concept}</p>
        </div>
      </section>

      <section className="container-x py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            {/* 객실 상세 사진 */}
            <h2 className="font-display text-2xl font-bold text-forest-800">객실 사진</h2>
            <p className="mt-2 text-sm text-forest-500">
              사진을 눌러 크게 보실 수 있습니다. 실제 객실 구성과 같습니다.
            </p>
            <div className="mt-5">
              <RoomGallery items={room.photos} />
            </div>

            <h2 className="mt-12 font-display text-2xl font-bold text-forest-800">이 방에 대해</h2>
            <p className="mt-4 text-base leading-relaxed text-forest-700">{room.description}</p>

            <h3 className="mt-10 font-display text-xl font-bold text-forest-800">객실 정보</h3>
            <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {[
                ["면적", `${room.size} / ${room.sizeM2} 원룸형`],
                ["구조", "침실 + 미니주방 + 욕실 + 테라스"],
                ["인원", `기준 ${room.standard}인 / 최대 ${room.max}인`],
                ["침구", room.bed],
                ["전망", room.view],
                ["위치", `${room.buildingLabel} ${room.floor}`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-forest-100 bg-white px-5 py-4">
                  <dt className="text-xs text-forest-400">{k}</dt>
                  <dd className="mt-1 text-sm font-semibold text-forest-800">{v}</dd>
                </div>
              ))}
            </dl>

            <h3 className="mt-10 font-display text-xl font-bold text-forest-800">비품 · 시설</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {room.amenities.map((a) => (
                <li
                  key={a}
                  className="rounded-full bg-forest-50 px-4 py-2 text-sm font-medium text-forest-700"
                >
                  {a}
                </li>
              ))}
            </ul>

            <h3 className="mt-10 font-display text-xl font-bold text-forest-800">
              앞으로 2주 예약 현황
            </h3>
            <p className="mt-2 text-sm text-forest-500">
              회색은 이미 예약된 날짜입니다. 실시간 예약 화면에서 날짜를 고르면 정확한 요금이
              계산됩니다.
            </p>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {nextDays(14).map((d) => {
                const key = d.toISOString().slice(0, 10);
                const isBooked = booked.has(key);
                const weekend = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <div
                    key={key}
                    className={`rounded-xl border px-1 py-2.5 text-center ${
                      isBooked
                        ? "border-forest-100 bg-forest-100 text-forest-400"
                        : "border-forest-200 bg-white text-forest-700"
                    }`}
                  >
                    <p className={`text-[11px] ${weekend ? "text-bark-500" : "text-forest-400"}`}>
                      {dayLabels[d.getDay()]}
                    </p>
                    <p className="text-sm font-bold">{d.getDate()}</p>
                    <p className="mt-0.5 text-[10px]">{isBooked ? "마감" : "가능"}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 예약 사이드 카드 */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-forest-100 bg-white p-7 shadow-sm">
              <p className="text-sm text-forest-400">1박 요금</p>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {[
                    ["주중 (월~목)", room.price.weekday],
                    ["금요일 · 일요일", room.price.friday],
                    ["토요일", room.price.saturday],
                    ["성수기 (7~8월, 1월)", room.price.peak],
                  ].map(([label, value]) => (
                    <tr key={label as string} className="border-b border-forest-50 last:border-0">
                      <td className="py-2.5 text-forest-500">{label}</td>
                      <td className="py-2.5 text-right font-semibold text-forest-800">
                        {won(value as number)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-xs leading-relaxed text-forest-400">
                기준 2인 요금입니다. 추가 1인 20,000원(침구 포함), 최대 {room.max}인까지 가능합니다.
              </p>
              <Link
                href={`/reservation?room=${room.slug}`}
                className="mt-6 block rounded-full bg-forest-600 py-4 text-center text-base font-semibold text-white transition hover:bg-forest-700"
              >
                {room.name} 실시간 예약
              </Link>
              <a
                href={`tel:${pension.phone}`}
                className="mt-3 block rounded-full border border-forest-200 py-3.5 text-center text-sm font-semibold text-forest-700 hover:bg-forest-50"
              >
                전화 문의 {pension.phone}
              </a>
            </div>

            <div className="mt-5 rounded-2xl bg-mist p-6">
              <p className="font-display text-base font-bold text-forest-800">알아두실 점</p>
              <ul className="mt-3 space-y-2.5">
                {stayNotes.slice(0, 4).map((n) => (
                  <li key={n} className="flex gap-2.5 text-xs leading-relaxed text-forest-600">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-forest-400" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* 다른 객실 */}
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold text-forest-800">다른 방도 보기</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {others.map((r) => (
              <Link
                key={r.slug}
                href={`/rooms/${r.slug}`}
                className="group overflow-hidden rounded-2xl border border-forest-100 bg-white transition hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={r.photos[0].src}
                    alt={r.photos[0].alt}
                    fill
                    sizes="(max-width: 640px) 100vw, 320px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs text-forest-400">
                    {r.buildingLabel} · {r.floor}
                  </p>
                  <p className="mt-1 font-display text-lg font-bold text-forest-800">{r.name}</p>
                  <p className="mt-1 text-sm text-forest-500">{won(r.price.weekday)}~</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
