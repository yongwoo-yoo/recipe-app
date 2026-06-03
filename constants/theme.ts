import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

export const appleColors = {
  accent: '#E2574C',
  accentDark: '#F0786E',
  blue: '#E2574C',      // alias for legacy references
  blueDark: '#F0786E',

  gray1: '#221F1A',
  gray2: '#6A6155',
  gray3: '#9A9488',
  gray4: '#D6CCBB',
  gray5: '#E4DCCF',
  gray6: '#F1ECE3',

  surface2: '#F7F3EC',
  white: '#FFFDFA',

  red: '#E2574C',
  green: '#10A37F',
  orange: '#E0A02E',
  purple: '#8B7CE8',
};

const fonts = configureFonts({ config: { fontFamily: 'Pretendard' } });

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
    primary: '#F2ECE0',
    onPrimary: '#1A1710',
    primaryContainer: '#2A251C',
    onPrimaryContainer: '#F2ECE0',
    secondary: '#ABA290',
    background: '#121008',
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
