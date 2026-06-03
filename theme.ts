import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

/**
 * ─────────────────────────────────────────────────────────────────────────
 *  오늘의레시피 — Warm Paper 리뉴얼 테마
 *  constants/theme.ts 를 이 파일로 교체하세요.
 *
 *  핵심: appleColors 의 "키 이름"은 그대로 유지하고 "값"만 따뜻한 톤으로
 *  바꿨습니다. 따라서 appleColors.gray6 / gray1 등을 참조하는 기존
 *  컴포넌트는 수정 없이 전부 새 팔레트로 갱신됩니다.
 *
 *  단 한 가지만 바뀌었습니다:
 *   - 인터랙티브 강조색이 파랑 → 테라코타(#E2574C) 로 바뀌면서
 *     appleColors.blue 의 값이 테라코타가 됩니다. 의미를 명확히 하려면
 *     코드 전체에서 appleColors.blue → appleColors.accent 로 한 번만
 *     find/replace 하는 것을 권장합니다(별칭으로 둘 다 동작하게 했습니다).
 * ─────────────────────────────────────────────────────────────────────────
 */

export const appleColors = {
  // 인터랙티브 강조색 — 기존 파랑 자리. (헤더 틴트, 링크, 포커스)
  accent: '#E2574C',
  accentDark: '#F0786E',
  blue: '#E2574C',      // ← 별칭(기존 참조 호환). 가능하면 accent 로 교체.
  blueDark: '#F0786E',

  // 잉크 스케일 (따뜻한 차콜 → 따뜻한 그레이)
  gray1: '#221F1A',     // 본문/제목 잉크 · 채움 버튼 · 단계 번호 · 활성 칩
  gray2: '#6A6155',     // 보조 텍스트
  gray3: '#9A9488',     // 비활성 / placeholder

  // 라인 / 면
  gray4: '#D6CCBB',     // 진한 보더 (입력창, outline)
  gray5: '#E4DCCF',     // 옅은 보더 / 구분선
  gray6: '#F1ECE3',     // 앱 배경 (warm paper)

  surface2: '#F7F3EC',  // 가라앉은 면 / surfaceVariant
  white: '#FFFDFA',     // 카드 표면 (warm white)

  // 시맨틱
  red: '#E2574C',
  green: '#10A37F',
  orange: '#E0A02E',
  purple: '#8B7CE8',
};

// react-native-paper 폰트: 전체에 Pretendard 적용 (assets 로드는 가이드 참고)
const fontFamily = 'Pretendard';
const fonts = configureFonts({
  config: {
    fontFamily,
    // 굵기별 매핑이 필요하면 아래처럼 확장:
    // bold:   { fontFamily: 'Pretendard-Bold' },
    // medium: { fontFamily: 'Pretendard-Medium' },
  },
});

export const lightTheme = {
  ...MD3LightTheme,
  fonts,
  roundness: 5, // 3 → 5 : 리뉴얼은 더 둥근 카드를 사용
  colors: {
    ...MD3LightTheme.colors,
    primary: appleColors.gray1,            // 채움 버튼/단계 번호/활성 칩 = 따뜻한 차콜
    onPrimary: '#FBF7F0',
    primaryContainer: '#EFE6D8',           // 타이머 등 톤 배경 (기존 연파랑 자리)
    onPrimaryContainer: appleColors.gray1,
    secondary: appleColors.gray2,
    onSecondary: '#ffffff',
    secondaryContainer: appleColors.gray5,
    onSecondaryContainer: appleColors.gray1,
    background: appleColors.gray6,          // #F1ECE3 warm paper
    onBackground: appleColors.gray1,
    surface: appleColors.white,             // #FFFDFA warm white
    onSurface: appleColors.gray1,
    surfaceVariant: appleColors.surface2,   // #F7F3EC
    onSurfaceVariant: appleColors.gray2,
    outline: appleColors.gray4,
    outlineVariant: appleColors.gray5,
    error: appleColors.red,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: appleColors.white,
      level2: '#FBF7F0',
    },
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts,
  roundness: 5,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#F2ECE0',                     // 다크: 채움 버튼 = 밝은 웜화이트
    onPrimary: '#1A1710',
    primaryContainer: '#2A251C',
    onPrimaryContainer: '#F2ECE0',
    secondary: '#ABA290',
    background: '#121008',                   // warm black
    onBackground: '#F2ECE0',
    surface: '#1E1B14',
    onSurface: '#F2ECE0',
    surfaceVariant: '#262219',
    onSurfaceVariant: '#ABA290',
    outline: '#322D22',
    outlineVariant: '#2A251C',
    error: '#F0786E',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: '#1E1B14',
      level2: '#262219',
    },
  },
};
