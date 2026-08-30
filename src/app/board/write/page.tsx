"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BoardCategory } from "@/lib/types";

const categories: BoardCategory[] = ["예약문의", "이용후기"];

export default function WritePage() {
  const router = useRouter();
  const [category, setCategory] = useState<BoardCategory>("예약문의");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, author, content, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "저장에 실패했습니다.");
      router.push(`/board/${json.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 중 오류가 발생했습니다.");
      setSaving(false);
    }
  }

  return (
    <section className="container-x max-w-3xl py-12 md:py-16">
      <Link href="/board" className="text-sm text-forest-500 hover:text-forest-700">
        ← 게시판 목록
      </Link>
      <h1 className="mt-4 font-display text-3xl font-bold text-forest-800">글쓰기</h1>
      <p className="mt-2 text-sm text-forest-500">
        예약 문의는 연락처를 남겨주시면 더 빠르게 답변드립니다. 공지는 관리자만 작성할 수 있습니다.
      </p>

      <form
        onSubmit={submit}
        className="mt-8 space-y-5 rounded-2xl border border-forest-100 bg-white p-6 md:p-8"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold text-forest-500">말머리 *</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BoardCategory)}
              className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm outline-none focus:border-forest-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-forest-500">작성자 *</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
              minLength={2}
              maxLength={20}
              placeholder="홍길동"
              className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm outline-none focus:border-forest-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-forest-500">제목 *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={2}
            maxLength={100}
            placeholder="문의 내용을 한 줄로 적어주세요"
            className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm outline-none focus:border-forest-500"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-forest-500">내용 *</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            minLength={5}
            rows={10}
            placeholder="희망 날짜, 인원, 궁금한 점을 적어주세요."
            className="mt-1.5 w-full resize-y rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm leading-relaxed outline-none focus:border-forest-500"
          />
        </label>

        <label className="block sm:max-w-xs">
          <span className="text-xs font-semibold text-forest-500">글 비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={20}
            placeholder="수정·삭제할 때 사용합니다"
            className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3 text-sm outline-none focus:border-forest-500"
          />
        </label>

        {error && (
          <p className="rounded-xl bg-bark-100 px-4 py-3 text-sm text-bark-700">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-forest-600 px-7 py-3.5 text-sm font-semibold text-white transition enabled:hover:bg-forest-700 disabled:bg-forest-200"
          >
            {saving ? "등록 중…" : "등록하기"}
          </button>
          <Link
            href="/board"
            className="rounded-full border border-forest-200 px-7 py-3.5 text-sm font-semibold text-forest-700 hover:bg-forest-50"
          >
            취소
          </Link>
        </div>
      </form>
    </section>
  );
}
