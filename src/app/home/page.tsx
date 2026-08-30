import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/Icon";
import { aboutImages, facilities, heroImages, pension, rooms, won } from "@/lib/data";

export default function HomePage() {
  return (
    <>
      {/* 히어로 */}
      <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden">
        <Image
          src={heroImages.home}
          alt="안개가 낀 가평 잣나무 숲"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/70 via-forest-900/40 to-forest-900/85" />
        <div className="container-x relative -mt-16 pb-24 pt-28 text-center">
          <p className="text-xs font-semibold tracking-[0.32em] text-forest-100 md:text-sm">
            GAPYEONG FOREST STAY
          </p>
          <h1 className="fade-up mt-6 font-display text-4xl font-bold leading-[1.25] text-white drop-shadow-lg md:text-6xl">
            숲이 먼저 인사하는 곳,
            <br />
            <span className="text-forest-200">마음속 쉼터</span>
          </h1>
          <p className="fade-up mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
            경기도 가평 상면, 잣나무 숲 안에 세 동뿐입니다.
            <br className="hidden sm:block" />
            한 동에 두 개씩, 모두 여섯 개의 10평 원룸형 객실.
          </p>
          <div className="fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/reservation"
              className="w-full max-w-xs rounded-full bg-forest-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-forest-900/40 transition hover:bg-forest-600 sm:w-auto"
            >
              실시간 예약하기
            </Link>
            <Link
              href="/rooms"
              className="w-full max-w-xs rounded-full border border-white/50 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
            >
              방 보러가기
            </Link>
          </div>
        </div>
      </section>

      {/* 요약 정보 바 */}
      <section className="border-b border-forest-100 bg-cream">
        <div className="container-x grid divide-forest-100 py-8 text-center sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          {[
            { k: "3개 동 · 6개 객실", v: "한 동에 두 방씩만" },
            { k: "10평 원룸형", v: "33㎡ / 기준 2인, 최대 3인" },
            { k: `체크인 ${pension.checkIn}`, v: `체크아웃 ${pension.checkOut}` },
            { k: "서울에서 1시간 10분", v: "설악IC에서 15분" },
          ].map((item) => (
            <div key={item.k} className="px-4 py-3">
              <p className="font-display text-lg font-bold text-forest-800">{item.k}</p>
              <p className="mt-1 text-sm text-forest-500">{item.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 소개 */}
      <section className="container-x py-20 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-forest-500">ABOUT</p>
            <h2 className="mt-4 font-display text-3xl font-bold leading-snug text-forest-800 md:text-4xl">
              방을 늘리지 않기로 했습니다
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-forest-700">
              <p>
                마음속 쉼터는 2018년에 두 동으로 시작해, 2021년에 한 동을 더해 지금의 여섯 개 객실이
                되었습니다. 자리가 더 있었지만 나무를 베어야 해서 그만두었습니다.
              </p>
              <p>
                덕분에 주말에도 마당에 사람이 열댓 명뿐입니다. 옆방 소리가 들리지 않고, 바비큐 데크에서
                줄을 설 일도 없습니다. 대신 화려한 부대시설은 없습니다. 숲과 조용함이 저희가 준비한
                전부입니다.
              </p>
            </div>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 border-b border-forest-300 pb-1 text-sm font-semibold text-forest-700 transition hover:border-forest-700"
            >
              펜션 소개 자세히 보기 <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {aboutImages.map((img, i) => (
              <div
                key={img.src}
                className={`relative overflow-hidden rounded-2xl shadow-md ${
                  i === 0 ? "aspect-[3/4]" : i === 1 ? "mt-6 aspect-[3/4]" : i === 2 ? "-mt-6 aspect-[4/3]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 1024px) 45vw, 300px"
                  className="object-cover transition duration-500 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 객실 미리보기 */}
      <section className="bg-mist py-20 md:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.24em] text-forest-500">ROOMS</p>
              <h2 className="mt-4 font-display text-3xl font-bold text-forest-800 md:text-4xl">
                여섯 개의 방
              </h2>
              <p className="mt-3 text-sm text-forest-500">
                전부 10평(33㎡) 원룸형 · 기준 2인, 최대 3인
              </p>
            </div>
            <Link
              href="/rooms"
              className="border-b border-forest-300 pb-1 text-sm font-semibold text-forest-600 hover:border-forest-600"
            >
              전체 객실 보기 →
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <Link
                key={room.slug}
                href={`/rooms/${room.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={room.photos[0].src}
                    alt={room.photos[0].alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-forest-700 backdrop-blur">
                    {room.buildingLabel} · {room.floor}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-forest-800">{room.name}</h3>
                  <p className="mt-1.5 line-clamp-1 text-sm text-forest-500">{room.concept}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-forest-500">
                      {room.size} · 기준 {room.standard}인
                    </span>
                    <span className="font-semibold text-forest-700">{won(room.price.weekday)}~</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 부대시설 */}
      <section className="container-x py-20 md:py-28">
        <p className="text-xs font-semibold tracking-[0.24em] text-forest-500">FACILITIES</p>
        <h2 className="mt-4 font-display text-3xl font-bold text-forest-800 md:text-4xl">
          숲에서 할 수 있는 것들
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {facilities.slice(0, 4).map((f) => (
            <article key={f.key} className="group overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={f.image}
                  alt={f.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 300px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <span className="inline-flex rounded-xl bg-forest-50 p-2.5 text-forest-600">
                  <Icon name={f.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold text-forest-800">{f.name}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-forest-500">{f.summary}</p>
              </div>
            </article>
          ))}
        </div>
        <Link
          href="/facilities"
          className="mt-8 inline-flex items-center gap-2 border-b border-forest-300 pb-1 text-sm font-semibold text-forest-700 hover:border-forest-700"
        >
          부대시설 전체 보기 <span aria-hidden>→</span>
        </Link>
      </section>

      {/* 예약 CTA */}
      <section className="container-x pb-4">
        <div className="relative isolate overflow-hidden rounded-3xl px-8 py-16 text-center md:px-16 md:py-24">
          <Image
            src={heroImages.reservation}
            alt="해가 드는 숲"
            fill
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-forest-900/70" />
          <div className="relative">
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              오늘 밤 남은 방을 지금 확인하세요
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-white/85">
              날짜만 고르면 여섯 개 방의 예약 가능 여부와 요금이 바로 나옵니다.
            </p>
            <Link
              href="/reservation"
              className="mt-9 inline-block rounded-full bg-white px-9 py-4 text-base font-semibold text-forest-800 transition hover:bg-forest-50"
            >
              실시간 예약하기
            </Link>
            <p className="mt-5 text-sm text-white/70">전화 예약 {pension.phone} (09:00~21:00)</p>
          </div>
        </div>
      </section>
    </>
  );
}
