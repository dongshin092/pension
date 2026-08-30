import Link from "next/link";
import { notFound } from "next/navigation";
import { bumpViews, getPost, getPosts } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/board/[id]">) {
  const { id } = await props.params;
  const post = await getPost(Number(id));
  return { title: post ? post.title : "게시판" };
}

export default async function PostPage(props: PageProps<"/board/[id]">) {
  const { id } = await props.params;
  const postId = Number(id);
  const post = Number.isInteger(postId) ? await getPost(postId) : undefined;
  if (!post) notFound();

  await bumpViews(postId);

  const all = await getPosts();
  const index = all.findIndex((p) => p.id === post.id);
  const prev = all[index - 1];
  const next = all[index + 1];

  return (
    <section className="container-x max-w-3xl py-12 md:py-16">
      <Link href="/board" className="text-sm text-forest-500 hover:text-forest-700">
        ← 게시판 목록
      </Link>

      <article className="mt-5 overflow-hidden rounded-2xl border border-forest-100 bg-white">
        <header className="border-b border-forest-100 bg-forest-50/60 px-6 py-6 md:px-8">
          <span className="rounded-full bg-forest-600 px-3 py-1 text-xs font-semibold text-white">
            {post.category}
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold leading-snug text-forest-800 md:text-3xl">
            {post.title}
          </h1>
          <p className="mt-3 text-sm text-forest-500">
            {post.author} · {post.createdAt} · 조회 {post.views + 1}
          </p>
        </header>

        <div className="px-6 py-8 md:px-8">
          {post.content.split("\n").map((line, i) =>
            line.trim() === "" ? (
              <br key={i} />
            ) : (
              <p key={i} className="mb-3 text-base leading-relaxed text-forest-700">
                {line}
              </p>
            ),
          )}
        </div>

        {post.reply && (
          <div className="mx-6 mb-8 rounded-2xl bg-mist p-6 md:mx-8">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-forest-700 px-2.5 py-1 text-xs font-semibold text-white">
                관리자 답변
              </span>
              <span className="text-xs text-forest-400">{post.reply.createdAt}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-forest-700">{post.reply.content}</p>
          </div>
        )}
      </article>

      <nav className="mt-6 divide-y divide-forest-50 overflow-hidden rounded-2xl border border-forest-100 bg-white text-sm">
        {[
          { label: "이전 글", post: prev },
          { label: "다음 글", post: next },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-4 px-6 py-4">
            <span className="w-16 shrink-0 text-forest-400">{row.label}</span>
            {row.post ? (
              <Link
                href={`/board/${row.post.id}`}
                className="truncate text-forest-700 hover:text-forest-900 hover:underline"
              >
                {row.post.title}
              </Link>
            ) : (
              <span className="text-forest-300">없습니다</span>
            )}
          </div>
        ))}
      </nav>

      <div className="mt-8 flex gap-3">
        <Link
          href="/board"
          className="rounded-full border border-forest-200 px-6 py-3 text-sm font-semibold text-forest-700 hover:bg-forest-50"
        >
          목록으로
        </Link>
        <Link
          href="/board/write"
          className="rounded-full bg-forest-600 px-6 py-3 text-sm font-semibold text-white hover:bg-forest-700"
        >
          글쓰기
        </Link>
      </div>
    </section>
  );
}
