import PageHero from "@/components/PageHero";
import ReservationClient from "./ReservationClient";
import { heroImages, rooms } from "@/lib/data";

export const metadata = { title: "실시간 예약하기" };

export default async function ReservationPage(props: PageProps<"/reservation">) {
  const params = await props.searchParams;
  const roomParam = typeof params.room === "string" ? params.room : undefined;
  const initialRoom = rooms.some((r) => r.slug === roomParam) ? roomParam : undefined;

  return (
    <>
      <PageHero
        eyebrow="RESERVATION"
        title="실시간 예약하기"
        description="날짜를 고르면 여섯 개 방의 잔여 여부와 요금이 바로 계산됩니다. 예약금 입금이 확인되면 확정됩니다."
        image={heroImages.reservation}
        imageAlt="아침 햇살이 드는 숲"
      />
      <section className="container-x py-12 md:py-16">
        <ReservationClient initialRoom={initialRoom} />
      </section>
    </>
  );
}
