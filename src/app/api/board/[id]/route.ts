import { NextResponse } from "next/server";
import { bumpViews, getPost } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) {
    return NextResponse.json({ error: "잘못된 게시글 번호입니다." }, { status: 400 });
  }
  const post = await getPost(postId);
  if (!post) {
    return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 });
  }
  await bumpViews(postId);
  return NextResponse.json(post);
}
