-- =============================================================================
-- 마음속 쉼터 (가평 숲속 펜션) - PostgreSQL 스키마
-- PostgreSQL 14+ 기준 / 인코딩 UTF8
--
-- 실행:  psql -U postgres -d maeumsok -f db/schema.sql
-- 초기화: psql -U postgres -d maeumsok -f db/seed.sql
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;    -- gen_random_uuid(), crypt()
CREATE EXTENSION IF NOT EXISTS citext;      -- 대소문자 구분 없는 이메일 컬럼
CREATE EXTENSION IF NOT EXISTS btree_gist;  -- 예약 기간 중복 방지 EXCLUDE 제약

-- -----------------------------------------------------------------------------
-- 0. 공통 ENUM 타입
-- -----------------------------------------------------------------------------
CREATE TYPE user_role           AS ENUM ('member', 'staff', 'admin');
CREATE TYPE user_status         AS ENUM ('active', 'dormant', 'suspended', 'withdrawn');
CREATE TYPE social_provider     AS ENUM ('kakao', 'naver', 'google', 'apple');
CREATE TYPE token_purpose       AS ENUM ('email_verify', 'password_reset', 'phone_verify');
CREATE TYPE reservation_status  AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status      AS ENUM ('unpaid', 'deposit_paid', 'paid', 'refunded', 'partial_refunded');
CREATE TYPE payment_method      AS ENUM ('bank_transfer', 'card', 'kakao_pay', 'naver_pay', 'onsite');
CREATE TYPE day_type            AS ENUM ('weekday', 'friday', 'saturday', 'sunday', 'peak');
CREATE TYPE post_status         AS ENUM ('published', 'hidden', 'deleted');

-- updated_at 자동 갱신 트리거 함수
CREATE OR REPLACE FUNCTION fn_set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. 회원 / 인증
-- =============================================================================

-- 회원. 비회원 예약도 허용하므로 예약 테이블은 user_id를 NULL 허용한다.
CREATE TABLE users (
  id                BIGSERIAL PRIMARY KEY,
  uuid              UUID        NOT NULL DEFAULT gen_random_uuid(),  -- 외부 노출용 식별자
  email             CITEXT,                                          -- 소셜 전용 계정은 NULL 가능
  password_hash     TEXT,                                            -- bcrypt/argon2. 소셜 전용은 NULL
  name              VARCHAR(50)  NOT NULL,
  nickname          VARCHAR(30),
  phone             VARCHAR(20),
  birth_date        DATE,
  role              user_role    NOT NULL DEFAULT 'member',
  status            user_status  NOT NULL DEFAULT 'active',
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  marketing_opt_in  BOOLEAN      NOT NULL DEFAULT false,
  login_fail_count  SMALLINT     NOT NULL DEFAULT 0,
  last_login_at     TIMESTAMPTZ,
  memo              TEXT,                                            -- 관리자 메모
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  withdrawn_at      TIMESTAMPTZ,
  CONSTRAINT users_uuid_key  UNIQUE (uuid),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_login_method_chk
    CHECK (password_hash IS NOT NULL OR email IS NULL OR status = 'withdrawn')
);
COMMENT ON TABLE  users IS '회원 계정. 비회원 예약은 reservations.guest_* 컬럼 사용';
COMMENT ON COLUMN users.uuid IS 'URL/토큰에 노출하는 식별자 (연속 정수 노출 방지)';

CREATE INDEX idx_users_phone      ON users (phone);
CREATE INDEX idx_users_status     ON users (status) WHERE status <> 'active';
CREATE INDEX idx_users_created_at ON users (created_at DESC);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 약관 마스터 (버전 관리)
CREATE TABLE terms (
  id           SERIAL PRIMARY KEY,
  code         VARCHAR(40)  NOT NULL,          -- service, privacy, marketing, third_party
  version      VARCHAR(20)  NOT NULL,          -- 1.0, 1.1 ...
  title        VARCHAR(120) NOT NULL,
  body         TEXT         NOT NULL,
  is_required  BOOLEAN      NOT NULL DEFAULT true,
  effective_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT terms_code_version_key UNIQUE (code, version)
);

-- 회원별 약관 동의 이력 (동의/철회 모두 기록으로 남긴다)
CREATE TABLE user_term_agreements (
  id          BIGSERIAL PRIMARY KEY,
  user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  term_id     INT         NOT NULL REFERENCES terms(id),
  agreed      BOOLEAN     NOT NULL,
  agreed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address  INET
);
CREATE INDEX idx_user_term_agreements_user ON user_term_agreements (user_id);

-- 소셜 로그인 연동
CREATE TABLE user_social_accounts (
  id           BIGSERIAL PRIMARY KEY,
  user_id      BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider     social_provider NOT NULL,
  provider_uid VARCHAR(191)    NOT NULL,
  email        CITEXT,
  linked_at    TIMESTAMPTZ     NOT NULL DEFAULT now(),
  CONSTRAINT user_social_provider_uid_key UNIQUE (provider, provider_uid)
);
CREATE INDEX idx_user_social_user ON user_social_accounts (user_id);

-- 로그인 세션 (JWT를 쓰더라도 refresh 토큰 회전 관리용으로 유지)
CREATE TABLE sessions (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT        NOT NULL,
  user_agent   TEXT,
  ip_address   INET,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT sessions_token_hash_key UNIQUE (token_hash)
);
CREATE INDEX idx_sessions_user    ON sessions (user_id);
CREATE INDEX idx_sessions_expires ON sessions (expires_at);

-- 이메일 인증 / 비밀번호 재설정 등 1회용 토큰
CREATE TABLE user_tokens (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    token_purpose NOT NULL,
  token_hash TEXT          NOT NULL,
  expires_at TIMESTAMPTZ   NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT user_tokens_hash_key UNIQUE (token_hash)
);
CREATE INDEX idx_user_tokens_user ON user_tokens (user_id, purpose);

-- =============================================================================
-- 2. 건물 / 객실 / 요금
-- =============================================================================

-- 동(棟). 현재 3개 동(숲채/바람채/달빛채), 동별 2실.
CREATE TABLE buildings (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(5)   NOT NULL,        -- A, B, C
  name        VARCHAR(40)  NOT NULL,        -- 숲채
  description TEXT,
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT buildings_code_key UNIQUE (code)
);

-- 객실 6실. 전부 10평(33㎡) 원룸형.
CREATE TABLE rooms (
  id                 SERIAL PRIMARY KEY,
  building_id        INT          NOT NULL REFERENCES buildings(id) ON DELETE RESTRICT,
  slug               VARCHAR(40)  NOT NULL,       -- moss, fern, pine ... (URL용)
  name               VARCHAR(40)  NOT NULL,       -- 이끼방
  floor              SMALLINT     NOT NULL DEFAULT 1,
  size_pyeong        NUMERIC(4,1) NOT NULL DEFAULT 10.0,
  size_m2            NUMERIC(5,1) NOT NULL DEFAULT 33.0,
  standard_capacity  SMALLINT     NOT NULL DEFAULT 2,
  max_capacity       SMALLINT     NOT NULL DEFAULT 3,
  bed_info           VARCHAR(80),
  view_info          VARCHAR(80),
  concept            VARCHAR(120),
  description        TEXT,
  price_weekday      INT          NOT NULL,       -- 월~목
  price_friday       INT          NOT NULL,       -- 금·일
  price_saturday     INT          NOT NULL,       -- 토
  price_peak         INT          NOT NULL,       -- 성수기(7~8월, 1월)
  extra_person_fee   INT          NOT NULL DEFAULT 20000,
  is_active          BOOLEAN      NOT NULL DEFAULT true,
  sort_order         SMALLINT     NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT rooms_slug_key UNIQUE (slug),
  CONSTRAINT rooms_building_floor_key UNIQUE (building_id, floor),  -- 동별 층당 1실 = 동별 2실
  CONSTRAINT rooms_capacity_chk CHECK (max_capacity >= standard_capacity AND standard_capacity > 0),
  CONSTRAINT rooms_price_chk    CHECK (price_weekday > 0 AND price_friday > 0
                                       AND price_saturday > 0 AND price_peak > 0)
);
COMMENT ON CONSTRAINT rooms_building_floor_key ON rooms IS '한 동에 1층/2층 각 1실 구조를 스키마로 고정';
CREATE INDEX idx_rooms_building ON rooms (building_id);
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 편의시설 마스터 + 객실 매핑
CREATE TABLE amenities (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(40) NOT NULL,
  icon       VARCHAR(30),
  sort_order SMALLINT    NOT NULL DEFAULT 0,
  CONSTRAINT amenities_name_key UNIQUE (name)
);

CREATE TABLE room_amenities (
  room_id    INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  amenity_id INT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, amenity_id)
);

-- 객실 사진
CREATE TABLE room_images (
  id         BIGSERIAL PRIMARY KEY,
  room_id    INT          NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  url        TEXT         NOT NULL,
  alt        VARCHAR(120),
  is_cover   BOOLEAN      NOT NULL DEFAULT false,
  sort_order SMALLINT     NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_room_images_room ON room_images (room_id, sort_order);
-- 객실당 커버 이미지는 1장만
CREATE UNIQUE INDEX uq_room_images_cover ON room_images (room_id) WHERE is_cover;

-- 성수기/특정일 요금 및 판매중지 관리 (일자별 캘린더)
-- 값이 없는 날짜는 rooms의 요일별 기본 요금을 적용한다.
CREATE TABLE room_rates (
  id         BIGSERIAL PRIMARY KEY,
  room_id    INT         NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  stay_date  DATE        NOT NULL,
  price      INT,                                   -- NULL이면 기본 요금 사용
  min_nights SMALLINT    NOT NULL DEFAULT 1,
  is_closed  BOOLEAN     NOT NULL DEFAULT false,    -- 청소/공사 등으로 판매 중지
  note       VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT room_rates_room_date_key UNIQUE (room_id, stay_date),
  CONSTRAINT room_rates_price_chk CHECK (price IS NULL OR price >= 0)
);
CREATE INDEX idx_room_rates_date ON room_rates (stay_date);

-- 유료 부가 옵션 (바비큐, 장작 등)
CREATE TABLE options (
  id         SERIAL PRIMARY KEY,
  code       VARCHAR(30)  NOT NULL,
  name       VARCHAR(60)  NOT NULL,
  price      INT          NOT NULL,
  unit       VARCHAR(20)  NOT NULL DEFAULT '건',
  note       VARCHAR(120),
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  sort_order SMALLINT     NOT NULL DEFAULT 0,
  CONSTRAINT options_code_key UNIQUE (code)
);

-- 부대시설 소개 (사이트 노출용 콘텐츠)
CREATE TABLE facilities (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  icon       VARCHAR(30),
  summary    VARCHAR(120),
  detail     TEXT,
  open_hours VARCHAR(60),
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  sort_order SMALLINT     NOT NULL DEFAULT 0
);

-- =============================================================================
-- 3. 예약 / 결제
-- =============================================================================

CREATE TABLE reservations (
  id                  BIGSERIAL PRIMARY KEY,
  code                VARCHAR(20)        NOT NULL,             -- 예약번호 MS26001
  user_id             BIGINT             REFERENCES users(id) ON DELETE SET NULL,
  room_id             INT                NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  check_in            DATE               NOT NULL,
  check_out           DATE               NOT NULL,
  nights              INT GENERATED ALWAYS AS (check_out - check_in) STORED,
  stay_period         DATERANGE GENERATED ALWAYS AS (daterange(check_in, check_out, '[)')) STORED,
  adults              SMALLINT           NOT NULL DEFAULT 2,
  children            SMALLINT           NOT NULL DEFAULT 0,
  guest_name          VARCHAR(50)        NOT NULL,             -- 비회원 예약 대비 스냅샷
  guest_phone         VARCHAR(20)        NOT NULL,
  guest_email         CITEXT,
  memo                TEXT,                                    -- 고객 요청사항
  room_amount         INT                NOT NULL DEFAULT 0,   -- 객실료 합계
  extra_person_amount INT                NOT NULL DEFAULT 0,
  option_amount       INT                NOT NULL DEFAULT 0,
  total_amount        INT                NOT NULL DEFAULT 0,
  deposit_amount      INT                NOT NULL DEFAULT 0,   -- 예약금(기본 30%)
  status              reservation_status NOT NULL DEFAULT 'pending',
  payment_status      payment_status     NOT NULL DEFAULT 'unpaid',
  source              VARCHAR(20)        NOT NULL DEFAULT 'web', -- web, phone, naver, yanolja
  cancelled_at        TIMESTAMPTZ,
  cancel_reason       TEXT,
  created_at          TIMESTAMPTZ        NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ        NOT NULL DEFAULT now(),
  CONSTRAINT reservations_code_key   UNIQUE (code),
  CONSTRAINT reservations_dates_chk  CHECK (check_out > check_in),
  CONSTRAINT reservations_guests_chk CHECK (adults >= 1 AND children >= 0 AND adults + children <= 6),
  CONSTRAINT reservations_amount_chk CHECK (total_amount >= 0 AND deposit_amount >= 0),
  -- 핵심: 같은 객실의 유효 예약 기간이 겹치면 INSERT 자체가 실패한다 (더블부킹 원천 차단)
  CONSTRAINT reservations_no_overlap EXCLUDE USING gist (
    room_id WITH =,
    stay_period WITH &&
  ) WHERE (status IN ('pending', 'confirmed', 'completed'))
);
COMMENT ON CONSTRAINT reservations_no_overlap ON reservations IS
  '동일 객실 기간 중복 예약 차단. 체크아웃일=다음 손님 체크인일은 허용(반열린 구간)';

CREATE INDEX idx_reservations_room_dates ON reservations (room_id, check_in, check_out);
CREATE INDEX idx_reservations_user       ON reservations (user_id);
CREATE INDEX idx_reservations_status     ON reservations (status, check_in);
CREATE INDEX idx_reservations_phone      ON reservations (guest_phone);
CREATE INDEX idx_reservations_period     ON reservations USING gist (stay_period);
CREATE TRIGGER trg_reservations_updated BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 예약별 일자 요금 내역 (요금 변동 후에도 당시 금액이 남는다)
CREATE TABLE reservation_nights (
  reservation_id BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  stay_date      DATE   NOT NULL,
  day_type       day_type NOT NULL,
  price          INT    NOT NULL,
  PRIMARY KEY (reservation_id, stay_date)
);

-- 예약별 선택 옵션
CREATE TABLE reservation_options (
  id             BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT   NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  option_id      INT      NOT NULL REFERENCES options(id) ON DELETE RESTRICT,
  quantity       SMALLINT NOT NULL DEFAULT 1,
  unit_price     INT      NOT NULL,
  amount         INT      NOT NULL,
  CONSTRAINT reservation_options_qty_chk CHECK (quantity > 0)
);
CREATE INDEX idx_reservation_options_res ON reservation_options (reservation_id);

-- 결제/환불 이력
CREATE TABLE payments (
  id             BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT         NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  method         payment_method NOT NULL,
  amount         INT            NOT NULL,
  is_refund      BOOLEAN        NOT NULL DEFAULT false,
  pg_provider    VARCHAR(30),
  pg_tid         VARCHAR(100),
  depositor_name VARCHAR(50),                    -- 무통장 입금자명
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ    NOT NULL DEFAULT now(),
  CONSTRAINT payments_amount_chk CHECK (amount > 0)
);
CREATE INDEX idx_payments_reservation ON payments (reservation_id);
CREATE UNIQUE INDEX uq_payments_pg_tid ON payments (pg_tid) WHERE pg_tid IS NOT NULL;

-- 예약 상태 변경 이력 (누가/언제/왜 바꿨는지)
CREATE TABLE reservation_logs (
  id             BIGSERIAL PRIMARY KEY,
  reservation_id BIGINT      NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  from_status    reservation_status,
  to_status      reservation_status NOT NULL,
  changed_by     BIGINT      REFERENCES users(id) ON DELETE SET NULL,
  reason         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reservation_logs_res ON reservation_logs (reservation_id, created_at);

-- 예약 상태가 바뀌면 이력을 자동 기록
CREATE OR REPLACE FUNCTION fn_log_reservation_status() RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO reservation_logs (reservation_id, from_status, to_status)
    VALUES (NEW.id, NULL, NEW.status);
  ELSIF (NEW.status IS DISTINCT FROM OLD.status) THEN
    INSERT INTO reservation_logs (reservation_id, from_status, to_status, reason)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.cancel_reason);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_reservations_status_log
  AFTER INSERT OR UPDATE OF status ON reservations
  FOR EACH ROW EXECUTE FUNCTION fn_log_reservation_status();

-- =============================================================================
-- 4. 게시판
-- =============================================================================

CREATE TABLE board_categories (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(30)  NOT NULL,       -- notice, inquiry, review
  name        VARCHAR(30)  NOT NULL,       -- 공지, 예약문의, 이용후기
  description VARCHAR(120),
  admin_only  BOOLEAN      NOT NULL DEFAULT false,  -- 관리자만 작성 가능(공지)
  allow_guest BOOLEAN      NOT NULL DEFAULT true,   -- 비회원 작성 허용
  use_rating  BOOLEAN      NOT NULL DEFAULT false,  -- 별점 사용(후기)
  sort_order  SMALLINT     NOT NULL DEFAULT 0,
  CONSTRAINT board_categories_slug_key UNIQUE (slug)
);

CREATE TABLE posts (
  id             BIGSERIAL PRIMARY KEY,
  category_id    INT         NOT NULL REFERENCES board_categories(id) ON DELETE RESTRICT,
  user_id        BIGINT      REFERENCES users(id) ON DELETE SET NULL,  -- 비회원이면 NULL
  reservation_id BIGINT      REFERENCES reservations(id) ON DELETE SET NULL, -- 실제 투숙 인증 후기
  author_name    VARCHAR(50) NOT NULL,
  author_ip      INET,
  guest_password TEXT,                                 -- 비회원 글 수정/삭제용 해시
  title          VARCHAR(200) NOT NULL,
  content        TEXT         NOT NULL,
  rating         SMALLINT,                             -- 후기 별점 1~5
  views          INT          NOT NULL DEFAULT 0,
  is_pinned      BOOLEAN      NOT NULL DEFAULT false,
  is_secret      BOOLEAN      NOT NULL DEFAULT false,  -- 비밀글(문의)
  status         post_status  NOT NULL DEFAULT 'published',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ,
  CONSTRAINT posts_rating_chk CHECK (rating IS NULL OR rating BETWEEN 1 AND 5),
  CONSTRAINT posts_author_chk CHECK (user_id IS NOT NULL OR guest_password IS NOT NULL)
);
CREATE INDEX idx_posts_category ON posts (category_id, is_pinned DESC, created_at DESC);
CREATE INDEX idx_posts_user     ON posts (user_id);
CREATE INDEX idx_posts_status    ON posts (status) WHERE status <> 'published';
-- 제목/본문 통합 검색 (한국어는 simple 설정으로 충분히 동작)
CREATE INDEX idx_posts_search ON posts
  USING gin (to_tsvector('simple', title || ' ' || content));
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 댓글 / 관리자 답변 (parent_id로 1단 대댓글까지)
CREATE TABLE post_comments (
  id             BIGSERIAL PRIMARY KEY,
  post_id        BIGINT      NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id      BIGINT      REFERENCES post_comments(id) ON DELETE CASCADE,
  user_id        BIGINT      REFERENCES users(id) ON DELETE SET NULL,
  author_name    VARCHAR(50) NOT NULL,
  guest_password TEXT,
  content        TEXT        NOT NULL,
  is_admin_reply BOOLEAN     NOT NULL DEFAULT false,
  status         post_status NOT NULL DEFAULT 'published',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_post_comments_post ON post_comments (post_id, created_at);
CREATE TRIGGER trg_post_comments_updated BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- 첨부파일
CREATE TABLE post_attachments (
  id            BIGSERIAL PRIMARY KEY,
  post_id       BIGINT       NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_name     VARCHAR(255) NOT NULL,
  file_path     TEXT         NOT NULL,
  file_size     INT          NOT NULL,
  mime_type     VARCHAR(100),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_post_attachments_post ON post_attachments (post_id);

-- =============================================================================
-- 5. 운영 보조
-- =============================================================================

-- 사이트 기본 정보 (펜션명, 연락처, 계좌, 체크인 시간 등)
CREATE TABLE site_settings (
  key        VARCHAR(60) PRIMARY KEY,
  value      TEXT        NOT NULL,
  label      VARCHAR(80),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 관리자 활동 로그
CREATE TABLE admin_logs (
  id          BIGSERIAL PRIMARY KEY,
  admin_id    BIGINT      REFERENCES users(id) ON DELETE SET NULL,
  action      VARCHAR(60) NOT NULL,      -- reservation.confirm, post.delete ...
  target_type VARCHAR(40),
  target_id   BIGINT,
  detail      JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_logs_created ON admin_logs (created_at DESC);

-- =============================================================================
-- 6. 조회 편의용 뷰 / 함수
-- =============================================================================

-- 일자별 객실 상태 (오늘부터 90일)
CREATE OR REPLACE VIEW v_room_calendar AS
SELECT
  r.id                                        AS room_id,
  r.slug,
  r.name                                      AS room_name,
  d.stay_date::date                            AS stay_date,
  COALESCE(rr.is_closed, false)                AS is_closed,
  (res.id IS NOT NULL)                         AS is_booked,
  COALESCE(
    rr.price,
    CASE
      WHEN EXTRACT(MONTH FROM d.stay_date) IN (1, 7, 8) THEN r.price_peak
      WHEN EXTRACT(DOW  FROM d.stay_date) = 6            THEN r.price_saturday
      WHEN EXTRACT(DOW  FROM d.stay_date) IN (0, 5)      THEN r.price_friday
      ELSE r.price_weekday
    END
  )                                            AS price
FROM rooms r
CROSS JOIN generate_series(CURRENT_DATE, CURRENT_DATE + INTERVAL '90 days', INTERVAL '1 day') AS d(stay_date)
LEFT JOIN room_rates rr
       ON rr.room_id = r.id AND rr.stay_date = d.stay_date::date
LEFT JOIN reservations res
       ON res.room_id = r.id
      AND res.status IN ('pending', 'confirmed', 'completed')
      AND res.stay_period @> d.stay_date::date
WHERE r.is_active;

-- 특정 기간에 예약 가능한 객실 목록 + 기간 총액
CREATE OR REPLACE FUNCTION fn_available_rooms(p_check_in DATE, p_check_out DATE)
RETURNS TABLE (room_id INT, slug VARCHAR, room_name VARCHAR, nights INT, total_price BIGINT) AS $$
  SELECT
    r.id,
    r.slug,
    r.name,
    (p_check_out - p_check_in) AS nights,
    SUM(c.price)               AS total_price
  FROM rooms r
  JOIN v_room_calendar c ON c.room_id = r.id
  WHERE r.is_active
    AND c.stay_date >= p_check_in
    AND c.stay_date <  p_check_out
  GROUP BY r.id, r.slug, r.name
  HAVING bool_and(NOT c.is_booked AND NOT c.is_closed)
  ORDER BY r.sort_order;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION fn_available_rooms IS '실시간 예약 화면에서 사용. 체크아웃일은 계산에서 제외';

-- 게시판 목록용 뷰 (댓글 수 포함)
CREATE OR REPLACE VIEW v_board_list AS
SELECT
  p.id,
  bc.slug        AS category_slug,
  bc.name        AS category_name,
  p.title,
  p.author_name,
  p.rating,
  p.views,
  p.is_pinned,
  p.is_secret,
  p.created_at,
  (SELECT count(*) FROM post_comments c
    WHERE c.post_id = p.id AND c.status = 'published') AS comment_count
FROM posts p
JOIN board_categories bc ON bc.id = p.category_id
WHERE p.status = 'published'
ORDER BY p.is_pinned DESC, p.created_at DESC;

COMMIT;
