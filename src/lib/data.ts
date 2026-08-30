export const pension = {
  name: "마음속 쉼터",
  tagline: "가평 숲속, 마음이 머무는 여섯 개의 방",
  address: "경기도 가평군 상면 수목원로 123-45",
  phone: "031-585-7942",
  account: "농협 352-0000-0000-00 (예금주 마음속 쉼터)",
  checkIn: "15:00",
  checkOut: "11:00",
  email: "stay@maeumsok.kr",
  mapQuery: "경기도 가평군 상면 수목원로",
};

/** 페이지 상단 배경 사진 */
export const heroImages = {
  home: "/images/hero.jpg",
  about: "/images/page-about.jpg",
  rooms: "/images/page-rooms.jpg",
  reservation: "/images/page-reservation.jpg",
  facilities: "/images/page-facilities.jpg",
  board: "/images/page-board.jpg",
  auth: "/images/page-auth.jpg",
  mypage: "/images/page-mypage.jpg",
};

export const aboutImages = [
  { src: "/images/about-1.jpg", alt: "펜션 뒤편 숲 산책로" },
  { src: "/images/about-2.jpg", alt: "나무 사이에 앉힌 펜션 동" },
  { src: "/images/about-3.jpg", alt: "펜션 옆으로 흐르는 계곡" },
  { src: "/images/about-4.jpg", alt: "자작나무 숲" },
];

export type Photo = { src: string; alt: string; caption: string };

export type Room = {
  slug: string;
  name: string;
  building: string;
  buildingLabel: string;
  floor: string;
  size: string;
  sizeM2: string;
  standard: number;
  max: number;
  bed: string;
  view: string;
  concept: string;
  description: string;
  amenities: string[];
  price: { weekday: number; friday: number; saturday: number; peak: number };
  hue: [string, string];
  /** [0] 이 대표 사진 */
  photos: Photo[];
};

export const rooms: Room[] = [
  {
    slug: "moss",
    name: "이끼방",
    building: "A",
    buildingLabel: "숲채",
    floor: "1층",
    size: "10평",
    sizeM2: "33㎡",
    standard: 2,
    max: 3,
    bed: "퀸 침대 1",
    view: "이끼 정원 · 계곡 방향",
    concept: "젖은 흙과 이끼 냄새가 가장 먼저 닿는 방",
    description:
      "숲채 1층에 자리한 원룸형 객실입니다. 창을 열면 손 닿을 곳에 이끼 정원이 펼쳐지고, 비 오는 날에는 계곡 물소리가 방 안까지 들어옵니다. 10평 한 칸에 침실·주방·욕실이 알차게 담겨 두 사람이 머물기에 넉넉합니다.",
    amenities: ["개별 테라스", "인덕션 2구", "냉장고", "에어컨/온수매트", "무료 Wi-Fi", "스마트 TV"],
    price: { weekday: 120000, friday: 150000, saturday: 180000, peak: 210000 },
    hue: ["#2f5d45", "#7ba36a"],
    photos: [
      { src: "/images/rooms/moss-1.jpg", alt: "이끼방 침실", caption: "원목으로 맞춘 10평 원룸형 침실" },
      { src: "/images/rooms/moss-2.jpg", alt: "객실에 준비된 드립커피", caption: "객실마다 준비해 두는 드립커피" },
      { src: "/images/rooms/moss-3.jpg", alt: "이끼방 욕실", caption: "욕조가 있는 밝은 욕실" },
      { src: "/images/rooms/moss-4.jpg", alt: "객실 앞 계곡", caption: "창밖으로 이어지는 계곡" },
    ],
  },
  {
    slug: "fern",
    name: "고사리방",
    building: "A",
    buildingLabel: "숲채",
    floor: "2층",
    size: "10평",
    sizeM2: "33㎡",
    standard: 2,
    max: 3,
    bed: "퀸 침대 1",
    view: "잣나무 숲 방향",
    concept: "나무 그늘이 하루 종일 천장을 스치는 방",
    description:
      "숲채 2층, 잣나무 가지와 눈높이가 맞는 객실입니다. 오후 햇살이 잎 사이로 쪼개져 들어와 방 안에 무늬를 만듭니다. 경사 천장 덕분에 같은 10평이라도 훨씬 넓게 느껴집니다.",
    amenities: ["경사 천장", "개별 테라스", "인덕션 2구", "냉장고", "에어컨/온수매트", "무료 Wi-Fi"],
    price: { weekday: 120000, friday: 150000, saturday: 180000, peak: 210000 },
    hue: ["#35532e", "#a2bf92"],
    photos: [
      { src: "/images/rooms/fern-1.jpg", alt: "고사리방 내부", caption: "경사 천장이 살아 있는 2층 객실" },
      { src: "/images/rooms/fern-2.jpg", alt: "창가 원목 테이블", caption: "창가 원목 테이블" },
      { src: "/images/rooms/fern-3.jpg", alt: "고사리방 욕실", caption: "창이 있는 욕실" },
      { src: "/images/rooms/fern-4.jpg", alt: "창밖 잣나무 숲", caption: "눈높이가 나뭇가지와 맞는 창밖" },
    ],
  },
  {
    slug: "pine",
    name: "솔바람방",
    building: "B",
    buildingLabel: "바람채",
    floor: "1층",
    size: "10평",
    sizeM2: "33㎡",
    standard: 2,
    max: 3,
    bed: "퀸 침대 1",
    view: "바비큐 데크 · 잔디마당 방향",
    concept: "문을 열면 바로 바비큐 데크로 이어지는 방",
    description:
      "바람채 1층으로, 테라스 두 걸음 앞이 전용 바비큐 데크입니다. 고기 굽다 방에 들어와 쉬고, 다시 나가기 좋은 구조라 두세 명이 느슨하게 저녁을 보내기에 잘 맞습니다.",
    amenities: ["전용 바비큐 데크", "인덕션 2구", "냉장고", "에어컨/온수매트", "무료 Wi-Fi", "스마트 TV"],
    price: { weekday: 130000, friday: 160000, saturday: 190000, peak: 220000 },
    hue: ["#446a39", "#c8dabd"],
    photos: [
      { src: "/images/rooms/pine-1.jpg", alt: "솔바람방 내부", caption: "잔디마당 쪽으로 문이 열리는 1층 객실" },
      { src: "/images/rooms/pine-2.jpg", alt: "테라스에서 마시는 커피", caption: "테라스에서 마시는 아침 커피" },
      { src: "/images/rooms/pine-3.jpg", alt: "솔바람방 욕실", caption: "원목 욕조가 있는 욕실" },
      { src: "/images/rooms/pine-4.jpg", alt: "전용 바비큐 데크 숯불", caption: "테라스 두 걸음 앞, 전용 바비큐 데크" },
    ],
  },
  {
    slug: "mist",
    name: "안개방",
    building: "B",
    buildingLabel: "바람채",
    floor: "2층",
    size: "10평",
    sizeM2: "33㎡",
    standard: 2,
    max: 3,
    bed: "퀸 침대 1",
    view: "능선 · 아침 안개 방향",
    concept: "새벽에 골짜기 안개가 차오르는 걸 보는 방",
    description:
      "바람채 2층 모서리 객실입니다. 두 면이 창이라 아침 여섯 시쯤 골짜기에서 안개가 올라오는 장면을 침대에 누운 채로 볼 수 있습니다. 조용히 쉬려는 손님이 가장 많이 다시 찾는 방입니다.",
    amenities: ["코너 2면 창", "개별 테라스", "인덕션 2구", "냉장고", "에어컨/온수매트", "무료 Wi-Fi"],
    price: { weekday: 130000, friday: 160000, saturday: 190000, peak: 220000 },
    hue: ["#5b874b", "#e5ede0"],
    photos: [
      { src: "/images/rooms/mist-1.jpg", alt: "안개방 내부", caption: "두 면이 창인 코너 객실" },
      { src: "/images/rooms/mist-2.jpg", alt: "안개방 침대", caption: "창 쪽으로 붙인 퀸 침대" },
      { src: "/images/rooms/mist-3.jpg", alt: "안개방 욕실", caption: "전망이 보이는 욕실" },
      { src: "/images/rooms/mist-4.jpg", alt: "새벽 안개가 오르는 창밖", caption: "여섯 시쯤 창밖에서 안개가 오릅니다" },
    ],
  },
  {
    slug: "moon",
    name: "달빛방",
    building: "C",
    buildingLabel: "달빛채",
    floor: "1층",
    size: "10평",
    sizeM2: "33㎡",
    standard: 2,
    max: 3,
    bed: "퀸 침대 1 + 좌식 매트",
    view: "자작나무 길 방향",
    concept: "밤 산책 다녀와 바로 눕기 좋은 방",
    description:
      "달빛채 1층, 자작나무 산책로 입구에 붙어 있는 객실입니다. 밤 산책과 캠프파이어 데크가 가장 가까워 아이와 함께 온 가족 손님이 많이 씁니다. 좌식 매트를 더해 최대 3인까지 편합니다.",
    amenities: ["좌식 공간", "개별 테라스", "인덕션 2구", "냉장고", "에어컨/온수매트", "무료 Wi-Fi"],
    price: { weekday: 125000, friday: 155000, saturday: 185000, peak: 215000 },
    hue: ["#253c21", "#cbb79c"],
    photos: [
      { src: "/images/rooms/moon-1.jpg", alt: "달빛방 내부", caption: "좌식 공간을 더해 3인까지 편한 방" },
      { src: "/images/rooms/moon-2.jpg", alt: "달빛채 옆 공용 라운지", caption: "달빛채에서 가장 가까운 공용 라운지" },
      { src: "/images/rooms/moon-3.jpg", alt: "캠프파이어 화로", caption: "문 앞 캠프파이어 데크의 화로" },
      { src: "/images/rooms/moon-4.jpg", alt: "달빛채 앞 산책로", caption: "문을 열면 바로 이어지는 숲 산책로" },
    ],
  },
  {
    slug: "star",
    name: "별빛방",
    building: "C",
    buildingLabel: "달빛채",
    floor: "2층",
    size: "10평",
    sizeM2: "33㎡",
    standard: 2,
    max: 3,
    bed: "퀸 침대 1",
    view: "하늘 · 별관측 데크 방향",
    concept: "천창으로 별을 보며 잠드는 방",
    description:
      "달빛채 2층에 있는, 여섯 방 중 하나뿐인 천창 객실입니다. 불을 끄면 침대 위로 하늘이 그대로 들어옵니다. 바로 옆 계단으로 별관측 데크에 올라갈 수 있습니다.",
    amenities: ["침실 천창", "개별 테라스", "인덕션 2구", "냉장고", "에어컨/온수매트", "무료 Wi-Fi"],
    price: { weekday: 135000, friday: 165000, saturday: 195000, peak: 225000 },
    hue: ["#172817", "#a2bf92"],
    photos: [
      { src: "/images/rooms/star-1.jpg", alt: "별빛방 내부", caption: "천창이 있는, 여섯 방 중 하나뿐인 객실" },
      { src: "/images/rooms/star-2.jpg", alt: "별빛방 창가 테이블", caption: "창가에 놓인 원목 테이블" },
      { src: "/images/rooms/star-3.jpg", alt: "천창으로 보이는 밤하늘", caption: "불을 끄면 천창으로 은하수가 보입니다" },
      { src: "/images/rooms/star-4.jpg", alt: "아침 창밖 풍경", caption: "해 뜰 무렵의 창밖" },
    ],
  },
];

export const buildings = [
  {
    id: "A",
    label: "숲채",
    note: "가장 안쪽 동. 계곡과 이끼 정원 쪽으로 붙어 있어 물소리가 잘 들립니다.",
    rooms: ["moss", "fern"],
  },
  {
    id: "B",
    label: "바람채",
    note: "잔디마당 가운데 동. 바비큐 데크와 가까워 저녁을 길게 보내기 좋습니다.",
    rooms: ["pine", "mist"],
  },
  {
    id: "C",
    label: "달빛채",
    note: "산책로 입구 동. 캠프파이어 데크와 별관측 데크로 바로 이어집니다.",
    rooms: ["moon", "star"],
  },
];

export const facilities = [
  {
    key: "bbq",
    name: "숲 바비큐 데크",
    icon: "flame",
    image: "/images/facilities/bbq.jpg",
    summary: "동별 전용 데크에서 굽는 저녁",
    detail:
      "각 동 앞에 지붕 있는 바비큐 데크가 있습니다. 비가 와도 그대로 진행할 수 있고, 숯·그릴·집게는 준비되어 있습니다. 이용료 2인 기준 20,000원(숯 포함), 오후 5시부터 밤 10시까지.",
  },
  {
    key: "trail",
    name: "자작나무 산책로",
    icon: "tree",
    image: "/images/facilities/trail.jpg",
    summary: "왕복 25분, 완만한 흙길",
    detail:
      "펜션 뒤편에서 시작해 작은 계곡을 한 바퀴 도는 흙길입니다. 경사가 거의 없어 아이나 어르신도 부담 없이 걷습니다. 밤에는 낮은 조명을 켜둡니다.",
  },
  {
    key: "campfire",
    name: "캠프파이어 데크",
    icon: "spark",
    image: "/images/facilities/campfire.jpg",
    summary: "가을·겨울 저녁 불 피우기",
    detail:
      "달빛채 옆 자갈 데크에서 화로를 피웁니다. 장작 한 바구니 15,000원, 마시멜로 세트 5,000원. 소방 규정상 밤 10시까지 운영합니다.",
  },
  {
    key: "stars",
    name: "별관측 데크",
    icon: "star",
    image: "/images/facilities/stars.jpg",
    summary: "가평 밤하늘을 그대로",
    detail:
      "가장 높은 자리에 있는 나무 데크입니다. 22시 이후 마당 조명을 낮춰 별이 잘 보입니다. 돗자리와 담요는 라운지에서 빌려가세요.",
  },
  {
    key: "lounge",
    name: "숲속 라운지",
    icon: "cup",
    image: "/images/facilities/lounge.jpg",
    summary: "원두커피 · 보드게임 · 책",
    detail:
      "체크인 데스크를 겸하는 공용 공간입니다. 드립커피와 차는 상시 무료, 보드게임과 책은 자유롭게 이용합니다. 07:00~22:00 개방.",
  },
  {
    key: "pool",
    name: "잔디마당 & 물놀이터",
    icon: "water",
    image: "/images/facilities/pool.jpg",
    summary: "여름 한정 얕은 수심 25cm",
    detail:
      "6월 말부터 8월 말까지 잔디마당 옆 물놀이터를 운영합니다. 수심 25cm로 얕아 유아도 놀 수 있고, 옆에 샤워 부스가 있습니다.",
  },
  {
    key: "shop",
    name: "작은 매점",
    icon: "shop",
    image: "/images/facilities/shop.jpg",
    summary: "라면 · 음료 · 부탄가스 · 세면도구",
    detail:
      "잊고 온 물건을 위한 최소 구비 매점입니다. 라운지 안쪽에 있고 밤 10시까지 이용 가능합니다.",
  },
  {
    key: "parking",
    name: "주차장",
    icon: "car",
    image: "/images/facilities/parking.jpg",
    summary: "객실당 1대 무제한 무료",
    detail:
      "동 앞 도착 주차가 가능하며, 객실당 1대는 무료입니다. 추가 차량은 입구 쪽 공용 주차장을 이용해 주세요.",
  },
];

export const stayNotes = [
  "기준 인원 2인, 최대 3인입니다. 추가 1인당 20,000원(침구 포함)이 붙습니다.",
  "모든 객실은 금연이며, 테라스에서만 흡연이 가능합니다.",
  "반려동물 동반은 어렵습니다. 숲 생태와 알레르기 손님 때문입니다.",
  "밤 10시 이후에는 숲이 매우 조용해집니다. 야외 음향기기 사용을 삼가주세요.",
  "체크인 15:00 / 체크아웃 11:00 이며, 늦은 도착은 미리 연락 주시면 조정해 드립니다.",
];

export const directions = [
  { label: "자동차", value: "서울 기준 서울양양고속도로 → 설악IC → 수목원로 방면 약 15분. 총 1시간 10분." },
  { label: "대중교통", value: "ITX-청춘 가평역 하차 → 택시 약 20분(15,000원 내외). 사전 연락 시 역까지 픽업(1일 2회)." },
  { label: "근처", value: "아침고요수목원 12분, 자라섬 20분, 쁘띠프랑스 25분, 잣향기푸른숲 18분." },
];

export function priceForDate(room: Room, date: Date) {
  const day = date.getDay();
  const month = date.getMonth() + 1;
  const isPeak = month === 7 || month === 8 || month === 1;
  if (isPeak) return room.price.peak;
  if (day === 6) return room.price.saturday;
  if (day === 5 || day === 0) return room.price.friday;
  return room.price.weekday;
}

export function getRoom(slug: string) {
  return rooms.find((r) => r.slug === slug);
}

export function won(n: number) {
  return n.toLocaleString("ko-KR") + "원";
}
