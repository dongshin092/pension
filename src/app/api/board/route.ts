import { NextResponse } from "next/server";
import { createPost, getPosts } from "@/lib/repo";
import type { BoardCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const CATEGORIES: BoardCategory[] = ["공지", "예약문의", "이용후기"];

export async function GET(request: Request) {
  const category = new URL(request.url).searchParams.get("category");
  const posts = await getPosts();
  return NextResponse.json(
    category && category !== "전체" ? posts.filter((p) => p.category === category) : posts,
  );
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const category = String(body.category ?? "") as BoardCategory;
  const title = String(body.title ?? "").trim();
  const author = String(body.author ?? "").trim();
  const content = String(body.content ?? "").trim();
  const password = body.password ? String(body.password) : undefined;

  if (!CATEGORIES.includes(category) || category === "공지") {
    return NextResponse.json(
      { error: "말머리를 선택해 주세요. 공지는 관리자만 작성할 수 있습니다." },
      { status: 400 },
    );
  }
  if (title.length < 2) return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  if (author.length < 2) return NextResponse.json({ error: "작성자를 입력해 주세요." }, { status: 400 });
  if (content.length < 5) return NextResponse.json({ error: "내용을 입력해 주세요." }, { status: 400 });

  const post = await createPost({ category, title, author, content, password });
  return NextResponse.json(post, { status: 201 });
}
