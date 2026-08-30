"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/actions/auth";

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <label className="block">
        <span className="text-xs font-semibold text-forest-500">이메일</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3.5 text-sm outline-none focus:border-forest-500"
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-forest-500">비밀번호</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="비밀번호"
          className="mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3.5 text-sm outline-none focus:border-forest-500"
        />
      </label>

      {state?.error && (
        <p className="rounded-xl bg-bark-100 px-4 py-3 text-sm text-bark-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest-600 py-4 text-base font-semibold text-white transition enabled:hover:bg-forest-700 disabled:bg-forest-200"
      >
        {pending ? "확인 중…" : "로그인"}
      </button>

      <p className="pt-1 text-xs leading-relaxed text-forest-400">
        비밀번호를 잊으셨다면 펜션으로 연락 주세요. 본인 확인 후 재설정 메일을 보내드립니다.
      </p>
    </form>
  );
}
