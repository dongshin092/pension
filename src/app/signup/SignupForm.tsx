"use client";

import { useActionState, useState } from "react";
import { signupAction, type AuthState } from "@/lib/actions/auth";

const field =
  "mt-1.5 w-full rounded-xl border border-forest-200 bg-cream px-4 py-3.5 text-sm outline-none focus:border-forest-500";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(signupAction, null);
  const [agreeAll, setAgreeAll] = useState(false);
  const [terms, setTerms] = useState({ service: false, privacy: false, marketing: false });

  function toggleAll(checked: boolean) {
    setAgreeAll(checked);
    setTerms({ service: checked, privacy: checked, marketing: checked });
  }

  function toggleOne(key: keyof typeof terms, checked: boolean) {
    const next = { ...terms, [key]: checked };
    setTerms(next);
    setAgreeAll(next.service && next.privacy && next.marketing);
  }

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-xs font-semibold text-forest-500">이름 *</span>
        <input name="name" required minLength={2} maxLength={20} placeholder="홍길동" className={field} />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-forest-500">이메일 *</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={field}
        />
      </label>

      <label className="block">
        <span className="text-xs font-semibold text-forest-500">휴대폰</span>
        <input
          name="phone"
          type="tel"
          placeholder="010-1234-5678"
          autoComplete="tel"
          className={field}
        />
        <span className="mt-1 block text-xs text-forest-400">
          예약 확인 문자를 받으실 번호입니다. 나중에 입력하셔도 됩니다.
        </span>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold text-forest-500">비밀번호 *</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="8자 이상"
            className={field}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-forest-500">비밀번호 확인 *</span>
          <input
            name="passwordConfirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="한 번 더"
            className={field}
          />
        </label>
      </div>
      <p className="text-xs text-forest-400">영문과 숫자를 함께 넣어 8자 이상으로 만들어 주세요.</p>

      {/* 약관 동의 */}
      <div className="rounded-2xl border border-forest-100 bg-white p-5">
        <label className="flex items-center gap-3 border-b border-forest-50 pb-3.5 text-sm font-semibold text-forest-800">
          <input
            type="checkbox"
            checked={agreeAll}
            onChange={(e) => toggleAll(e.target.checked)}
            className="h-4 w-4 accent-forest-600"
          />
          약관 전체 동의
        </label>
        <div className="mt-3.5 space-y-3">
          <label className="flex items-start gap-3 text-sm text-forest-600">
            <input
              type="checkbox"
              name="agreeService"
              checked={terms.service}
              onChange={(e) => toggleOne("service", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-forest-600"
            />
            <span>
              <b className="font-semibold text-forest-700">[필수]</b> 서비스 이용약관에 동의합니다.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-forest-600">
            <input
              type="checkbox"
              name="agreePrivacy"
              checked={terms.privacy}
              onChange={(e) => toggleOne("privacy", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-forest-600"
            />
            <span>
              <b className="font-semibold text-forest-700">[필수]</b> 개인정보 수집·이용에
              동의합니다. (이름·이메일·연락처, 회원 탈퇴 시까지 보관)
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm text-forest-600">
            <input
              type="checkbox"
              name="agreeMarketing"
              checked={terms.marketing}
              onChange={(e) => toggleOne("marketing", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-forest-600"
            />
            <span>
              <b className="font-normal text-forest-500">[선택]</b> 빈 방·할인 소식 수신에
              동의합니다.
            </span>
          </label>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-xl bg-bark-100 px-4 py-3 text-sm text-bark-700">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-forest-600 py-4 text-base font-semibold text-white transition enabled:hover:bg-forest-700 disabled:bg-forest-200"
      >
        {pending ? "가입 중…" : "회원가입"}
      </button>
    </form>
  );
}
