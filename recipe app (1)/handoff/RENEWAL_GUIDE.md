# 오늘의레시피 — Warm Paper 리뉴얼 적용 가이드

기존 Expo + react-native-paper 코드베이스(`yongwoo-yoo/recipe-app`)에 이 리뉴얼을
옮기기 위한 개발자 핸드오프 문서입니다. **위에서부터 순서대로** 적용하면 적은
변경으로 큰 시각적 변화를 얻도록 단계를 구성했습니다.

> 이 디자인은 웹 프로토타입(react-native-web 기준)으로 만들었지만, 모든 토큰은
> 여러분의 RN `StyleSheet` / Paper 테마 구조에 1:1로 매핑됩니다.

---

## 무엇이 바뀌나 (요약)

| 영역 | Before (현재) | After (리뉴얼) |
|---|---|---|
| 배경 | 쿨 그레이 `#f5f5f7` | **웜 페이퍼 `#F1ECE3`** |
| 표면 | 순백 `#ffffff` | **웜 화이트 `#FFFDFA`** |
| 강조색 | 애플 블루 `#0071e3` | **테라코타 `#E2574C`** (헤더·링크) |
| 채움 버튼/단계번호 | 블루 | **웜 차콜 `#221F1A`** |
| 모서리 | roundness 3, 카드 14 | **roundness 5, 카드 18** |
| 타이포 | 시스템 | **Pretendard** (선택) |
| 카드 | 색 액센트 바 + 텍스트 | **음식 이미지 영역 + 배지** |
| 칩 | 사각 라운드, 흑백 | **알약형, 활성 시 카테고리 색** |

핵심 원칙: **`appleColors`의 키 이름은 그대로 두고 값만 교체** → `gray1~gray6`,
`white`를 참조하는 기존 컴포넌트가 수정 없이 전부 새 팔레트로 갱신됩니다.

---

## 1단계 · 테마 교체 (5분, 효과 최대)

`constants/theme.ts` 를 첨부된 **`theme.ts`** 로 교체하세요.

- `appleColors` 값이 웜 톤으로 바뀝니다 (키 동일 → 자동 반영).
- `lightTheme` / `darkTheme` 의 `primary` 가 차콜로, 배경/표면이 페이퍼톤으로 변경.
- `roundness: 3 → 5`.

**딱 하나의 의미 정리** — 강조색이 파랑에서 테라코타로 바뀌면서 `appleColors.blue`
값이 테라코타가 됩니다. 별칭으로 호환되지만, 코드 명료성을 위해 한 번만 전역 치환을
권장합니다:

```
appleColors.blue  →  appleColors.accent
```

대상 파일: `app/_layout.tsx`(headerTintColor), `app/recipe/[id].tsx`, 기타 링크 색.

이 단계만 적용해도 앱 전체 분위기가 바뀝니다.

---

## 2단계 · 카테고리 색 조정 (2분)

첨부 **`categories.colors.ts`** 를 참고해 `constants/categories.ts` 의 `CATEGORIES`
배열에서 **`color` 값만** 교체하세요. `id`/`label`/`emoji` 는 그대로 둡니다.
(채도를 약간 낮춰 페이퍼 배경 위에서 차분하게 어울리도록 한 값입니다.)

---

## 3단계 · 타이포그래피: Pretendard (선택, 10분)

리뉴얼은 한글 가독성이 좋은 **Pretendard** 를 사용합니다. (구글폰트에 없으므로 폰트
파일을 직접 로드)

1. [Pretendard 릴리스](https://github.com/orioncactus/pretendard/releases)에서
   `Pretendard-Regular.otf`, `-Medium.otf`, `-SemiBold.otf`, `-Bold.otf` 를 받아
   `assets/fonts/` 에 넣습니다.

2. `app/_layout.tsx` 에서 로드:

```tsx
import { useFonts } from 'expo-font';

// RootLayout 내부:
const [loaded] = useFonts({
  'Pretendard':          require('../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-Medium':   require('../assets/fonts/Pretendard-Medium.otf'),
  'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold':     require('../assets/fonts/Pretendard-Bold.otf'),
});
useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
if (!loaded) return null;
```

3. 첨부 `theme.ts` 에는 이미 `configureFonts({ config: { fontFamily: 'Pretendard' }})`
   가 들어 있어 Paper 컴포넌트(Text/Button 등)에 자동 적용됩니다.

> 폰트가 부담되면 이 단계는 건너뛰어도 좋습니다. 색/형태만으로도 리뉴얼 효과는 충분합니다.

---

## 4단계 · 컴포넌트 디테일

테마만으로 80%가 끝나고, 아래는 "리뉴얼처럼 보이게" 하는 마감 작업입니다.

### 4-1. RecipeCard — 이미지 영역 추가 (가장 큰 시각 변화)

현재 카드는 상단 색 바 + 텍스트입니다. 리뉴얼은 **이미지 영역(4:3) + 위에 떠 있는
카테고리 배지** 구조입니다. 실제 사진이 없으면 카테고리 색 블록으로 폴백하세요.

`components/recipe/RecipeCard.tsx` 의 `card` 내부 최상단을 교체:

```tsx
// styles.accentBar 제거하고, content 위에 미디어 영역 추가
<View style={styles.media}>
  {recipe.imageUri
    ? <Image source={{ uri: recipe.imageUri }} style={StyleSheet.absoluteFill} />
    : <View style={[StyleSheet.absoluteFill, { backgroundColor: cat.color + '1F' }]} />}
  <View style={[styles.badge, styles.badgeFloat]}>
    <Text style={[styles.badgeText, { color: cat.color }]}>{cat.emoji}  {cat.label}</Text>
  </View>
</View>

// styles 변경/추가:
card:   { borderRadius: 18, /* 14 → 18 */ ... },
media:  { aspectRatio: 4/3, backgroundColor: appleColors.surface2, position: 'relative' },
badgeFloat: {
  position: 'absolute', top: 12, left: 12,
  backgroundColor: 'rgba(255,253,250,0.92)',
  // 기존 badge 의 cat.color + '18' 대신 떠 있는 흰 배지
},
title:  { fontSize: 18, /* 16 → 18 */ fontWeight: '700', letterSpacing: -0.4 },
```

> 데이터 모델에 `imageUri?: string` 를 `Recipe` 타입에 추가하면 사진 연결 준비 완료.
> AI 추출/직접 입력에서 채울 수 있습니다.

### 4-2. CategoryFilter — 알약형 칩

`components/ui/CategoryFilter.tsx` 의 `chip` 스타일을 알약형으로:

```tsx
chip:        { height: 36, borderRadius: 18, paddingHorizontal: 14, borderWidth: 1 },
chipInactive:{ backgroundColor: appleColors.white, borderColor: appleColors.gray5 },
chipActive:  { backgroundColor: appleColors.gray1, borderColor: appleColors.gray1 },
// 선택된 카테고리 칩은 해당 카테고리 색으로 칠하면 더 좋습니다:
//   style={[styles.chip, isActive && { backgroundColor: cat.color, borderColor: cat.color }]}
//   text:  isActive ? '#fff' : ...
```

상단 그룹 탭(전체/요리/커피)의 활성 언더라인 색은 `appleColors.gray1` 유지(차콜).

### 4-3. 레시피 상세 — 풀블리드 히어로

`app/recipe/[id].tsx` 의 `hero` (현재: 옅은 색 배경 + 큰 이모지)를 **이미지 + 하단
그라데이션 + 흰 텍스트** 히어로로 바꾸면 가장 "앱다운" 인상을 줍니다. 사진이 없으면
카테고리 색 블록으로 폴백:

```tsx
<View style={styles.hero}>                                   {/* borderRadius 24, overflow hidden */}
  {recipe.imageUri
    ? <Image source={{ uri: recipe.imageUri }} style={StyleSheet.absoluteFill} />
    : <View style={[StyleSheet.absoluteFill, { backgroundColor: cat.color }]} />}
  <LinearGradient                                            {/* expo-linear-gradient */}
    colors={['transparent', 'rgba(15,10,4,0.7)']}
    style={StyleSheet.absoluteFill} />
  <View style={styles.heroContent}>                          {/* position absolute, bottom */}
    <View style={[styles.badge, { backgroundColor: cat.color }]}>
      <Text style={{ color:'#fff', fontWeight:'700' }}>{cat.emoji} {cat.label}</Text>
    </View>
    <Text style={styles.heroTitle}>{recipe.title}</Text>     {/* 38, '800', color:'#fff' */}
    {/* 분량 · 단계 · 시간 stat 행 (흰색) */}
  </View>
</View>
```

기존 재료/단계 섹션 구조는 그대로 두고, 단계 번호 사각형은 `borderRadius 11`,
배경 `appleColors.surface2`, 글자 `appleColors.gray1` 로 바꾸면 톤이 맞습니다.

### 4-4. 재료 체크리스트 (선택 enhancement)

상세 화면 재료 행에 체크 토글을 추가하면 "요리 중" 경험이 좋아집니다. `useState`
로컬 상태로 충분합니다:

```tsx
const [checked, setChecked] = useState<Record<string, boolean>>({});
// 각 행: <Pressable onPress={() => setChecked(c => ({...c, [item.id]: !c[item.id]}))}>
//   체크박스 21x21, on 이면 backgroundColor appleColors.gray1
//   체크 시 재료명 textDecorationLine:'line-through', color: gray3
```

### 4-5. FAB / 버튼 라운드

`app/index.tsx` 의 `fabExtended.borderRadius` 16 유지(좋음). 리뉴얼 버튼은 전반적으로
`borderRadius 13`(`btn`), 큰 버튼 `15`. Paper `Button` 은 `theme.roundness`(=5) 가
적용되므로 별도 조정이 거의 필요 없습니다.

---

## 5단계 · 토큰 매핑 표 (참조)

웹 프로토타입 CSS 변수 ↔ RN 테마 토큰 대응:

| 프로토타입 (CSS var) | Light 값 | Dark 값 | RN 매핑 |
|---|---|---|---|
| `--bg` | `#F1ECE3` | `#121008` | `colors.background`, `appleColors.gray6` |
| `--surface` | `#FFFDFA` | `#1E1B14` | `colors.surface`, `appleColors.white` |
| `--surface-2` | `#F7F3EC` | `#262219` | `colors.surfaceVariant`, `appleColors.surface2` |
| `--ink` | `#221F1A` | `#F2ECE0` | `colors.onSurface`, `appleColors.gray1`, `primary`(light) |
| `--ink-soft` | `#6A6155` | `#ABA290` | `appleColors.gray2`, `onSurfaceVariant` |
| `--ink-faint` | `#9A9488` | `#6E6655` | `appleColors.gray3` |
| `--line` | `#E4DCCF` | `#322D22` | `appleColors.gray5`, `outlineVariant` |
| `--line-strong` | `#D6CCBB` | `#423B2D` | `appleColors.gray4`, `outline` |
| `--accent-ink` (채움 버튼) | `#221F1A` | `#F2ECE0` | `colors.primary` |
| `--brand-accent` (강조) | `#E2574C` | `#F0786E` | `appleColors.accent` |
| 카드 radius | `18px` | — | `roundness 5` / 카드 18 |

세부 색조(타이머 트랙, 노트 카드 등)는 위 토큰의 조합/투명도로 파생시켰습니다.
예: 노트 카드 = `orange(#E0A02E) 8%` 틴트 + `orange 24%` 보더.

---

## 적용 순서 추천

1. **1단계(theme.ts)** 만 먼저 — 커밋하고 분위기 확인.
2. **2단계(카테고리 색)** — 빠르게.
3. **4-1(카드 이미지 영역)** + **4-2(칩)** — 체감 변화 큼.
4. 여유 있으면 **3단계(폰트)**, **4-3(히어로)**, **4-4(체크리스트)**.

각 단계는 독립적이라 중간에 멈춰도 일관됩니다. 질문이나 특정 화면 RN 코드 변환이
필요하면 말씀해 주세요 — 컴포넌트 단위로 더 구체적인 diff 를 만들어 드릴게요.
