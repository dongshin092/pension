import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { findSessionUser, revokeSession, saveSession } from "./repo";
import type { SessionUser } from "./types";

export const SESSION_COOKIE = "ms_session";
const SESSION_DAYS = 14;

/** 쿠키에는 원본 토큰, 저장소에는 해시만 둔다 (DB가 털려도 세션 위조 불가) */
function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashPassword(plain: string) {
  return bcrypt.hashSync(plain, 10);
}

/** pgcrypto(crypt/gen_salt('bf'))로 만든 $2a$ 해시도 그대로 검증된다 */
export function verifyPassword(plain: string, hash: string) {
  if (!hash) return false;
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

export async function startSession(userId: number, userAgent?: string) {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await saveSession(
    {
      tokenHash: hashToken(token),
      userId,
      expiresAt: expires.toISOString(),
      createdAt: new Date().toISOString(),
    },
    { userAgent },
  );

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await revokeSession(hashToken(token));
    jar.delete(SESSION_COOKIE);
  }
}

/** 로그인한 회원 정보. 비로그인이면 null */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await findSessionUser(hashToken(token));
  return user ?? null;
}

/* ------------------------------ 입력값 검증 ------------------------------- */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

/** 8자 이상 + 영문/숫자 조합 */
export function checkPasswordStrength(password: string): string | null {
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return "비밀번호에 영문과 숫자를 함께 넣어주세요.";
  }
  return null;
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return phone.trim();
}
