export type BoardCategory = "공지" | "예약문의" | "이용후기";

export type Post = {
  id: number;
  category: BoardCategory;
  title: string;
  author: string;
  content: string;
  createdAt: string;
  views: number;
  pinned?: boolean;
  reply?: { author: string; content: string; createdAt: string } | null;
};

export type Reservation = {
  id: string;
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  phone: string;
  memo?: string;
  total: number;
  nights: number;
  status: "대기" | "확정" | "취소";
  createdAt: string;
  userId?: number | null;
};

/** 화면에 내려보내는 최소 회원 정보 (비밀번호 해시는 절대 포함하지 않는다) */
export type SessionUser = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: "member" | "staff" | "admin";
};

/** 내부용 - 비밀번호 검증에만 쓴다 */
export type UserRecord = SessionUser & {
  passwordHash: string;
  status: "active" | "dormant" | "suspended" | "withdrawn";
};

export type StoredSession = {
  tokenHash: string;
  userId: number;
  expiresAt: string;
  createdAt: string;
};
