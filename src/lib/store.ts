import fs from "node:fs";
import path from "node:path";
import type { Post, Reservation, StoredSession, UserRecord } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const RESERVATIONS_FILE = path.join(DATA_DIR, "reservations.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function read<T>(file: string, seed: () => T[]): T[] {
  ensureDir();
  if (!fs.existsSync(file)) {
    const data = seed();
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
    return data;
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T[];
  } catch {
    return [];
  }
}

function write<T>(file: string, data: T[]) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function dayOffset(days: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seedPosts(): Post[] {
  return [
    {
      id: 1,
      category: "공지",
      title: "가을 성수기(10~11월) 주말 예약 안내",
      author: "관리자",
      content:
        "단풍철 주말은 예약이 빠르게 마감됩니다. 토요일 1박은 2주 전부터, 연휴는 한 달 전부터 문의가 몰립니다.\n\n입금 확인 순으로 확정되며, 예약금은 1박 요금의 30%입니다. 취소 규정은 이용 7일 전 전액 환불, 3일 전 50% 환불, 당일 환불 불가입니다.",
      createdAt: dayOffset(-14),
      views: 412,
      pinned: true,
      reply: null,
    },
    {
      id: 2,
      category: "공지",
      title: "바비큐 데크 이용 시간 변경(오후 5시 ~ 밤 10시)",
      author: "관리자",
      content:
        "숲 화재 예방과 이웃 객실 소음 문제로 바비큐 이용 시간을 오후 5시부터 밤 10시까지로 정리했습니다. 숯 정리는 저희가 하니 그릴만 그대로 두고 들어가셔도 됩니다.",
      createdAt: dayOffset(-9),
      views: 233,
      pinned: true,
      reply: null,
    },
    {
      id: 3,
      category: "이용후기",
      title: "안개방에서 본 새벽 안개, 사진보다 좋았어요",
      author: "정하늘",
      content:
        "코너 방이라 창이 두 면인 게 정말 컸습니다. 여섯 시쯤 눈이 떠져서 침대에 그대로 누워 골짜기 안개 올라오는 걸 한참 봤어요. 10평이라 작을까 걱정했는데 둘이 쓰기엔 딱 좋았습니다. 라운지 커피도 잘 마셨습니다.",
      createdAt: dayOffset(-6),
      views: 158,
      reply: {
        author: "관리자",
        content: "안개방을 가장 좋아해 주시는 분들이 많습니다. 다음엔 별빛방 천창도 한번 보세요. 감사합니다!",
        createdAt: dayOffset(-5),
      },
    },
    {
      id: 4,
      category: "이용후기",
      title: "아이 둘이랑 달빛방 다녀왔습니다",
      author: "박지운",
      content:
        "좌식 매트가 있어서 아이들이 굴러다니기 좋았고, 물놀이터가 얕아서 계속 붙어 있지 않아도 됐습니다. 산책로도 유모차만 아니면 충분히 걷습니다. 밤에 화로 앞에서 마시멜로 구운 게 아이들 기억에 제일 남았대요.",
      createdAt: dayOffset(-3),
      views: 96,
      reply: null,
    },
    {
      id: 5,
      category: "예약문의",
      title: "3인 예약 시 추가 침구 문의드립니다",
      author: "김서연",
      content: "성인 3명인데 이끼방 예약 가능할까요? 추가 침구는 요청하면 넣어주시는 건가요?",
      createdAt: dayOffset(-1),
      views: 41,
      reply: {
        author: "관리자",
        content:
          "이끼방 최대 3인까지 가능합니다. 추가 1인 20,000원에 침구가 포함되어 있고, 예약 메모에 '3인'이라고만 남겨주시면 미리 세팅해 둡니다.",
        createdAt: dayOffset(-1),
      },
    },
  ];
}

function seedReservations(): Reservation[] {
  const base = (
    roomSlug: string,
    inDay: number,
    nights: number,
    name: string,
    total: number,
  ): Reservation => ({
    id: `MS${String(inDay + 40).padStart(3, "0")}${roomSlug.slice(0, 2).toUpperCase()}`,
    roomSlug,
    checkIn: dayOffset(inDay),
    checkOut: dayOffset(inDay + nights),
    guests: 2,
    name,
    phone: "010-****-**" + String(10 + inDay).slice(-2),
    total,
    nights,
    status: "확정",
    createdAt: dayOffset(-7),
  });

  return [
    base("moss", 1, 1, "김*은", 150000),
    base("star", 1, 2, "이*호", 330000),
    base("pine", 2, 1, "최*림", 190000),
    base("mist", 3, 1, "한*영", 160000),
    base("moon", 5, 2, "오*수", 340000),
    base("fern", 6, 1, "장*미", 180000),
    base("star", 8, 1, "윤*재", 195000),
  ];
}

export function getPosts(): Post[] {
  return read<Post>(POSTS_FILE, seedPosts);
}

export function getPost(id: number): Post | undefined {
  return getPosts().find((p) => p.id === id);
}

export function addPost(input: {
  category: Post["category"];
  title: string;
  author: string;
  content: string;
}): Post {
  const posts = getPosts();
  const post: Post = {
    id: posts.reduce((m, p) => Math.max(m, p.id), 0) + 1,
    category: input.category,
    title: input.title,
    author: input.author,
    content: input.content,
    createdAt: new Date().toISOString().slice(0, 10),
    views: 0,
    reply: null,
  };
  write(POSTS_FILE, [...posts, post]);
  return post;
}

export function bumpViews(id: number) {
  const posts = getPosts();
  const next = posts.map((p) => (p.id === id ? { ...p, views: p.views + 1 } : p));
  write(POSTS_FILE, next);
}

export function getReservations(): Reservation[] {
  return read<Reservation>(RESERVATIONS_FILE, seedReservations);
}

export function addReservation(r: Omit<Reservation, "id" | "createdAt" | "status">): Reservation {
  const list = getReservations();
  const seq = String(list.length + 1).padStart(3, "0");
  const reservation: Reservation = {
    ...r,
    id: `MS${new Date().getFullYear().toString().slice(2)}${seq}`,
    status: "대기",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  write(RESERVATIONS_FILE, [...list, reservation]);
  return reservation;
}

/** 두 기간이 겹치는지 (체크아웃일은 겹침으로 보지 않음) */
export function overlaps(aIn: string, aOut: string, bIn: string, bOut: string) {
  return aIn < bOut && bIn < aOut;
}

export function bookedRoomSlugs(checkIn: string, checkOut: string): string[] {
  return getReservations()
    .filter((r) => r.status !== "취소" && overlaps(checkIn, checkOut, r.checkIn, r.checkOut))
    .map((r) => r.roomSlug);
}

export function bookedDatesByRoom(): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const r of getReservations()) {
    if (r.status === "취소") continue;
    const cur = new Date(r.checkIn + "T12:00:00");
    const end = new Date(r.checkOut + "T12:00:00");
    while (cur < end) {
      const key = cur.toISOString().slice(0, 10);
      (map[r.roomSlug] ??= []).push(key);
      cur.setDate(cur.getDate() + 1);
    }
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* 회원 / 세션 (DB 미사용 시 폴백)                                              */
/* -------------------------------------------------------------------------- */

type StoredUser = UserRecord;

export function getUsers(): StoredUser[] {
  return read<StoredUser>(USERS_FILE, () => []);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const target = email.trim().toLowerCase();
  return getUsers().find((u) => u.email.toLowerCase() === target);
}

export function findUserById(id: number): StoredUser | undefined {
  return getUsers().find((u) => u.id === id);
}

export function addUser(input: {
  email: string;
  passwordHash: string;
  name: string;
  phone: string | null;
}): StoredUser {
  const users = getUsers();
  const user: StoredUser = {
    id: users.reduce((m, u) => Math.max(m, u.id), 0) + 1,
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    name: input.name,
    phone: input.phone,
    role: "member",
    status: "active",
  };
  write(USERS_FILE, [...users, user]);
  return user;
}

export function getSessions(): StoredSession[] {
  return read<StoredSession>(SESSIONS_FILE, () => []);
}

export function addSession(session: StoredSession) {
  const alive = getSessions().filter((s) => s.expiresAt > new Date().toISOString());
  write(SESSIONS_FILE, [...alive, session]);
}

export function findSession(tokenHash: string): StoredSession | undefined {
  return getSessions().find(
    (s) => s.tokenHash === tokenHash && s.expiresAt > new Date().toISOString(),
  );
}

export function removeSession(tokenHash: string) {
  write(
    SESSIONS_FILE,
    getSessions().filter((s) => s.tokenHash !== tokenHash),
  );
}

export function reservationsByUser(userId: number): Reservation[] {
  return getReservations().filter((r) => r.userId === userId);
}
