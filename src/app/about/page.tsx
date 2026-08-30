import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import { aboutImages, buildings, directions, getRoom, heroImages, pension, stayNotes } from "@/lib/data";

export const metadata = { title: "펜션 소개" };

const timeline = [
  { year: "2018", text: "숲채(A동) 두 방으로 문을 열었습니다." },
  { year: "2019", text: "바람채(B동)를 올리고 바비큐 데크를 지붕형으로 바꿨습니다." },
  { year: "2021", text: "달빛채(C동) 완공. 여섯 개 객실로 확정하고 더 늘리지 않기로 정했습니다." },
  { year: "2024", text: "자작나무 산책로 정비와 별관측 데크 설치를 마쳤습니다." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="ABOUT"
        title="가평 숲 안, 여섯 개의 방"
        description="아침고요수목원에서 차로 12분. 잣나무와 자작나무가 섞인 낮은 골짜기에 세 동만 앉혔습니다."
        image={heroImages.about}
        imageAlt="가평 숲속에 자리한 펜션 주변 풍경"
      />

      <section className="container-x py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-800 md:text-3xl">
              &ldquo;조용한 게 전부인 곳&rdquo;
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-forest-700">
              <p>
                손님들이 남기는 후기에 가장 자주 나오는 말입니다. 저희는 그 말을 칭찬으로 받고
                있습니다. 마음속 쉼터에는 워터파크도, 노래방도, 넓은 연회장도 없습니다. 대신 밤 열
                시가 지나면 골짜기 물소리와 바람 소리밖에 들리지 않습니다.
              </p>
              <p>
                객실은 모두 10평(33㎡) 원룸형입니다. 방을 크게 만들지 않은 건, 어차피 여기서는 방
                안보다 테라스와 숲에서 보내는 시간이 길다는 걸 알기 때문입니다. 대신 침구와 온수,
                난방은 아끼지 않았습니다. 겨울에도 바닥이 따뜻합니다.
              </p>
              <p>
                주인 부부가 상주하며 직접 청소하고 체크인을 받습니다. 필요한 게 있으면 라운지에
                오시거나 전화 한 통 주세요. 대부분 5분 안에 갑니다.
              </p>
            </div>

            <div className="mt-10 rounded-2xl border border-forest-100 bg-white p-6">
              <h3 className="font-display text-lg font-bold text-forest-800">이용 안내</h3>
              <ul className="mt-4 space-y-3">
                {stayNotes.map((note) => (
                  <li key={note} className="flex gap-3 text-sm leading-relaxed text-forest-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-forest-400" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md">
              <Image
                src={aboutImages[1].src}
                alt={aboutImages[1].alt}
                fill
                sizes="(max-width: 1024px) 100vw, 420px"
                className="object-cover"
              />
            </div>
            <div className="rounded-2xl bg-forest-800 p-7 text-forest-100">
              <h3 className="font-display text-lg font-bold text-white">한눈에 보기</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["펜션명", pension.name],
                  ["주소", pension.address],
                  ["구성", "3개 동 · 6개 객실 (동별 2실)"],
                  ["객실 규모", "10평 / 33㎡ 원룸형"],
                  ["기준 인원", "2인 (최대 3인)"],
                  ["연락처", pension.phone],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-4 border-b border-white/10 pb-3 last:border-0">
                    <dt className="w-20 shrink-0 text-forest-300">{k}</dt>
                    <dd className="font-medium text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 세 개 동 */}
      <section className="bg-mist py-16 md:py-24">
        <div className="container-x">
          <p className="text-sm font-semibold tracking-[0.2em] text-forest-500">BUILDINGS</p>
          <h2 className="mt-3 font-display text-3xl font-bold text-forest-800">
            세 개 동, 각각 두 개의 방
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {buildings.map((b) => {
              const cover = getRoom(b.rooms[0])?.photos[0];
              return (
                <div key={b.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
                  {cover && (
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={cover.src}
                        alt={`${b.label} 객실`}
                        fill
                        sizes="(max-width: 768px) 100vw, 380px"
                        className="object-cover"
                      />
                      <span className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-forest-600 font-display text-sm font-bold text-white">
                        {b.id}
                      </span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-forest-800">{b.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-forest-500">{b.note}</p>
                    <p className="mt-4 text-sm font-semibold text-forest-600">
                      1층 · 2층 각 1실 (총 2실)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Link
            href="/rooms"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-forest-600 hover:text-forest-800"
          >
            객실별 상세 보기 <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      {/* 연혁 */}
      <section className="container-x py-16 md:py-24">
        <p className="text-sm font-semibold tracking-[0.2em] text-forest-500">HISTORY</p>
        <h2 className="mt-3 font-display text-3xl font-bold text-forest-800">지나온 자리</h2>
        <ol className="mt-10 space-y-6 border-l-2 border-forest-100 pl-6">
          {timeline.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-forest-500 ring-4 ring-cream" />
              <p className="font-display text-lg font-bold text-forest-700">{t.year}</p>
              <p className="mt-1 text-sm leading-relaxed text-forest-600">{t.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 오시는 길 */}
      <section className="bg-forest-900 py-16 text-forest-100 md:py-24">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-forest-300">LOCATION</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white">오시는 길</h2>
            <p className="mt-4 text-forest-200">{pension.address}</p>
            <div className="mt-8 space-y-5">
              {directions.map((d) => (
                <div key={d.label}>
                  <p className="font-semibold text-white">{d.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-forest-200">{d.value}</p>
                </div>
              ))}
            </div>
            <a
              href={`https://map.kakao.com/?q=${encodeURIComponent(pension.address)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-forest-800 hover:bg-forest-50"
            >
              카카오맵에서 열기
            </a>
          </div>
          <div className="relative min-h-72 overflow-hidden rounded-2xl border border-white/15">
            <Image
              src={aboutImages[3].src}
              alt={aboutImages[3].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 560px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-forest-900/55" />
            <div className="relative flex h-full flex-col items-center justify-center p-8 text-center">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <p className="mt-4 text-sm leading-relaxed text-white/90">
                {pension.address}
                <br />
                카카오맵 JS SDK 키를 넣으면 이 자리에 지도가 표시됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
