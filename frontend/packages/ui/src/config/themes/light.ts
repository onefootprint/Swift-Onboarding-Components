import { DefaultTheme } from './types';

const themeUiStates = {
  success: '#0C845C',
  info: '#0C6DE2',
  error: '#BF140A',
  warning: '#BA5D00',
};

const lightTheme: DefaultTheme = {
  illustrations: 'light',
  overlay: 'rgba(0, 0, 0, 0.4)',
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  disable: {
    opacity: 0.5,
  },
  borderRadius: {
    none: 0,
    round: 1000,
    base: 8,
    large: 16,
  },
  backgroundColors: {
    primary: '#000000',
    secondary: '#f7f7f7',
    tertiary: '#0e1438',
    quaternary: '#CBC1F6',
    quinary: '#76fb8f',
  },
  borderColors: {
    none: 'none',
    primary: '#E2E2E2',
    ...themeUiStates,
  },
  borderWidths: {
    none: 0,
    base: 1,
    large: 2,
  },
  colors: {
    primary: '#0e1438',
    secondary: '#2D2D2D',
    tertiary: '#5A5A5A',
    quaternary: '#FFFFFF',
    quinary: '#CBC1F6',
    senary: '#76fb8f',
    ...themeUiStates,
  },
  spacings: {
    none: 0,
    xTiny: 4,
    tiny: 8,
    xSmall: 12,
    small: 16,
    medium: 20,
    base: 24,
    large: 28,
    xLarge: 32,
    xxLarge: 40,
    xxxLarge: 56,
    xxxxLarge: 72,
  },
  boxShadows: {
    none: 'none',
    base: '0px 1px 6px rgba(0, 0, 0, 0.08)',
    dark: '0px 1px 8px rgba(0, 0, 0, 0.14)',
    darken: '0px 1px 10px rgba(0, 0, 0, 0.2)',
  },
  typographies: {
    'display-1': {
      fontSize: 60,
      lineHeight: 72,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'display-2': {
      fontSize: 40,
      lineHeight: 52,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'display-3': {
      fontSize: 28,
      lineHeight: 36,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'heading-1': {
      fontSize: 24,
      lineHeight: 32,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'heading-2': {
      fontSize: 21,
      lineHeight: 28,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'heading-3': {
      fontSize: 17,
      lineHeight: 24,
      fontFamily: 'DM Sans',
      fontWeight: 700,
    },
    'body-1': {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: 'DM Sans',
      fontWeight: 400,
    },
    'body-2': {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'DM Sans',
      fontWeight: 400,
    },
    'body-3': {
      fontSize: 15,
      lineHeight: 20,
      fontFamily: 'DM Sans',
      fontWeight: 400,
    },
    'body-4': {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'DM Sans',
      fontWeight: 400,
    },
    'label-1': {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'label-2': {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'DM Sans',
      fontWeight: 600,
    },
    'label-3': {
      fontSize: 15,
      lineHeight: 20,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'label-4': {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'caption-1': {
      fontSize: 13,
      lineHeight: 16,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
    'caption-2': {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'DM Sans',
      fontWeight: 500,
    },
  },
  zIndices: {
    sticky: 5,
    bottomSheet: 8,
    modal: 10,
  },
};

export default lightTheme;
