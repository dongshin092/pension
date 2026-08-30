-- =============================================================================
-- 마음속 쉼터 - 초기 데이터 (schema.sql 실행 후)
-- psql -U postgres -d maeumsok -f db/seed.sql
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 사이트 기본 정보
-- -----------------------------------------------------------------------------
INSERT INTO site_settings (key, value, label) VALUES
  ('pension_name', '마음속 쉼터',                      '펜션명'),
  ('tagline',      '가평 숲속, 마음이 머무는 여섯 개의 방', '슬로건'),
  ('address',      '경기도 가평군 상면 수목원로 123-45', '주소'),
  ('phone',        '031-585-7942',                     '대표 전화'),
  ('email',        'stay@maeumsok.kr',                 '대표 이메일'),
  ('bank_account', '농협 352-0000-0000-00 (예금주 마음속 쉼터)', '입금 계좌'),
  ('check_in',     '15:00',                            '체크인'),
  ('check_out',    '11:00',                            '체크아웃'),
  ('deposit_rate', '30',                               '예약금 비율(%)')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- -----------------------------------------------------------------------------
-- 약관
-- -----------------------------------------------------------------------------
INSERT INTO terms (code, version, title, body, is_required) VALUES
  ('service',   '1.0', '서비스 이용약관',        '제1조 (목적) ...', true),
  ('privacy',   '1.0', '개인정보 수집·이용 동의', '수집 항목: 이름, 연락처, 이메일 ...', true),
  ('marketing', '1.0', '마케팅 정보 수신 동의',   '이벤트 및 할인 정보 발송에 동의합니다.', false)
ON CONFLICT (code, version) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 관리자 계정 (비밀번호: admin1234 / 운영 배포 전 반드시 변경)
-- -----------------------------------------------------------------------------
INSERT INTO users (email, password_hash, name, nickname, phone, role, email_verified_at)
VALUES ('admin@maeumsok.kr', crypt('admin1234', gen_salt('bf', 10)), '관리자', '관리자',
        '031-585-7942', 'admin', now())
ON CONFLICT (email) DO NOTHING;

-- 샘플 회원 (비밀번호: test1234)
INSERT INTO users (email, password_hash, name, nickname, phone, marketing_opt_in, email_verified_at)
VALUES
  ('hana@example.com', crypt('test1234', gen_salt('bf', 10)), '정하늘', '하늘', '010-1234-5678', true,  now()),
  ('jiun@example.com', crypt('test1234', gen_salt('bf', 10)), '박지운', '지운', '010-2345-6789', false, now())
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 동 3개
-- -----------------------------------------------------------------------------
INSERT INTO buildings (code, name, description, sort_order) VALUES
  ('A', '숲채',   '가장 안쪽 동. 계곡과 이끼 정원 쪽으로 붙어 있어 물소리가 잘 들립니다.', 1),
  ('B', '바람채', '잔디마당 가운데 동. 바비큐 데크와 가까워 저녁을 길게 보내기 좋습니다.', 2),
  ('C', '달빛채', '산책로 입구 동. 캠프파이어 데크와 별관측 데크로 바로 이어집니다.',   3)
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 객실 6실 (동별 2실 · 전부 10평 원룸형)
-- -----------------------------------------------------------------------------
INSERT INTO rooms (building_id, slug, name, floor, bed_info, view_info, concept, description,
                   price_weekday, price_friday, price_saturday, price_peak, sort_order)
VALUES
  ((SELECT id FROM buildings WHERE code='A'), 'moss', '이끼방', 1,
   '퀸 침대 1', '이끼 정원 · 계곡 방향', '젖은 흙과 이끼 냄새가 가장 먼저 닿는 방',
   '숲채 1층에 자리한 원룸형 객실입니다. 창을 열면 손 닿을 곳에 이끼 정원이 펼쳐지고, 비 오는 날에는 계곡 물소리가 방 안까지 들어옵니다.',
   120000, 150000, 180000, 210000, 1),

  ((SELECT id FROM buildings WHERE code='A'), 'fern', '고사리방', 2,
   '퀸 침대 1', '잣나무 숲 방향', '나무 그늘이 하루 종일 천장을 스치는 방',
   '숲채 2층, 잣나무 가지와 눈높이가 맞는 객실입니다. 경사 천장 덕분에 같은 10평이라도 훨씬 넓게 느껴집니다.',
   120000, 150000, 180000, 210000, 2),

  ((SELECT id FROM buildings WHERE code='B'), 'pine', '솔바람방', 1,
   '퀸 침대 1', '바비큐 데크 · 잔디마당 방향', '문을 열면 바로 바비큐 데크로 이어지는 방',
   '바람채 1층으로, 테라스 두 걸음 앞이 전용 바비큐 데크입니다.',
   130000, 160000, 190000, 220000, 3),

  ((SELECT id FROM buildings WHERE code='B'), 'mist', '안개방', 2,
   '퀸 침대 1', '능선 · 아침 안개 방향', '새벽에 골짜기 안개가 차오르는 걸 보는 방',
   '바람채 2층 모서리 객실입니다. 두 면이 창이라 아침 여섯 시쯤 안개가 올라오는 장면을 침대에서 볼 수 있습니다.',
   130000, 160000, 190000, 220000, 4),

  ((SELECT id FROM buildings WHERE code='C'), 'moon', '달빛방', 1,
   '퀸 침대 1 + 좌식 매트', '자작나무 길 방향', '밤 산책 다녀와 바로 눕기 좋은 방',
   '달빛채 1층, 자작나무 산책로 입구에 붙어 있는 객실입니다. 좌식 매트를 더해 최대 3인까지 편합니다.',
   125000, 155000, 185000, 215000, 5),

  ((SELECT id FROM buildings WHERE code='C'), 'star', '별빛방', 2,
   '퀸 침대 1', '하늘 · 별관측 데크 방향', '천창으로 별을 보며 잠드는 방',
   '달빛채 2층에 있는, 여섯 방 중 하나뿐인 천창 객실입니다. 불을 끄면 침대 위로 하늘이 그대로 들어옵니다.',
   135000, 165000, 195000, 225000, 6)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 객실 편의시설
-- -----------------------------------------------------------------------------
INSERT INTO amenities (name, icon, sort_order) VALUES
  ('개별 테라스', 'terrace', 1), ('인덕션 2구', 'cook', 2), ('냉장고', 'fridge', 3),
  ('에어컨/온수매트', 'temp', 4), ('무료 Wi-Fi', 'wifi', 5), ('스마트 TV', 'tv', 6),
  ('경사 천장', 'ceiling', 7), ('전용 바비큐 데크', 'flame', 8), ('코너 2면 창', 'window', 9),
  ('좌식 공간', 'floor', 10), ('침실 천창', 'star', 11)
ON CONFLICT (name) DO NOTHING;

-- 전 객실 공통 비품
INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r CROSS JOIN amenities a
WHERE a.name IN ('개별 테라스', '인덕션 2구', '냉장고', '에어컨/온수매트', '무료 Wi-Fi')
ON CONFLICT DO NOTHING;

-- 객실별 특징
INSERT INTO room_amenities (room_id, amenity_id)
SELECT r.id, a.id FROM rooms r JOIN amenities a ON true
WHERE (r.slug, a.name) IN (
  ('moss', '스마트 TV'), ('fern', '경사 천장'), ('pine', '전용 바비큐 데크'),
  ('pine', '스마트 TV'), ('mist', '코너 2면 창'), ('moon', '좌식 공간'), ('star', '침실 천창')
)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- 유료 옵션
-- -----------------------------------------------------------------------------
INSERT INTO options (code, name, price, unit, note, sort_order) VALUES
  ('bbq_2',       '바비큐 이용료 (2인)', 20000, '건', '숯·그릴·집게 포함', 1),
  ('bbq_extra',   '바비큐 추가 1인',      5000, '인', '3인 이상 이용 시',   2),
  ('firewood',    '장작 한 바구니',      15000, '개', '화로 이용 포함',     3),
  ('marshmallow', '마시멜로 세트',        5000, '세트', '꼬치 2개 포함',    4),
  ('extra_person','추가 인원 (1인)',     20000, '인', '침구·세면도구 포함', 5)
ON CONFLICT (code) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 부대시설
-- -----------------------------------------------------------------------------
INSERT INTO facilities (name, icon, summary, detail, open_hours, sort_order) VALUES
  ('숲 바비큐 데크',   'flame', '동별 전용 데크에서 굽는 저녁',
   '각 동 앞에 지붕 있는 바비큐 데크가 있습니다. 숯·그릴·집게는 준비되어 있습니다.', '17:00~22:00', 1),
  ('자작나무 산책로',  'tree',  '왕복 25분, 완만한 흙길',
   '펜션 뒤편에서 시작해 작은 계곡을 한 바퀴 도는 흙길입니다.', '상시', 2),
  ('캠프파이어 데크',  'spark', '가을·겨울 저녁 불 피우기',
   '달빛채 옆 자갈 데크에서 화로를 피웁니다. 장작 한 바구니 15,000원.', '18:00~22:00', 3),
  ('별관측 데크',      'star',  '가평 밤하늘을 그대로',
   '가장 높은 자리의 나무 데크입니다. 22시 이후 마당 조명을 낮춥니다.', '상시', 4),
  ('숲속 라운지',      'cup',   '원두커피 · 보드게임 · 책',
   '체크인 데스크를 겸하는 공용 공간입니다. 드립커피와 차는 상시 무료.', '07:00~22:00', 5),
  ('잔디마당 & 물놀이터','water','여름 한정 얕은 수심 25cm',
   '6월 말~8월 말 운영. 수심 25cm로 유아도 놀 수 있습니다.', '09:00~18:00', 6),
  ('작은 매점',        'shop',  '라면 · 음료 · 부탄가스 · 세면도구',
   '잊고 온 물건을 위한 최소 구비 매점입니다.', '08:00~22:00', 7),
  ('주차장',           'car',   '객실당 1대 무제한 무료',
   '동 앞 도착 주차 가능. 추가 차량은 입구 공용 주차장 이용.', '상시', 8);

-- -----------------------------------------------------------------------------
-- 게시판 카테고리
-- -----------------------------------------------------------------------------
INSERT INTO board_categories (slug, name, description, admin_only, allow_guest, use_rating, sort_order) VALUES
  ('notice',  '공지',     '펜션 운영 공지사항',   true,  false, false, 1),
  ('inquiry', '예약문의', '예약 및 이용 문의',    false, true,  false, 2),
  ('review',  '이용후기', '다녀가신 분들의 후기', false, true,  true,  3)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 샘플 예약 (오늘 기준 상대 날짜)
-- -----------------------------------------------------------------------------
INSERT INTO reservations (code, room_id, check_in, check_out, adults, guest_name, guest_phone,
                          room_amount, total_amount, deposit_amount, status, payment_status, source)
VALUES
  ('MS26001', (SELECT id FROM rooms WHERE slug='moss'), CURRENT_DATE + 1, CURRENT_DATE + 2, 2,
   '김*은', '010-1111-2222', 150000, 150000, 45000, 'confirmed', 'deposit_paid', 'web'),
  ('MS26002', (SELECT id FROM rooms WHERE slug='star'), CURRENT_DATE + 1, CURRENT_DATE + 3, 2,
   '이*호', '010-2222-3333', 330000, 330000, 99000, 'confirmed', 'paid', 'web'),
  ('MS26003', (SELECT id FROM rooms WHERE slug='pine'), CURRENT_DATE + 2, CURRENT_DATE + 3, 2,
   '최*림', '010-3333-4444', 190000, 190000, 57000, 'confirmed', 'deposit_paid', 'phone'),
  ('MS26004', (SELECT id FROM rooms WHERE slug='mist'), CURRENT_DATE + 3, CURRENT_DATE + 4, 2,
   '한*영', '010-4444-5555', 160000, 160000, 48000, 'confirmed', 'deposit_paid', 'web'),
  ('MS26005', (SELECT id FROM rooms WHERE slug='moon'), CURRENT_DATE + 5, CURRENT_DATE + 7, 3,
   '오*수', '010-5555-6666', 340000, 360000, 108000, 'confirmed', 'deposit_paid', 'web'),
  ('MS26006', (SELECT id FROM rooms WHERE slug='fern'), CURRENT_DATE + 6, CURRENT_DATE + 7, 2,
   '장*미', '010-6666-7777', 180000, 180000, 54000, 'confirmed', 'paid', 'naver'),
  ('MS26007', (SELECT id FROM rooms WHERE slug='star'), CURRENT_DATE + 8, CURRENT_DATE + 9, 2,
   '윤*재', '010-7777-8888', 195000, 195000, 58500, 'pending', 'unpaid', 'web')
ON CONFLICT (code) DO NOTHING;

-- 예약 옵션 예시
INSERT INTO reservation_options (reservation_id, option_id, quantity, unit_price, amount)
SELECT r.id, o.id, 1, o.price, o.price
FROM reservations r JOIN options o ON o.code = 'bbq_2'
WHERE r.code IN ('MS26002', 'MS26005')
ON CONFLICT DO NOTHING;

-- 입금 이력 예시
INSERT INTO payments (reservation_id, method, amount, depositor_name, paid_at)
SELECT id, 'bank_transfer', deposit_amount, guest_name, now() - INTERVAL '2 days'
FROM reservations WHERE payment_status IN ('deposit_paid', 'paid');

-- -----------------------------------------------------------------------------
-- 샘플 게시글
-- -----------------------------------------------------------------------------
INSERT INTO posts (category_id, user_id, author_name, title, content, views, is_pinned, created_at)
VALUES
  ((SELECT id FROM board_categories WHERE slug='notice'),
   (SELECT id FROM users WHERE email='admin@maeumsok.kr'), '관리자',
   '가을 성수기(10~11월) 주말 예약 안내',
   E'단풍철 주말은 예약이 빠르게 마감됩니다.\n\n입금 확인 순으로 확정되며, 예약금은 1박 요금의 30%입니다. 취소 규정은 이용 7일 전 전액 환불, 3일 전 50% 환불, 당일 환불 불가입니다.',
   412, true, now() - INTERVAL '14 days'),

  ((SELECT id FROM board_categories WHERE slug='notice'),
   (SELECT id FROM users WHERE email='admin@maeumsok.kr'), '관리자',
   '바비큐 데크 이용 시간 변경(오후 5시 ~ 밤 10시)',
   '숲 화재 예방과 이웃 객실 소음 문제로 바비큐 이용 시간을 오후 5시부터 밤 10시까지로 정리했습니다.',
   233, true, now() - INTERVAL '9 days');

INSERT INTO posts (category_id, user_id, author_name, title, content, rating, views, created_at)
VALUES
  ((SELECT id FROM board_categories WHERE slug='review'),
   (SELECT id FROM users WHERE email='hana@example.com'), '정하늘',
   '안개방에서 본 새벽 안개, 사진보다 좋았어요',
   '코너 방이라 창이 두 면인 게 정말 컸습니다. 10평이라 작을까 걱정했는데 둘이 쓰기엔 딱 좋았습니다.',
   5, 158, now() - INTERVAL '6 days'),

  ((SELECT id FROM board_categories WHERE slug='review'),
   (SELECT id FROM users WHERE email='jiun@example.com'), '박지운',
   '아이 둘이랑 달빛방 다녀왔습니다',
   '좌식 매트가 있어서 아이들이 굴러다니기 좋았고, 물놀이터가 얕아서 계속 붙어 있지 않아도 됐습니다.',
   5, 96, now() - INTERVAL '3 days');

-- 비회원 문의글 (비밀번호 해시 저장)
INSERT INTO posts (category_id, author_name, guest_password, title, content, views, created_at)
VALUES
  ((SELECT id FROM board_categories WHERE slug='inquiry'), '김서연',
   crypt('1234', gen_salt('bf', 10)),
   '3인 예약 시 추가 침구 문의드립니다',
   '성인 3명인데 이끼방 예약 가능할까요? 추가 침구는 요청하면 넣어주시는 건가요?',
   41, now() - INTERVAL '1 day');

-- 관리자 답변
INSERT INTO post_comments (post_id, user_id, author_name, content, is_admin_reply, created_at)
SELECT p.id, u.id, '관리자',
       '이끼방 최대 3인까지 가능합니다. 추가 1인 20,000원에 침구가 포함되어 있고, 예약 메모에 3인이라고 남겨주시면 미리 세팅해 둡니다.',
       true, now() - INTERVAL '20 hours'
FROM posts p, users u
WHERE p.title LIKE '3인 예약%' AND u.email = 'admin@maeumsok.kr';

INSERT INTO post_comments (post_id, user_id, author_name, content, is_admin_reply, created_at)
SELECT p.id, u.id, '관리자',
       '안개방을 가장 좋아해 주시는 분들이 많습니다. 다음엔 별빛방 천창도 한번 보세요. 감사합니다!',
       true, now() - INTERVAL '5 days'
FROM posts p, users u
WHERE p.title LIKE '안개방에서 본%' AND u.email = 'admin@maeumsok.kr';

COMMIT;

-- 확인용
-- SELECT * FROM fn_available_rooms(CURRENT_DATE + 1, CURRENT_DATE + 2);
-- SELECT * FROM v_board_list;
