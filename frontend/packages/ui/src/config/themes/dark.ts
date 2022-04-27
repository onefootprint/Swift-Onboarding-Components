import { DefaultTheme } from './types';

const themeUiStates = {
  success: '#6db59d',
  info: '#6da7ee',
  error: '#d9726c',
  warning: '#fff2d9',
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
    primary: '#161616',
    secondary: '#212121',
    tertiary: '#F4F6FC',
    quaternary: '#372680',
    quinary: '#187A2C',
  },
  borderColors: {
    none: 'none',
    primary: '#404040',
    ...themeUiStates,
  },
  borderWidths: {
    none: 0,
    base: 1,
    large: 2,
  },
  colors: {
    primary: '#F4F6FC',
    secondary: '#E8E8E8',
    tertiary: '#CCCCCC',
    quaternary: '#161616',
    quinary: '#372680',
    senary: '#187A2C',
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
