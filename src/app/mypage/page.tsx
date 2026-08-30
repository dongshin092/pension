import Link from "next/link";
import { redirect } from "next/navigation";
import PageHero from "@/components/PageHero";
import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { getRoom, heroImages, pension, won } from "@/lib/data";
import { getUserReservations } from "@/lib/repo";

export const metadata = { title: "마이페이지" };
export const dynamic = "force-dynamic";

const statusStyle: Record<string, string> = {
  확정: "bg-forest-600 text-white",
  대기: "bg-bark-300/50 text-bark-700",
  취소: "bg-forest-100 text-forest-400",
};

export default async function MyPage(props: PageProps<"/mypage">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/mypage");

  const params = await props.searchParams;
  const welcome = params.welcome === "1";
  const reservations = await getUserReservations(user.id);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = reservations.filter((r) => r.status !== "취소" && r.checkOut >= today);
  const past = reservations.filter((r) => r.status === "취소" || r.checkOut < today);

  return (
    <>
      <PageHero
        eyebrow="MY PAGE"
        title={`${user.name}님, 반갑습니다`}
        description="예약 내역과 회원 정보를 확인하실 수 있습니다."
        image={heroImages.mypage}
        imageAlt="숲속 펜션 마당"
      />

      <section className="container-x py-12 md:py-16">
        {welcome && (
          <p className="mb-8 rounded-2xl border border-forest-200 bg-forest-50 px-6 py-5 text-sm leading-relaxed text-forest-700">
            회원가입이 완료됐습니다. 이제 실시간 예약 화면에서 이름과 연락처가 자동으로 채워집니다.
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* 회원 정보 */}
          <aside>
            <div className="rounded-2xl border border-forest-100 bg-white p-6">
              <p className="font-display text-lg font-bold text-forest-800">회원 정보</p>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["이름", user.name],
                  ["이메일", user.email],
                  ["휴대폰", user.phone ?? "미등록"],
                  ["등급", user.role === "admin" ? "관리자" : "일반 회원"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-forest-50 pb-3 last:border-0">
                    <dt className="text-forest-400">{k}</dt>
                    <dd className="text-right font-medium text-forest-800">{v}</dd>
                  </div>
                ))}
              </dl>

              <Link
                href="/reservation"
                className="mt-6 block rounded-full bg-forest-600 py-3.5 text-center text-sm font-semibold text-white hover:bg-forest-700"
              >
                새로 예약하기
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="mt-3 w-full rounded-full border border-forest-200 py-3 text-sm font-semibold text-forest-600 hover:bg-forest-50"
                >
                  로그아웃
                </button>
              </form>
            </div>

            <p className="mt-4 rounded-2xl bg-mist px-5 py-4 text-xs leading-relaxed text-forest-500">
              회원 정보 수정과 탈퇴는 아직 화면이 없습니다. {pension.phone} 으로 연락 주시면 바로
              처리해 드립니다.
            </p>
          </aside>

          {/* 예약 내역 */}
          <div>
            <h2 className="font-display text-xl font-bold text-forest-800">
              다가오는 예약 <span className="text-forest-400">{upcoming.length}건</span>
            </h2>
            <div className="mt-4 space-y-3">
              {upcoming.map((r) => {
                const room = getRoom(r.roomSlug);
                return (
                  <article
                    key={r.id}
                    className="rounded-2xl border border-forest-100 bg-white p-6 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[r.status]}`}
                          >
                            {r.status}
                          </span>
                          <span className="text-xs text-forest-400">예약번호 {r.id}</span>
                        </div>
                        <p className="mt-2.5 font-display text-lg font-bold text-forest-800">
                          {room?.name ?? r.roomSlug}
                          <span className="ml-2 text-sm font-normal text-forest-400">
                            {room?.buildingLabel} {room?.floor}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-forest-500">
                          {r.checkIn} → {r.checkOut} · {r.nights}박 · {r.guests}명
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-forest-800">
                          {won(r.total)}
                        </p>
                        {r.status === "대기" && (
                          <p className="mt-1 text-xs text-bark-700">
                            예약금 {won(Math.round(r.total * 0.3))} 입금 대기
                          </p>
                        )}
                      </div>
                    </div>
                    {r.memo && (
                      <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-sm text-forest-600">
                        요청사항: {r.memo}
                      </p>
                    )}
                  </article>
                );
              })}

              {upcoming.length === 0 && (
                <div className="rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-14 text-center">
                  <p className="text-sm text-forest-500">아직 예정된 예약이 없습니다.</p>
                  <Link
                    href="/reservation"
                    className="mt-5 inline-block rounded-full bg-forest-600 px-7 py-3 text-sm font-semibold text-white hover:bg-forest-700"
                  >
                    빈 방 확인하기
                  </Link>
                </div>
              )}
            </div>

            {past.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-xl font-bold text-forest-800">
                  지난 예약 <span className="text-forest-400">{past.length}건</span>
                </h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-forest-100 bg-white">
                  {past.map((r) => (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-3 border-b border-forest-50 px-6 py-4 text-sm last:border-0"
                    >
                      <div>
                        <p className="font-medium text-forest-700">
                          {getRoom(r.roomSlug)?.name ?? r.roomSlug}
                        </p>
                        <p className="mt-0.5 text-xs text-forest-400">
                          {r.checkIn} → {r.checkOut} · {r.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-forest-500">{won(r.total)}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="mt-6 text-xs leading-relaxed text-forest-400">
              예약 변경·취소는 {pension.phone} 으로 연락 주세요. 온라인 취소 기능은 다음 단계에서
              붙일 예정입니다.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
