// data.jsx — categories, theme metadata, and seed recipes (Korean cooking + coffee)
// Exported to window for use across babel modules.

const CATEGORY_GROUPS = [
  { id: 'all', label: '전체' },
  { id: 'cooking', label: '요리' },
  { id: 'coffee', label: '커피' },
];

// Renewed category palette — kept close to the original brand hues but harmonized
// to sit calmly on a warm paper background.
const CATEGORIES = [
  { id: 'korean',    label: '한식',     emoji: '🍚', color: '#E2574C', group: 'cooking' },
  { id: 'western',   label: '양식',     emoji: '🍝', color: '#2BB6A8', group: 'cooking' },
  { id: 'japanese',  label: '일식',     emoji: '🍱', color: '#E0A02E', group: 'cooking' },
  { id: 'chinese',   label: '중식',     emoji: '🥟', color: '#D9683F', group: 'cooking' },
  { id: 'dessert',   label: '디저트',   emoji: '🍰', color: '#8B7CE8', group: 'cooking' },
  { id: 'espresso',  label: '에스프레소', emoji: '☕', color: '#6C5CE7', group: 'coffee' },
  { id: 'hand-drip', label: '핸드드립',  emoji: '🫖', color: '#10A37F', group: 'coffee' },
  { id: 'cold-brew', label: '콜드브루',  emoji: '🧊', color: '#4F9DF0', group: 'coffee' },
  { id: 'other',     label: '기타',     emoji: '🍽️', color: '#9B9488', group: 'all' },
];

const getCategoryById = (id) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

let _seq = 0;
const sid = () => `s-${(_seq++).toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
const ing = (name, quantity) => ({ id: sid(), name, quantity });
const step = (instruction, timer) => ({ id: sid(), instruction, ...(timer ? { timer } : {}) });
const t = (durationSeconds, label) => ({ durationSeconds, label });

function daysAgo(n) {
  const d = new Date('2026-06-03T09:00:00');
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const SEED_RECIPES = [
  {
    id: 'r-kimchi-jjigae',
    title: '돼지고기 김치찌개',
    categoryId: 'korean',
    description: '잘 익은 신김치와 목살로 끓이는 얼큰한 국물. 한 그릇이면 밥 두 공기는 거뜬해요.',
    servings: '2인분',
    accent: 'warm',
    ingredients: [
      ing('신김치', '1/4포기'),
      ing('돼지고기 목살', '200g'),
      ing('두부', '1/2모'),
      ing('대파', '1대'),
      ing('양파', '1/2개'),
      ing('고춧가루', '1큰술'),
      ing('다진 마늘', '1큰술'),
      ing('국간장', '1큰술'),
      ing('쌀뜨물', '500ml'),
    ],
    steps: [
      step('목살을 한입 크기로 썰고, 신김치는 2cm 폭으로 썬다.'),
      step('냄비에 참기름을 두르고 돼지고기를 중불에서 노릇하게 볶는다.', t(180, '고기 볶기 3분')),
      step('김치를 넣고 고춧가루·다진 마늘과 함께 5분간 더 볶아 감칠맛을 끌어올린다.', t(300, '김치 볶기 5분')),
      step('쌀뜨물을 붓고 센 불에서 끓이다가, 끓어오르면 중불로 줄여 15분간 푹 끓인다.', t(900, '끓이기 15분')),
      step('두부·양파·대파를 넣고 국간장으로 간을 맞춘 뒤 5분 더 끓여 마무리한다.', t(300, '마무리 5분')),
    ],
    notes: '김치가 덜 익었다면 설탕 한 꼬집을 넣으면 감칠맛이 살아납니다.',
    createdAt: daysAgo(2), updatedAt: daysAgo(0),
  },
  {
    id: 'r-doenjang-jjigae',
    title: '냉이 된장찌개',
    categoryId: 'korean',
    description: '구수한 된장에 봄 냉이 향을 더한 집밥의 정석.',
    servings: '2인분',
    ingredients: [
      ing('된장', '2큰술'),
      ing('냉이', '한 줌'),
      ing('애호박', '1/3개'),
      ing('두부', '1/2모'),
      ing('표고버섯', '2개'),
      ing('청양고추', '1개'),
      ing('멸치다시마 육수', '500ml'),
    ],
    steps: [
      step('멸치와 다시마로 육수를 우려낸다.', t(600, '육수 10분')),
      step('육수에 된장을 체에 걸러 풀고 끓인다.'),
      step('애호박·표고버섯·두부를 넣고 중불에서 10분간 끓인다.', t(600, '끓이기 10분')),
      step('손질한 냉이와 청양고추를 넣고 2분만 더 끓여 향을 살린다.', t(120, '냉이 2분')),
    ],
    notes: '냉이는 마지막에 넣어야 향이 날아가지 않아요.',
    createdAt: daysAgo(6), updatedAt: daysAgo(4),
  },
  {
    id: 'r-bulgogi',
    title: '서울식 소불고기',
    categoryId: 'korean',
    description: '배즙으로 재운 부드러운 불고기. 국물까지 자작하게.',
    servings: '3인분',
    accent: 'warm',
    ingredients: [
      ing('소고기 불고기감', '500g'),
      ing('양파', '1개'),
      ing('당근', '1/3개'),
      ing('대파', '1대'),
      ing('간장', '4큰술'),
      ing('배즙', '4큰술'),
      ing('설탕', '1.5큰술'),
      ing('다진 마늘', '1큰술'),
      ing('참기름', '1큰술'),
      ing('후추', '약간'),
    ],
    steps: [
      step('간장·배즙·설탕·다진 마늘·참기름·후추를 섞어 양념장을 만든다.'),
      step('핏물을 뺀 소고기를 양념장에 버무려 냉장고에서 재운다.', t(1800, '재우기 30분')),
      step('달군 팬에 양파·당근을 먼저 볶다가 재운 고기를 넣는다.'),
      step('센 불에서 고기가 익을 때까지 볶고, 대파를 넣어 마무리한다.', t(360, '볶기 6분')),
    ],
    notes: '국물을 좋아하면 물 1/2컵을 추가해 자작하게 끓이세요.',
    createdAt: daysAgo(9), updatedAt: daysAgo(8),
  },
  {
    id: 'r-bibimbap',
    title: '나물 비빔밥',
    categoryId: 'korean',
    description: '제철 나물 네 가지에 고추장 한 술. 비벼 먹는 한 그릇.',
    servings: '2인분',
    ingredients: [
      ing('밥', '2공기'),
      ing('시금치', '한 줌'),
      ing('콩나물', '한 줌'),
      ing('애호박', '1/2개'),
      ing('당근', '1/2개'),
      ing('계란', '2개'),
      ing('고추장', '2큰술'),
      ing('참기름', '1큰술'),
      ing('통깨', '약간'),
    ],
    steps: [
      step('콩나물은 소금물에 삶고, 시금치는 데쳐 무친다.', t(300, '나물 데치기 5분')),
      step('애호박·당근은 채 썰어 각각 소금 간해 볶는다.'),
      step('계란은 반숙 프라이로 부친다.'),
      step('그릇에 밥을 담고 나물을 색 맞춰 올린 뒤 고추장·참기름·통깨를 더한다.'),
    ],
    notes: '돌솥에 담아 누룽지를 만들면 더 맛있어요.',
    createdAt: daysAgo(12), updatedAt: daysAgo(11),
  },
  {
    id: 'r-japchae',
    title: '잡채',
    categoryId: 'korean',
    description: '쫄깃한 당면에 다섯 가지 채소. 잔칫상의 주인공.',
    servings: '4인분',
    ingredients: [
      ing('당면', '200g'),
      ing('소고기 채', '150g'),
      ing('시금치', '한 줌'),
      ing('양파', '1/2개'),
      ing('당근', '1/3개'),
      ing('목이버섯', '한 줌'),
      ing('간장', '4큰술'),
      ing('설탕', '2큰술'),
      ing('참기름', '2큰술'),
    ],
    steps: [
      step('당면은 찬물에 30분 불린 뒤 삶아 간장·참기름으로 밑간한다.', t(1800, '당면 불리기 30분')),
      step('채소와 소고기를 각각 따로 볶는다.'),
      step('삶은 당면을 넣고 간장·설탕으로 간하며 함께 볶는다.', t(360, '볶기 6분')),
      step('불을 끄고 참기름·통깨를 둘러 버무린다.'),
    ],
    notes: '재료를 따로 볶아야 색과 식감이 살아납니다.',
    createdAt: daysAgo(15), updatedAt: daysAgo(14),
  },
  {
    id: 'r-carbonara',
    title: '진짜 로마식 까르보나라',
    categoryId: 'western',
    description: '생크림 없이 계란 노른자와 페코리노만으로. 묵직하고 짭조름하게.',
    servings: '2인분',
    accent: 'warm',
    ingredients: [
      ing('스파게티', '200g'),
      ing('관찰레(또는 베이컨)', '80g'),
      ing('계란 노른자', '3개'),
      ing('페코리노 로마노', '50g'),
      ing('통후추', '넉넉히'),
      ing('소금', '약간'),
    ],
    steps: [
      step('끓는 소금물에 스파게티를 포장 시간보다 1분 짧게 삶는다.', t(540, '면 삶기 9분')),
      step('관찰레를 약불에서 바삭하게 구워 기름을 낸다.', t(300, '관찰레 5분')),
      step('노른자에 간 페코리노·통후추를 섞어 소스를 만든다.'),
      step('삶은 면을 관찰레 팬에 넣고 면수 한 국자를 더해 섞는다.'),
      step('불을 끈 뒤 노른자 소스를 넣고 빠르게 비벼 크림처럼 유화시킨다.'),
    ],
    notes: '불을 끄고 소스를 넣어야 계란이 익어 덩어리지지 않습니다.',
    createdAt: daysAgo(3), updatedAt: daysAgo(3),
  },
  {
    id: 'r-basque',
    title: '바스크 치즈케이크',
    categoryId: 'dessert',
    description: '겉은 까맣게 태우고 속은 촉촉하게. 실패 없는 디저트.',
    servings: '6조각',
    ingredients: [
      ing('크림치즈', '400g'),
      ing('설탕', '120g'),
      ing('계란', '3개'),
      ing('생크림', '240ml'),
      ing('박력분', '15g'),
      ing('바닐라 익스트랙', '1작은술'),
    ],
    steps: [
      step('실온의 크림치즈를 부드럽게 풀고 설탕을 넣어 섞는다.'),
      step('계란을 하나씩 넣어가며 섞고, 생크림·바닐라를 더한다.'),
      step('체 친 박력분을 넣어 매끄럽게 마무리한다.'),
      step('230℃ 예열 오븐에서 겉면이 진하게 탈 때까지 굽는다.', t(1500, '굽기 25분')),
      step('한 김 식힌 뒤 냉장고에서 차갑게 굳힌다.', t(3600, '냉장 1시간')),
    ],
    notes: '구운 직후엔 출렁이지만 식으면서 단단해져요.',
    createdAt: daysAgo(7), updatedAt: daysAgo(5),
  },
  {
    id: 'r-espresso',
    title: '홈카페 에스프레소',
    categoryId: 'espresso',
    description: '18g in, 36g out. 집에서 잡는 황금 비율 한 잔.',
    servings: '1샷',
    ingredients: [
      ing('원두', '18g'),
      ing('물(머신)', '92~94℃'),
    ],
    steps: [
      step('원두 18g을 곱게 분쇄해 포터필터에 담는다.'),
      step('고르게 분배한 뒤 레벨링하고 일정한 힘으로 탬핑한다.'),
      step('추출을 시작해 25~30초 안에 36g을 받아낸다.', t(28, '추출 28초')),
      step('크레마 색과 흐름을 보고 분쇄도를 미세 조정한다.'),
    ],
    notes: '추출이 빠르면 분쇄를 곱게, 느리면 굵게 조절하세요.',
    createdAt: daysAgo(1), updatedAt: daysAgo(1),
  },
  {
    id: 'r-v60',
    title: 'V60 핸드드립',
    categoryId: 'hand-drip',
    description: '1:16 비율, 세 번 나눠 붓기. 산뜻하고 깨끗한 한 잔.',
    servings: '1잔 (320ml)',
    accent: 'warm',
    ingredients: [
      ing('원두', '20g'),
      ing('물', '320ml / 92℃'),
      ing('V60 필터', '1장'),
    ],
    steps: [
      step('필터를 린싱해 종이 냄새를 없애고 드리퍼를 데운다.'),
      step('중간 굵기로 분쇄한 원두를 담아 평평하게 고른다.'),
      step('40g 물로 30초간 뜸을 들인다.', t(30, '뜸 들이기 30초')),
      step('중심부터 원을 그리며 180g까지 1차 푸어.', t(40, '1차 푸어 40초')),
      step('320g까지 2차 푸어 후 물이 다 내려갈 때까지 기다린다.', t(60, '2차 푸어 60초')),
    ],
    notes: '총 추출 시간 2분 30초~3분이 적당합니다.',
    createdAt: daysAgo(4), updatedAt: daysAgo(2),
  },
  {
    id: 'r-coldbrew',
    title: '콜드브루 원액',
    categoryId: 'cold-brew',
    description: '찬물에 12시간. 부드럽고 단맛 도는 여름 커피.',
    servings: '원액 500ml',
    ingredients: [
      ing('굵게 분쇄한 원두', '80g'),
      ing('찬물', '800ml'),
    ],
    steps: [
      step('원두를 굵게 분쇄해 콜드브루 백 또는 용기에 담는다.'),
      step('찬물을 천천히 부어 가루가 고루 적셔지게 한다.'),
      step('냉장고에서 12시간 우려낸다.', t(3600, '냉침 (타이머는 1시간 단위)')),
      step('필터로 걸러 원액을 병에 담는다.'),
    ],
    notes: '마실 땐 원액과 물·우유를 1:2로 희석하세요.',
    createdAt: daysAgo(8), updatedAt: daysAgo(6),
  },
  {
    id: 'r-gyeranmari',
    title: '대파 계란말이',
    categoryId: 'korean',
    description: '도시락 단골 메뉴. 보들보들 폭신하게 부치는 법.',
    servings: '2인분',
    ingredients: [
      ing('계란', '4개'),
      ing('대파', '1/2대'),
      ing('당근', '약간'),
      ing('맛술', '1큰술'),
      ing('소금', '1/4작은술'),
      ing('식용유', '약간'),
    ],
    steps: [
      step('계란을 풀고 잘게 썬 대파·당근, 맛술, 소금을 넣어 체에 한 번 거른다.'),
      step('약불로 달군 팬에 기름을 얇게 두른다.'),
      step('계란물을 부어 가장자리가 익으면 조금씩 말아준다.', t(240, '부치기 4분')),
      step('김발로 모양을 잡고 한 김 식힌 뒤 썬다.'),
    ],
    notes: '약불에서 천천히 말아야 갈라지지 않아요.',
    createdAt: daysAgo(13), updatedAt: daysAgo(10),
  },
];

Object.assign(window, {
  CATEGORY_GROUPS,
  CATEGORIES,
  getCategoryById,
  SEED_RECIPES,
});
