import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { buildings, getRoom, heroImages, rooms, won } from "@/lib/data";

export const metadata = { title: "룸 정보" };

export default function RoomsPage() {
  return (
    <>
      <PageHero
        eyebrow="ROOMS"
        title="한 동에 두 방, 모두 여섯 방"
        description="모든 객실은 10평(33㎡) 원룸형입니다. 기준 2인 · 최대 3인, 개별 테라스와 미니 주방이 있습니다."
        image={heroImages.rooms}
        imageAlt="숲속 펜션 객실 창밖 풍경"
      />

      <section className="container-x py-14 md:py-20">
        <div className="space-y-16">
          {buildings.map((building) => (
            <div key={building.id}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest-600 font-display text-sm font-bold text-white">
                  {building.id}
                </span>
                <h2 className="font-display text-2xl font-bold text-forest-800">{building.label}</h2>
                <span className="rounded-full bg-forest-50 px-3 py-1 text-xs font-semibold text-forest-600">
                  2실
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-forest-500">{building.note}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {building.rooms.map((slug, idx) => {
                  const room = getRoom(slug);
                  if (!room) return null;
                  return (
                    <article
                      key={slug}
                      className="group overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-sm transition hover:shadow-lg"
                    >
                      <Link href={`/rooms/${room.slug}`} className="block">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={room.photos[0].src}
                            alt={room.photos[0].alt}
                            fill
                            sizes="(max-width: 768px) 100vw, 560px"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-forest-700 backdrop-blur">
                            {room.floor} · {idx === 0 ? "아래층" : "위층"}
                          </span>
                        </div>
                      </Link>

                      {/* 미리보기 썸네일 */}
                      <div className="flex gap-1.5 px-3 pt-3">
                        {room.photos.slice(1).map((photo) => (
                          <div
                            key={photo.src}
                            className="relative h-16 flex-1 overflow-hidden rounded-lg"
                          >
                            <Image
                              src={photo.src}
                              alt={photo.alt}
                              fill
                              sizes="160px"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="p-6">
                        <h3 className="font-display text-2xl font-bold text-forest-800">
                          {room.name}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-forest-500">{room.concept}</p>

                        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                          {[
                            ["면적", `${room.size} (${room.sizeM2})`],
                            ["인원", `기준 ${room.standard}인 / 최대 ${room.max}인`],
                            ["침구", room.bed],
                            ["전망", room.view],
                          ].map(([k, v]) => (
                            <div key={k}>
                              <dt className="text-forest-400">{k}</dt>
                              <dd className="font-medium text-forest-700">{v}</dd>
                            </div>
                          ))}
                        </dl>

                        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-forest-50 pt-5">
                          <div>
                            <p className="text-xs text-forest-400">주중 1박</p>
                            <p className="font-display text-xl font-bold text-forest-800">
                              {won(room.price.weekday)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/rooms/${room.slug}`}
                              className="rounded-full border border-forest-200 px-4 py-2 text-sm font-semibold text-forest-700 hover:bg-forest-50"
                            >
                              사진·상세보기
                            </Link>
                            <Link
                              href={`/reservation?room=${room.slug}`}
                              className="rounded-full bg-forest-600 px-4 py-2 text-sm font-semibold text-white hover:bg-forest-700"
                            >
                              예약
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 요금표 */}
      <section className="bg-mist py-14 md:py-20">
        <div className="container-x">
          <h2 className="font-display text-2xl font-bold text-forest-800 md:text-3xl">요금 안내</h2>
          <p className="mt-2 text-sm text-forest-500">
            1박 기준 · 기준 인원 2인 / 추가 1인 20,000원 · 성수기는 7~8월과 1월입니다.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-forest-100 bg-white">
            <table className="w-full min-w-[620px] text-sm">
              <thead>
                <tr className="border-b border-forest-100 bg-forest-50 text-left text-forest-700">
                  <th className="px-5 py-3.5 font-semibold">객실</th>
                  <th className="px-5 py-3.5 font-semibold">동 / 층</th>
                  <th className="px-5 py-3.5 font-semibold">주중(월~목)</th>
                  <th className="px-5 py-3.5 font-semibold">금·일</th>
                  <th className="px-5 py-3.5 font-semibold">토</th>
                  <th className="px-5 py-3.5 font-semibold">성수기</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.slug} className="border-b border-forest-50 last:border-0">
                    <td className="px-5 py-3.5 font-semibold text-forest-800">{room.name}</td>
                    <td className="px-5 py-3.5 text-forest-500">
                      {room.buildingLabel} {room.floor}
                    </td>
                    <td className="px-5 py-3.5 text-forest-700">{won(room.price.weekday)}</td>
                    <td className="px-5 py-3.5 text-forest-700">{won(room.price.friday)}</td>
                    <td className="px-5 py-3.5 text-forest-700">{won(room.price.saturday)}</td>
                    <td className="px-5 py-3.5 text-forest-700">{won(room.price.peak)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
