# 마음속 쉼터 — 가평 숲속 펜션 MVP

경기도 가평 상면에 있는 펜션 **마음속 쉼터**의 웹사이트 MVP입니다.
3개 동 × 각 2실 = **6개 객실**, 전 객실 10평(33㎡) 원룸형 구성을 그대로 데이터 모델에 반영했습니다.

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4
- 데이터: **PostgreSQL** (`db/schema.sql`) — 미설정 시 `data/*.json` 파일 저장소로 자동 폴백
- 사진 없이도 완성돼 보이도록 숲 일러스트를 인라인 SVG로 직접 그렸습니다 (`src/components/ForestScene.tsx`, `RoomArt.tsx`)

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 — DB 없이 바로 동작합니다(첫 실행 시 `data/`에 샘플 데이터 자동 생성).

## 메뉴 구성

| 경로 | 메뉴 | 내용 |
| --- | --- | --- |
| `/` | **대문 페이지** | 숲의 아침 사진 + 애니메이션(느린 줌·햇살·안개·먼지·문구 순차 등장) → 들어가기 |
| `/home` | 홈 | 숲 히어로, 객실·부대시설 요약, 예약 CTA |
| `/about` | 펜션 소개 | 소개글, 3개 동 안내, 연혁, 이용 안내, 오시는 길 |
| `/rooms` | 룸 정보 | 동별 2실 그룹 목록 + 전체 요금표 |
| `/rooms/[slug]` | 객실 상세 | 객실 정보, 비품, **2주 예약 현황 캘린더**, 요금표 |
| `/reservation` | 실시간 예약하기 | 날짜·인원 선택 → 6개 방 실시간 잔여/요금 계산 → 예약 접수 |
| `/facilities` | 부대시설 | 8개 시설 상세, 운영 시간, 유료 항목 |
| `/board` | 게시판 | 말머리(공지/예약문의/이용후기) 필터, 목록·상세·글쓰기 |
| `/signup` `/login` | 회원가입 / 로그인 | 약관 동의 포함 가입, 세션 로그인 |
| `/mypage` | 마이페이지 | 회원 정보, 다가오는 예약 / 지난 예약, 로그아웃 |
| `/credits` | 사진 출처 | 사용한 사진 44장의 저작자·라이선스 목록 |

## 사진

`public/images/` 에 44장이 들어 있습니다. 실제 펜션 사진이 없으므로 **Wikimedia Commons(Quality images)와 Openverse에서 상업적 이용이 가능한 라이선스**(CC0 · Public Domain Mark · CC BY · CC BY-SA)의 사진을 받아 리사이즈해 넣었습니다. 저작자와 라이선스는 [`/credits`](src/app/credits/page.tsx) 페이지와 [src/lib/photoCredits.ts](src/lib/photoCredits.ts)에 전부 기록해 두었습니다(CC BY-SA 사진이 있어 표기가 필요합니다).

```
public/images/
  hero.jpg              대문·홈 히어로 (숲의 아침)
  page-*.jpg            페이지별 상단 배경 6장
  about-1~4.jpg         소개 페이지 사진
  rooms/{slug}-1~4.jpg  객실별 상세 사진 4장 × 6객실 (1번이 대표 사진)
  facilities/*.jpg      부대시설 8장
```

실제 사진으로 바꿀 때는 **같은 파일명으로 덮어쓰기만** 하면 됩니다. 경로와 설명(캡션·alt)은 [src/lib/data.ts](src/lib/data.ts)의 `heroImages` · `aboutImages` · `rooms[].photos` · `facilities[].image`에 모여 있고, 객실 상세의 갤러리는 [RoomGallery.tsx](src/components/RoomGallery.tsx)가 그립니다. 교체 후에는 `/credits` 페이지와 이 절을 지우면 됩니다.

## 회원가입 · 로그인

- **비밀번호**: bcrypt(10 라운드). PostgreSQL seed의 `crypt(..., gen_salt('bf'))` 해시(`$2a$`)도 그대로 검증되므로 DB에서 만든 계정으로 바로 로그인됩니다.
- **세션**: 로그인 시 랜덤 32바이트 토큰을 발급해 **쿠키에는 원본, 저장소에는 SHA-256 해시만** 넣습니다(`sessions.token_hash`). 쿠키는 httpOnly·SameSite=Lax·14일, 프로덕션에서는 secure.
- **처리 방식**: 서버 액션(`src/lib/actions/auth.ts`)으로 가입·로그인·로그아웃을 처리합니다. 로그인 실패 문구는 계정 존재 여부를 노출하지 않도록 통일했습니다.
- **약관**: 가입 시 필수 2개(서비스·개인정보) + 선택 1개(마케팅)를 받고, DB 모드에서는 `terms`의 최신 버전 기준으로 `user_term_agreements`에 동의 이력을 남깁니다.
- **보호 라우트**: `/mypage`는 비로그인 시 `/login?next=/mypage`로 보내고 로그인 후 원래 경로로 복귀합니다(내부 경로만 허용해 오픈 리다이렉트 차단).
- **예약 연동**: 로그인 상태에서 예약하면 이름·연락처가 자동 입력되고 `reservations.user_id`로 연결되어 마이페이지에 쌓입니다. 비회원 예약도 그대로 가능합니다.
- 정적 페이지를 유지하려고 루트 레이아웃에서 쿠키를 읽지 않고, 헤더·예약 폼만 `useCurrentUser()`로 `/api/auth/me`를 조회합니다.

## API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| GET | `/api/availability?checkIn&checkOut&guests` | 기간별 6개 객실 잔여 여부 + 일자별 요금 내역 |
| GET/POST | `/api/reservations` | 예약 목록(마스킹) / 예약 접수 (로그인 시 회원 연결) |
| GET/POST | `/api/board` | 게시글 목록(말머리 필터) / 작성 |
| GET | `/api/board/[id]` | 게시글 상세 (조회수 증가) |
| GET | `/api/auth/me` | 현재 로그인 상태 (헤더·예약 폼용) |

요금 규칙은 `src/lib/pricing.ts`에 있습니다. 주중(월~목) / 금·일 / 토 / 성수기(7~8월, 1월) 4단이며
기준 2인 초과 시 1인·1박당 20,000원이 붙습니다. 예약금은 총액의 30%입니다.

## 데이터베이스 (PostgreSQL)

```bash
createdb maeumsok
psql -d maeumsok -f db/schema.sql
psql -d maeumsok -f db/seed.sql

cp .env.example .env.local   # DATABASE_URL 수정
npm run dev                  # 이제 PostgreSQL을 사용합니다
```

`DATABASE_URL`이 설정되면 `src/lib/repo.ts`가 자동으로 SQL 경로를 타고, 없으면 파일 저장소를 씁니다.
화면 코드는 `repo.ts`만 호출하므로 전환 시 UI 수정이 필요 없습니다.

### 테이블 구성 (25개)

**회원 / 인증**
`users` · `terms` · `user_term_agreements` · `user_social_accounts` · `sessions` · `user_tokens`

- 비회원 예약을 허용하므로 예약의 `user_id`는 NULL 허용, 대신 `guest_name/phone/email` 스냅샷을 남깁니다.
- 약관은 버전(`terms.code + version`)으로 관리하고, 동의·철회를 이력 테이블에 적재합니다.
- 소셜 로그인은 `provider + provider_uid` 유니크로 계정 연동합니다.

**객실 / 요금**
`buildings` · `rooms` · `amenities` · `room_amenities` · `room_images` · `room_rates` · `options` · `facilities`

- `rooms`에 `UNIQUE (building_id, floor)` 를 걸어 **한 동에 층당 1실(= 동별 2실)** 구조를 스키마로 고정했습니다.
- 평상시 요금은 `rooms`의 4단 요금 컬럼, 특정일 변동·판매중지는 `room_rates`(일자별 캘린더)로 덮어씁니다.

**예약 / 결제**
`reservations` · `reservation_nights` · `reservation_options` · `payments` · `reservation_logs`

- `nights`, `stay_period`(daterange)는 **생성 컬럼**이라 항상 날짜와 일치합니다.
- 더블부킹은 애플리케이션이 아니라 DB가 막습니다:

  ```sql
  EXCLUDE USING gist (room_id WITH =, stay_period WITH &&)
    WHERE (status IN ('pending','confirmed','completed'))
  ```

  반열린 구간 `[)`이라 "앞 손님 체크아웃일 = 뒷 손님 체크인일"은 정상 허용됩니다.
  동시 요청이 충돌하면 `23P01` 에러가 나고, API가 이를 409로 변환합니다.
- 상태 변경은 트리거(`fn_log_reservation_status`)가 `reservation_logs`에 자동 기록합니다.
- 결제 시점 요금을 `reservation_nights`에 박아두어 이후 요금표를 바꿔도 과거 예약 금액이 흔들리지 않습니다.

**게시판**
`board_categories` · `posts` · `post_comments` · `post_attachments`

- 카테고리 플래그로 정책을 제어합니다: `admin_only`(공지), `allow_guest`(비회원 작성), `use_rating`(후기 별점).
- 비회원 글은 `guest_password`(bcrypt)로 수정·삭제를 인증하고, 회원 글은 `user_id`로 연결합니다.
- 후기에 `reservation_id`를 연결하면 실제 투숙 인증 후기로 구분할 수 있습니다.
- 제목+본문 GIN 인덱스로 검색을 대비했습니다.

**운영**
`site_settings`(펜션명·연락처·계좌 등) · `admin_logs`

**뷰 / 함수**

- `v_room_calendar` — 오늘부터 90일, 객실 × 일자별 요금·예약·판매중지 상태
- `fn_available_rooms(체크인, 체크아웃)` — 예약 가능 객실과 기간 총액 (실시간 예약 화면용)
- `v_board_list` — 게시판 목록 + 댓글 수

ERD와 주요 쿼리 예시는 [db/ERD.md](db/ERD.md)에 있습니다.

DB 모드에서는 `db/seed.sql`의 관리자 계정(`admin@maeumsok.kr` / `admin1234`)과 샘플 회원(`hana@example.com` / `test1234`)으로 바로 로그인해 볼 수 있습니다.
파일 저장소 모드에서는 회원 데이터가 비어 있으니 `/signup`에서 직접 가입하면 `data/users.json`에 저장됩니다.

## 다음 단계로 남긴 것

- 회원정보 수정·탈퇴, 비밀번호 재설정 메일 (`user_tokens` 준비됨)
- 소셜 로그인 (`user_social_accounts` 준비됨)
- 관리자 페이지 (예약 확정/취소, 게시글 답변, 요금 캘린더 편집)
- PG 결제 연동 (`payments` 테이블에 PG 필드 준비됨)
- 실제 사진 업로드 (`room_images` 준비됨 — 현재는 SVG 일러스트로 대체)
- 카카오맵 SDK 연동, 비밀글 열람 인증
