"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  EMAIL_RE,
  PHONE_RE,
  checkPasswordStrength,
  endSession,
  hashPassword,
  normalizePhone,
  startSession,
  verifyPassword,
} from "@/lib/auth";
import { createUser, findUserByEmail, touchLastLogin } from "@/lib/repo";

export type AuthState = { error?: string; field?: string } | null;

function safeNext(next: unknown) {
  // 오픈 리다이렉트 방지: 내부 경로만 허용
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : "/mypage";
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const agreeService = formData.get("agreeService") === "on";
  const agreePrivacy = formData.get("agreePrivacy") === "on";
  const marketing = formData.get("agreeMarketing") === "on";

  if (name.length < 2) return { error: "이름을 2자 이상 입력해 주세요.", field: "name" };
  if (!EMAIL_RE.test(email)) return { error: "이메일 형식을 확인해 주세요.", field: "email" };
  if (phoneRaw && !PHONE_RE.test(phoneRaw.replace(/\s/g, ""))) {
    return { error: "휴대폰 번호 형식을 확인해 주세요. (예: 010-1234-5678)", field: "phone" };
  }
  const weak = checkPasswordStrength(password);
  if (weak) return { error: weak, field: "password" };
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 서로 다릅니다.", field: "passwordConfirm" };
  }
  if (!agreeService || !agreePrivacy) {
    return { error: "필수 약관에 동의해 주세요.", field: "terms" };
  }

  const user = await createUser({
    email,
    passwordHash: hashPassword(password),
    name,
    phone: phoneRaw ? normalizePhone(phoneRaw) : null,
    marketingOptIn: marketing,
  });

  if (!user) {
    return { error: "이미 가입된 이메일입니다. 로그인해 주세요.", field: "email" };
  }

  const agent = (await headers()).get("user-agent") ?? undefined;
  await startSession(user.id, agent);
  revalidatePath("/", "layout");
  redirect("/mypage?welcome=1");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  const user = await findUserByEmail(email);
  // 계정 존재 여부를 노출하지 않도록 같은 문구로 응답한다
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  if (user.status !== "active") {
    return { error: "이용이 제한된 계정입니다. 펜션으로 문의해 주세요." };
  }

  const agent = (await headers()).get("user-agent") ?? undefined;
  await startSession(user.id, agent);
  await touchLastLogin(user.id);
  revalidatePath("/", "layout");
  redirect(next);
}

export async function logoutAction() {
  await endSession();
  revalidatePath("/", "layout");
  redirect("/");
}
