import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Apple-inspired color palette
export const appleColors = {
  blue: '#0071e3',
  blueDark: '#0077ED',
  gray1: '#1d1d1f',
  gray2: '#6e6e73',
  gray3: '#86868b',
  gray4: '#d2d2d7',
  gray5: '#e8e8ed',
  gray6: '#f5f5f7',
  white: '#ffffff',
  red: '#ff3b30',
  green: '#34c759',
  orange: '#ff9500',
  purple: '#af52de',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: appleColors.blue,
    onPrimary: '#ffffff',
    primaryContainer: '#ddeeff',
    onPrimaryContainer: appleColors.blue,
    secondary: appleColors.gray2,
    onSecondary: '#ffffff',
    secondaryContainer: appleColors.gray5,
    onSecondaryContainer: appleColors.gray1,
    background: appleColors.gray6,
    onBackground: appleColors.gray1,
    surface: appleColors.white,
    onSurface: appleColors.gray1,
    surfaceVariant: appleColors.gray6,
    onSurfaceVariant: appleColors.gray2,
    outline: appleColors.gray4,
    error: appleColors.red,
  },
  roundness: 3,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2997ff',
    onPrimary: '#ffffff',
    primaryContainer: '#003380',
    background: '#000000',
    surface: '#1c1c1e',
    surfaceVariant: '#2c2c2e',
    onSurface: '#f5f5f7',
    onSurfaceVariant: '#aeaeb2',
    outline: '#3a3a3c',
  },
  roundness: 3,
};
