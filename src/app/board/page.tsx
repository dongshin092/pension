import Link from "next/link";
import PageHero from "@/components/PageHero";
import { heroImages } from "@/lib/data";
import { getPosts } from "@/lib/repo";
import type { BoardCategory } from "@/lib/types";

export const metadata = { title: "게시판" };
export const dynamic = "force-dynamic";

const tabs: ("전체" | BoardCategory)[] = ["전체", "공지", "예약문의", "이용후기"];

const badgeStyle: Record<BoardCategory, string> = {
  공지: "bg-forest-700 text-white",
  예약문의: "bg-bark-300/40 text-bark-700",
  이용후기: "bg-forest-100 text-forest-700",
};

export default async function BoardPage(props: PageProps<"/board">) {
  const params = await props.searchParams;
  const raw = typeof params.category === "string" ? params.category : "전체";
  const current = (tabs as string[]).includes(raw) ? raw : "전체";

  const all = await getPosts();
  const posts = current === "전체" ? all : all.filter((p) => p.category === current);

  return (
    <>
      <PageHero
        eyebrow="BOARD"
        title="게시판"
        description="공지사항과 예약 문의, 다녀가신 분들의 후기를 모아둔 곳입니다. 문의는 보통 하루 안에 답변드립니다."
        image={heroImages.board}
        imageAlt="숲속 라운지"
      />

      <section className="container-x py-12 md:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = current === tab;
              return (
                <Link
                  key={tab}
                  href={tab === "전체" ? "/board" : `/board?category=${encodeURIComponent(tab)}`}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-forest-600 text-white"
                      : "border border-forest-200 text-forest-600 hover:bg-forest-50"
                  }`}
                >
                  {tab}
                  {tab !== "전체" && (
                    <span className="ml-1.5 text-xs opacity-70">
                      {all.filter((p) => p.category === tab).length}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
          <Link
            href="/board/write"
            className="rounded-full bg-forest-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-700"
          >
            글쓰기
          </Link>
        </div>

        {/* 목록 - 데스크톱 테이블 */}
        <div className="mt-6 hidden overflow-hidden rounded-2xl border border-forest-100 bg-white md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-forest-100 bg-forest-50 text-left text-forest-700">
                <th className="w-16 px-5 py-3.5 font-semibold">번호</th>
                <th className="w-24 px-3 py-3.5 font-semibold">말머리</th>
                <th className="px-3 py-3.5 font-semibold">제목</th>
                <th className="w-28 px-3 py-3.5 font-semibold">작성자</th>
                <th className="w-28 px-3 py-3.5 font-semibold">작성일</th>
                <th className="w-16 px-5 py-3.5 text-right font-semibold">조회</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className={`border-b border-forest-50 last:border-0 ${
                    post.pinned ? "bg-forest-50/50" : ""
                  }`}
                >
                  <td className="px-5 py-4 text-forest-400">
                    {post.pinned ? "공지" : post.id}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyle[post.category]}`}
                    >
                      {post.category}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <Link
                      href={`/board/${post.id}`}
                      className="font-medium text-forest-800 hover:text-forest-600 hover:underline"
                    >
                      {post.title}
                    </Link>
                    {post.reply && (
                      <span className="ml-2 rounded bg-forest-100 px-1.5 py-0.5 text-xs text-forest-600">
                        답변완료
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-forest-500">{post.author}</td>
                  <td className="px-3 py-4 text-forest-400">{post.createdAt}</td>
                  <td className="px-5 py-4 text-right text-forest-400">{post.views}</td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-forest-400">
                    아직 글이 없습니다. 첫 글을 남겨보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 목록 - 모바일 카드 */}
        <div className="mt-6 space-y-3 md:hidden">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="block rounded-2xl border border-forest-100 bg-white p-5"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeStyle[post.category]}`}
                >
                  {post.category}
                </span>
                {post.reply && (
                  <span className="rounded bg-forest-100 px-1.5 py-0.5 text-xs text-forest-600">
                    답변완료
                  </span>
                )}
              </div>
              <p className="mt-2.5 font-medium leading-snug text-forest-800">{post.title}</p>
              <p className="mt-2 text-xs text-forest-400">
                {post.author} · {post.createdAt} · 조회 {post.views}
              </p>
            </Link>
          ))}
          {posts.length === 0 && (
            <p className="rounded-2xl border border-forest-100 bg-white py-14 text-center text-sm text-forest-400">
              아직 글이 없습니다.
            </p>
          )}
        </div>

        <p className="mt-6 text-xs text-forest-400">
          예약 확인·변경은 전화가 가장 빠릅니다. 비밀글 기능은 다음 단계에서 붙일 예정입니다.
        </p>
      </section>
    </>
  );
}
