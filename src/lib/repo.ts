import { hasDb, query, withTransaction } from "./db";
import * as file from "./store";
import type { Post, Reservation, SessionUser, StoredSession, UserRecord } from "./types";

/**
 * 데이터 접근 계층.
 * DATABASE_URL 이 있으면 PostgreSQL(db/schema.sql) 을 쓰고,
 * 없으면 data/*.json 파일 저장소로 폴백한다. 화면 코드는 이 파일만 호출한다.
 */

type PostRow = {
  id: number;
  category: Post["category"];
  title: string;
  author: string;
  content: string;
  created_at: string;
  views: number;
  pinned: boolean;
  reply: Post["reply"];
};

const POST_SELECT = `
  SELECT p.id,
         bc.name                                   AS category,
         p.title,
         p.author_name                             AS author,
         p.content,
         to_char(p.created_at, 'YYYY-MM-DD')       AS created_at,
         p.views,
         p.is_pinned                               AS pinned,
         (SELECT json_build_object(
                   'author',    c.author_name,
                   'content',   c.content,
                   'createdAt', to_char(c.created_at, 'YYYY-MM-DD'))
            FROM post_comments c
           WHERE c.post_id = p.id AND c.status = 'published'
           ORDER BY c.created_at
           LIMIT 1)                                AS reply
    FROM posts p
    JOIN board_categories bc ON bc.id = p.category_id
   WHERE p.status = 'published'
`;

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    author: row.author,
    content: row.content,
    createdAt: row.created_at,
    views: row.views,
    pinned: row.pinned,
    reply: row.reply ?? null,
  };
}

export async function getPosts(): Promise<Post[]> {
  if (!hasDb()) return file.getPosts();
  const rows = await query<PostRow>(
    `${POST_SELECT} ORDER BY p.is_pinned DESC, p.created_at DESC, p.id DESC`,
  );
  return rows.map(toPost);
}

export async function getPost(id: number): Promise<Post | undefined> {
  if (!hasDb()) return file.getPost(id);
  const rows = await query<PostRow>(`${POST_SELECT} AND p.id = $1`, [id]);
  return rows[0] ? toPost(rows[0]) : undefined;
}

export async function createPost(input: {
  category: Post["category"];
  title: string;
  author: string;
  content: string;
  password?: string;
}): Promise<Post> {
  if (!hasDb()) return file.addPost(input);
  const rows = await query<{ id: number }>(
    `INSERT INTO posts (category_id, author_name, guest_password, title, content)
     VALUES ((SELECT id FROM board_categories WHERE name = $1),
             $2,
             crypt($3, gen_salt('bf', 10)),
             $4, $5)
     RETURNING id`,
    [input.category, input.author, input.password ?? "0000", input.title, input.content],
  );
  const created = await getPost(rows[0].id);
  if (!created) throw new Error("게시글 저장에 실패했습니다.");
  return created;
}

export async function bumpViews(id: number): Promise<void> {
  if (!hasDb()) return file.bumpViews(id);
  await query(`UPDATE posts SET views = views + 1 WHERE id = $1`, [id]);
}

/* -------------------------------------------------------------------------- */
/* 예약                                                                        */
/* -------------------------------------------------------------------------- */

type ReservationRow = {
  id: string;
  room_slug: string;
  check_in: string;
  check_out: string;
  guests: number;
  name: string;
  phone: string;
  memo: string | null;
  total: number;
  nights: number;
  status: Reservation["status"];
  created_at: string;
};

const STATUS_KO: Record<string, Reservation["status"]> = {
  pending: "대기",
  confirmed: "확정",
  completed: "확정",
  cancelled: "취소",
  no_show: "취소",
};

export async function getReservations(): Promise<Reservation[]> {
  if (!hasDb()) return file.getReservations();
  const rows = await query<ReservationRow>(
    `SELECT r.code                              AS id,
            ro.slug                             AS room_slug,
            to_char(r.check_in,  'YYYY-MM-DD')  AS check_in,
            to_char(r.check_out, 'YYYY-MM-DD')  AS check_out,
            (r.adults + r.children)             AS guests,
            r.guest_name                        AS name,
            r.guest_phone                       AS phone,
            r.memo,
            r.total_amount                      AS total,
            r.nights,
            r.status::text                      AS status,
            to_char(r.created_at, 'YYYY-MM-DD') AS created_at
       FROM reservations r
       JOIN rooms ro ON ro.id = r.room_id
      ORDER BY r.check_in`,
  );
  return rows.map((r) => ({
    id: r.id,
    roomSlug: r.room_slug,
    checkIn: r.check_in,
    checkOut: r.check_out,
    guests: r.guests,
    name: r.name,
    phone: r.phone,
    memo: r.memo ?? undefined,
    total: r.total,
    nights: r.nights,
    status: STATUS_KO[r.status] ?? "대기",
    createdAt: r.created_at,
  }));
}

/** 해당 기간에 이미 예약된 객실 slug 목록 */
export async function getBookedRoomSlugs(checkIn: string, checkOut: string): Promise<string[]> {
  if (!hasDb()) return file.bookedRoomSlugs(checkIn, checkOut);
  const rows = await query<{ slug: string }>(
    `SELECT DISTINCT ro.slug
       FROM reservations r
       JOIN rooms ro ON ro.id = r.room_id
      WHERE r.status IN ('pending', 'confirmed', 'completed')
        AND r.stay_period && daterange($1::date, $2::date, '[)')`,
    [checkIn, checkOut],
  );
  return rows.map((r) => r.slug);
}

/** 객실 slug -> 예약된 날짜 배열 (캘린더 표시용) */
export async function getBookedDatesByRoom(): Promise<Record<string, string[]>> {
  if (!hasDb()) return file.bookedDatesByRoom();
  const rows = await query<{ slug: string; stay_date: string }>(
    `SELECT ro.slug, to_char(d.day, 'YYYY-MM-DD') AS stay_date
       FROM reservations r
       JOIN rooms ro ON ro.id = r.room_id
       CROSS JOIN generate_series(r.check_in, r.check_out - 1, INTERVAL '1 day') AS d(day)
      WHERE r.status IN ('pending', 'confirmed', 'completed')`,
  );
  const map: Record<string, string[]> = {};
  for (const row of rows) (map[row.slug] ??= []).push(row.stay_date);
  return map;
}

export async function createReservation(input: {
  roomSlug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  name: string;
  phone: string;
  memo?: string;
  total: number;
  nights: number;
  userId?: number | null;
}): Promise<Reservation> {
  if (!hasDb()) {
    return file.addReservation(input);
  }

  return withTransaction(async (client) => {
    const code = await client.query<{ code: string }>(
      `SELECT 'MS' || to_char(now(), 'YY') ||
              lpad((count(*) + 1)::text, 3, '0') AS code
         FROM reservations
        WHERE created_at >= date_trunc('year', now())`,
    );

    const inserted = await client.query<{ code: string; nights: number }>(
      `INSERT INTO reservations
         (code, room_id, check_in, check_out, adults, guest_name, guest_phone, memo,
          room_amount, total_amount, deposit_amount, status, source, user_id)
       VALUES ($1,
               (SELECT id FROM rooms WHERE slug = $2),
               $3::date, $4::date, $5, $6, $7, $8,
               $9, $9, round($9 * 0.3), 'pending', 'web', $10)
       RETURNING code, nights`,
      [
        code.rows[0].code,
        input.roomSlug,
        input.checkIn,
        input.checkOut,
        input.guests,
        input.name,
        input.phone,
        input.memo ?? null,
        input.total,
        input.userId ?? null,
      ],
    );

    return {
      id: inserted.rows[0].code,
      roomSlug: input.roomSlug,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      name: input.name,
      phone: input.phone,
      memo: input.memo,
      total: input.total,
      nights: inserted.rows[0].nights,
      status: "대기",
      createdAt: new Date().toISOString().slice(0, 10),
      userId: input.userId ?? null,
    } satisfies Reservation;
  });
}

/* -------------------------------------------------------------------------- */
/* 회원 / 세션                                                                 */
/* -------------------------------------------------------------------------- */

type UserRow = {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  role: UserRecord["role"];
  status: UserRecord["status"];
  password_hash: string | null;
};

function toUserRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    phone: row.phone,
    role: row.role,
    status: row.status,
    passwordHash: row.password_hash ?? "",
  };
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  if (!hasDb()) return file.findUserByEmail(email);
  const rows = await query<UserRow>(
    `SELECT id, email::text AS email, name, phone, role, status, password_hash
       FROM users WHERE email = $1`,
    [email.trim()],
  );
  return rows[0] ? toUserRecord(rows[0]) : undefined;
}

/** 이미 가입된 이메일이면 null 을 돌려준다 */
export async function createUser(input: {
  email: string;
  passwordHash: string;
  name: string;
  phone: string | null;
  marketingOptIn: boolean;
}): Promise<SessionUser | null> {
  if (!hasDb()) {
    if (file.findUserByEmail(input.email)) return null;
    const created = file.addUser(input);
    return {
      id: created.id,
      email: created.email,
      name: created.name,
      phone: created.phone,
      role: created.role,
    };
  }

  try {
    return await withTransaction(async (client) => {
      const inserted = await client.query<UserRow>(
        `INSERT INTO users (email, password_hash, name, phone, marketing_opt_in)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email::text AS email, name, phone, role, status, password_hash`,
        [input.email.trim(), input.passwordHash, input.name, input.phone, input.marketingOptIn],
      );
      const user = inserted.rows[0];

      // 필수 약관은 동의, 마케팅은 선택값으로 최신 버전 기준 이력을 남긴다
      await client.query(
        `INSERT INTO user_term_agreements (user_id, term_id, agreed)
         SELECT $1, t.id, CASE WHEN t.code = 'marketing' THEN $2 ELSE true END
           FROM terms t
           JOIN (SELECT code, max(effective_at) AS latest FROM terms GROUP BY code) m
             ON m.code = t.code AND m.latest = t.effective_at`,
        [user.id, input.marketingOptIn],
      );

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
      } satisfies SessionUser;
    });
  } catch (e) {
    // users_email_key 중복
    if (typeof e === "object" && e !== null && (e as { code?: string }).code === "23505") {
      return null;
    }
    throw e;
  }
}

export async function saveSession(session: StoredSession, meta?: { userAgent?: string }) {
  if (!hasDb()) return file.addSession(session);
  await query(
    `INSERT INTO sessions (user_id, token_hash, expires_at, user_agent)
     VALUES ($1, $2, $3::timestamptz, $4)`,
    [session.userId, session.tokenHash, session.expiresAt, meta?.userAgent ?? null],
  );
}

export async function findSessionUser(tokenHash: string): Promise<SessionUser | undefined> {
  if (!hasDb()) {
    const session = file.findSession(tokenHash);
    if (!session) return undefined;
    const user = file.findUserById(session.userId);
    if (!user || user.status !== "active") return undefined;
    return { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
  }
  const rows = await query<UserRow>(
    `SELECT u.id, u.email::text AS email, u.name, u.phone, u.role, u.status, u.password_hash
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > now()
        AND u.status = 'active'`,
    [tokenHash],
  );
  const row = rows[0];
  return row
    ? { id: row.id, email: row.email, name: row.name, phone: row.phone, role: row.role }
    : undefined;
}

export async function revokeSession(tokenHash: string) {
  if (!hasDb()) return file.removeSession(tokenHash);
  await query(`UPDATE sessions SET revoked_at = now() WHERE token_hash = $1`, [tokenHash]);
}

export async function touchLastLogin(userId: number) {
  if (!hasDb()) return;
  await query(`UPDATE users SET last_login_at = now(), login_fail_count = 0 WHERE id = $1`, [
    userId,
  ]);
}

/** 마이페이지 - 내 예약 목록 */
export async function getUserReservations(userId: number): Promise<Reservation[]> {
  if (!hasDb()) return file.reservationsByUser(userId);
  const rows = await query<ReservationRow>(
    `SELECT r.code                              AS id,
            ro.slug                             AS room_slug,
            to_char(r.check_in,  'YYYY-MM-DD')  AS check_in,
            to_char(r.check_out, 'YYYY-MM-DD')  AS check_out,
            (r.adults + r.children)             AS guests,
            r.guest_name                        AS name,
            r.guest_phone                       AS phone,
            r.memo,
            r.total_amount                      AS total,
            r.nights,
            r.status::text                      AS status,
            to_char(r.created_at, 'YYYY-MM-DD') AS created_at
       FROM reservations r
       JOIN rooms ro ON ro.id = r.room_id
      WHERE r.user_id = $1
      ORDER BY r.check_in DESC`,
    [userId],
  );
  return rows.map((r) => ({
    id: r.id,
    roomSlug: r.room_slug,
    checkIn: r.check_in,
    checkOut: r.check_out,
    guests: r.guests,
    name: r.name,
    phone: r.phone,
    memo: r.memo ?? undefined,
    total: r.total,
    nights: r.nights,
    status: STATUS_KO[r.status] ?? "대기",
    createdAt: r.created_at,
    userId,
  }));
}
