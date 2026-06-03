# 오늘의레시피 Warm Paper 리뉴얼 — Claude Code 자동 적용

이 파일을 `recipe-app` 저장소 루트에 놓고, Claude Code 에게
"APPLY_RENEWAL.md 를 보고 리뉴얼 적용해줘" 라고 하면 됩니다.

---

## 작업 목표

기존 쿨그레이 + 애플블루 팔레트를 **따뜻한 페이퍼톤 + 테라코타 강조색** 으로 바꾸는
리뉴얼을 아래 파일들에 적용합니다. UI 구조·기능·타입은 건드리지 않습니다.

---

## Task 1 — `constants/theme.ts` 전체 교체

아래 내용으로 **파일 전체를 교체**하세요:

```typescript
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

export const appleColors = {
  // 인터랙티브 강조색 (기존 파랑 자리 — 헤더 틴트, 링크)
  accent: '#E2574C',
  accentDark: '#F0786E',
  blue: '#E2574C',      // 기존 참조 호환 별칭
  blueDark: '#F0786E',

  // 잉크 스케일
  gray1: '#221F1A',     // 본문/제목 · 채움 버튼 · 단계 번호
  gray2: '#6A6155',     // 보조 텍스트
  gray3: '#9A9488',     // 비활성 / placeholder

  // 보더 / 면
  gray4: '#D6CCBB',     // 진한 보더
  gray5: '#E4DCCF',     // 옅은 보더 / 구분선
  gray6: '#F1ECE3',     // 앱 배경 (warm paper)

  surface2: '#F7F3EC',
  white: '#FFFDFA',     // 카드 표면

  // 시맨틱
  red: '#E2574C',
  green: '#10A37F',
  orange: '#E0A02E',
  purple: '#8B7CE8',
};

const fontFamily = 'Pretendard';
const fonts = configureFonts({ config: { fontFamily } });

export const lightTheme = {
  ...MD3LightTheme,
  fonts,
  roundness: 5,
  colors: {
    ...MD3LightTheme.colors,
    primary: appleColors.gray1,
    onPrimary: '#FBF7F0',
    primaryContainer: '#EFE6D8',
    onPrimaryContainer: appleColors.gray1,
    secondary: appleColors.gray2,
    onSecondary: '#ffffff',
    secondaryContainer: appleColors.gray5,
    onSecondaryContainer: appleColors.gray1,
    background: appleColors.gray6,
    onBackground: appleColors.gray1,
    surface: appleColors.white,
    onSurface: appleColors.gray1,
    surfaceVariant: appleColors.surface2,
    onSurfaceVariant: appleColors.gray2,
    outline: appleColors.gray4,
    outlineVariant: appleColors.gray5,
    error: appleColors.red,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts,
  roundness: 5,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#F2ECE0',
    onPrimary: '#1A1710',
    primaryContainer: '#2A251C',
    onPrimaryContainer: '#F2ECE0',
    background: '#121008',
    onBackground: '#F2ECE0',
    surface: '#1E1B14',
    onSurface: '#F2ECE0',
    surfaceVariant: '#262219',
    onSurfaceVariant: '#ABA290',
    outline: '#322D22',
    outlineVariant: '#2A251C',
    error: '#F0786E',
  },
};
```

---

## Task 2 — `constants/categories.ts` 의 색 값만 교체

`CATEGORIES` 배열에서 각 항목의 `color` 값을 아래 값으로 교체하세요.
`id`, `label`, `emoji`, 나머지 코드는 건드리지 마세요.

```
korean:      '#E2574C'
western:     '#2BB6A8'
japanese:    '#E0A02E'
chinese:     '#D9683F'
dessert:     '#8B7CE8'
espresso:    '#6C5CE7'
hand-drip:   '#10A37F'
cold-brew:   '#4F9DF0'
other:       '#9B9488'
```

---

## Task 3 — `app/_layout.tsx` 헤더 색 조정

`headerTintColor: appleColors.blue` 를 찾아서 아래로 교체하세요:

```typescript
headerTintColor: appleColors.accent,
```

(파일 내 `appleColors.blue` 가 여러 군데 있으면 전부 `appleColors.accent` 로 바꾸세요.
`theme.ts` 에 `accent` 키가 추가됐으므로 오류가 나지 않습니다.)

---

## Task 4 — `components/recipe/RecipeCard.tsx` 이미지 영역 추가

기존: 색 액센트 바(`accentBar`) + 텍스트  
변경: **이미지 영역(4:3 aspectRatio) + 위에 떠 있는 배지**

`RecipeCard` 함수 내 `<View style={styles.card}>` 자식 구조를 아래로 교체하세요:

```tsx
<View style={styles.card}>
  {/* 미디어 영역 */}
  <View style={styles.media}>
    <View style={[StyleSheet.absoluteFill, { backgroundColor: cat.color + '22' }]} />
    <Text style={styles.mediaEmoji}>{cat.emoji}</Text>
    <View style={[styles.badge, { backgroundColor: cat.color + '18' }]}>
      <Text style={[styles.badgeText, { color: cat.color }]}>
        {cat.emoji}  {cat.label}
      </Text>
    </View>
  </View>

  {/* 텍스트 영역 (기존 content 유지) */}
  <View style={styles.content}>
    <Text style={[styles.title, { color: theme.colors.onSurface }]} numberOfLines={2}>
      {recipe.title}
    </Text>
    {recipe.description ? (
      <Text style={[styles.desc, { color: appleColors.gray2 }]} numberOfLines={2}>
        {recipe.description}
      </Text>
    ) : null}
    <View style={styles.footer}>
      {recipe.ingredients.length > 0 && (
        <Text style={styles.meta}>{recipe.ingredients.length}가지 재료</Text>
      )}
      <Text style={styles.meta}>·</Text>
      <Text style={styles.meta}>{recipe.steps.length}단계</Text>
      {recipe.steps.some((s) => s.timer) && (
        <>
          <Text style={styles.meta}>·</Text>
          <Text style={styles.meta}>⏱ 타이머</Text>
        </>
      )}
    </View>
  </View>
</View>
```

`styles` 에서 `accentBar` 를 제거하고 아래를 추가/수정하세요:

```typescript
card:      { borderRadius: 18, overflow: 'hidden', /* 기존 shadow 유지 */ },
media:     { aspectRatio: 4/3, position: 'relative', alignItems: 'center', justifyContent: 'center' },
mediaEmoji:{ fontSize: 52, opacity: 0.55 },
badge:     { position: 'absolute', top: 12, left: 12, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
title:     { fontSize: 17, fontWeight: '700', letterSpacing: -0.4, lineHeight: 23 },
```

---

## Task 5 — `components/ui/CategoryFilter.tsx` 칩 알약형으로

`styles` 의 `chip`, `chipActive`, `chipInactive` 를 교체하세요:

```typescript
chip: {
  height: 36,
  borderRadius: 18,     // 15 → 18 (알약형)
  paddingHorizontal: 14,
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  borderWidth: 1,
},
chipActive: {
  backgroundColor: appleColors.gray1,   // 기존 유지 (차콜)
  borderColor: appleColors.gray1,
},
chipInactive: {
  backgroundColor: 'transparent',
  borderColor: appleColors.gray5,       // gray4 → gray5 (더 옅게)
},
chipText:       { fontSize: 13.5, fontWeight: '600', color: appleColors.gray2 },
chipTextActive: { color: '#FBF7F0' },
```

카테고리별 색 칩을 원하면 활성 칩 스타일을 아래처럼 동적으로:

```tsx
style={[
  styles.chip,
  isActive
    ? { backgroundColor: cat.color, borderColor: cat.color }
    : styles.chipInactive,
]}
```

---

## Task 6 — `app/recipe/[id].tsx` 히어로 영역 개선

기존 `hero` View(이모지 + 제목 + 배지) 를 아래로 교체하세요.
`expo-linear-gradient` 패키지가 필요합니다(`npx expo install expo-linear-gradient`):

```tsx
import { LinearGradient } from 'expo-linear-gradient';

{/* hero 영역 — 기존 styles.hero 를 아래 스타일로 교체 */}
<View style={styles.hero}>
  {/* 배경: 카테고리 색 블록 (실제 사진으로 교체 가능) */}
  <View style={[StyleSheet.absoluteFill, { backgroundColor: cat.color + '30' }]} />
  <Text style={styles.heroEmojiBg}>{cat.emoji}</Text>

  <LinearGradient
    colors={['transparent', 'rgba(15,10,4,0.65)']}
    style={StyleSheet.absoluteFill}
  />
  <View style={styles.heroContent}>
    <View style={[styles.badge, { backgroundColor: cat.color }]}>
      <Text style={styles.badgeText}>{cat.label}</Text>
    </View>
    <Text style={styles.heroTitle}>{recipe.title}</Text>
    {recipe.description ? (
      <Text style={styles.heroDesc}>{recipe.description}</Text>
    ) : null}
    <View style={styles.heroStats}>
      {recipe.servings ? <Text style={styles.stat}>👤 {recipe.servings}</Text> : null}
      <Text style={styles.stat}>📋 {recipe.steps.length}단계</Text>
    </View>
  </View>
</View>
```

`styles.hero` 등 교체:

```typescript
hero:         { borderRadius: 20, overflow: 'hidden', marginHorizontal: 16, marginTop: 12, aspectRatio: 16/7 },
heroBg:       { ...StyleSheet.absoluteFillObject },
heroEmojiBg:  { fontSize: 110, opacity: 0.18, position: 'absolute', bottom: -10, right: 10 },
heroContent:  { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 24 },
heroTitle:    { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginTop: 10, lineHeight: 36 },
heroDesc:     { fontSize: 15, color: 'rgba(255,255,255,0.88)', marginTop: 8, lineHeight: 22 },
heroStats:    { flexDirection: 'row', gap: 16, marginTop: 14 },
stat:         { fontSize: 13.5, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
badge:        { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
badgeText:    { fontSize: 12.5, fontWeight: '700', color: '#fff' },
```

---

## Task 7 (선택) — Pretendard 폰트 로드

1. `assets/fonts/` 폴더를 만들고
   [Pretendard 릴리스](https://github.com/orioncactus/pretendard/releases) 에서
   `Pretendard-Regular.otf`, `Pretendard-SemiBold.otf`, `Pretendard-Bold.otf` 를 받아 넣으세요.

2. `app/_layout.tsx` 의 `RootLayout` (or `RootLayoutInner`) 안에 추가:

```typescript
import { useFonts } from 'expo-font';

const [fontsLoaded] = useFonts({
  'Pretendard':          require('../assets/fonts/Pretendard-Regular.otf'),
  'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
  'Pretendard-Bold':     require('../assets/fonts/Pretendard-Bold.otf'),
});
// fontsLoaded 가 false 이면 return null (SplashScreen.preventAutoHideAsync 와 함께)
```

   `theme.ts` 에 이미 `configureFonts({ config: { fontFamily: 'Pretendard' } })` 가
   들어 있으므로 폰트가 로드되면 Paper 컴포넌트 전체에 자동 적용됩니다.

---

## 검증 체크리스트

작업이 끝나면 아래를 확인하세요:

- [ ] 앱 배경이 `#F1ECE3` (따뜻한 크림톤) 으로 바뀌었다
- [ ] 헤더 뒤로가기 버튼·링크 색이 테라코타(`#E2574C`) 다
- [ ] 레시피 카드에 4:3 미디어 영역이 생겼다
- [ ] 카테고리 칩이 알약형이다
- [ ] 채움 버튼(저장·추가)이 차콜(`#221F1A`) 이다
- [ ] 다크모드 배경이 따뜻한 검정(`#121008`) 이다
- [ ] TypeScript 오류 없음 (`npx tsc --noEmit`)
