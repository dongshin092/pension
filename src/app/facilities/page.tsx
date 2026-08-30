import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Icon from "@/components/Icon";
import { facilities, heroImages } from "@/lib/data";

export const metadata = { title: "부대시설" };

const hours = [
  ["숲속 라운지", "07:00 ~ 22:00"],
  ["바비큐 데크", "17:00 ~ 22:00 (예약제)"],
  ["캠프파이어", "18:00 ~ 22:00 (10~4월)"],
  ["물놀이터", "09:00 ~ 18:00 (6월 말~8월 말)"],
  ["매점", "08:00 ~ 22:00"],
  ["별관측 데크", "상시 개방 (22시 이후 마당 조명 소등)"],
];

const paid = [
  ["바비큐 이용료 (2인)", "20,000원", "숯 · 그릴 · 집게 포함"],
  ["바비큐 추가 1인", "5,000원", "3인 이상 이용 시"],
  ["장작 한 바구니", "15,000원", "화로 이용 포함"],
  ["마시멜로 세트", "5,000원", "꼬치 2개 포함"],
  ["추가 인원 (1인)", "20,000원", "침구 · 세면도구 포함"],
  ["가평역 픽업", "무료", "1일 2회, 사전 요청 시"],
];

export default function FacilitiesPage() {
  return (
    <>
      <PageHero
        eyebrow="FACILITIES"
        title="부대시설"
        description="크고 화려한 시설은 없습니다. 숲에서 하루를 보내는 데 필요한 만큼만 갖췄습니다."
        image={heroImages.facilities}
        imageAlt="숲속 펜션 바비큐 데크"
      />

      <section className="container-x py-14 md:py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {facilities.map((f) => (
            <article
              key={f.key}
              className="group overflow-hidden rounded-2xl border border-forest-100 bg-white shadow-sm transition hover:shadow-lg"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={f.image}
                  alt={f.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 560px"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-900/85 to-transparent p-5 pt-12">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex rounded-lg bg-white/15 p-2 text-white backdrop-blur">
                      <Icon name={f.icon} className="h-5 w-5" />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-bold text-white">{f.name}</h2>
                      <p className="text-xs text-white/80">{f.summary}</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="p-6 text-sm leading-relaxed text-forest-600">{f.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-mist py-14 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-800">운영 시간</h2>
            <div className="mt-5 overflow-hidden rounded-2xl bg-white">
              {hours.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between border-b border-forest-50 px-6 py-4 text-sm last:border-0"
                >
                  <span className="font-medium text-forest-700">{k}</span>
                  <span className="text-forest-500">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-forest-800">유료 항목</h2>
            <div className="mt-5 overflow-hidden rounded-2xl bg-white">
              {paid.map(([k, price, note]) => (
                <div key={k} className="border-b border-forest-50 px-6 py-4 text-sm last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-forest-700">{k}</span>
                    <span className="font-semibold text-forest-800">{price}</span>
                  </div>
                  <p className="mt-1 text-xs text-forest-400">{note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-forest-500">
              유료 항목은 현장 결제(현금 · 카드 모두 가능)입니다. 바비큐와 장작은 당일 오후 3시까지
              라운지나 전화로 신청해 주세요.
            </p>
          </div>
        </div>
      </section>

      <section className="container-x py-14 md:py-20">
        <div className="relative isolate overflow-hidden rounded-3xl px-8 py-14 text-center md:px-16">
          <Image
            src={heroImages.board}
            alt="저녁 숲"
            fill
            sizes="(max-width: 1280px) 100vw, 1216px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-forest-900/75" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              시설보다 먼저 정해야 할 건 날짜입니다
            </h2>
            <p className="mt-3 text-white/80">여섯 방뿐이라 주말은 빨리 마감됩니다.</p>
            <Link
              href="/reservation"
              className="mt-7 inline-block rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-forest-800 hover:bg-forest-50"
            >
              실시간 예약하기
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
