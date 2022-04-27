import { DefaultTheme } from './types';

const secondaryPalette = {
  camelotLight: '#FEEFF3',
  camelotBase: '#EECAD3',
  camelotDark: '#E0A2B3',
  camelotDarken: '#91364E',
  pomegranateLight: '#FAC4BF',
  pomegranateBase: '#F4766B',
  pomegranateDark: '#F14F41',
  pomegranateDarken: '#EF2917',
  capriSunLight: '#FFEFD9',
  capriSunBase: '#FFBE69',
  capriSunDark: '#FFAB3E',
  capriSunDarken: '#FF9914',
  marinerLight: '#EBF7FB',
  marinerBase: '#9FCEE9',
  marinerDark: '#52AFE3',
  marinerDarken: '#2370B7',
  indigoLight: '#E8EEFD',
  indigoBase: '#A1B2E0',
  indigoDark: '#6C87CF',
  indigoDarken: '#5046C2',
  amethystLight: '#F4EAF8',
  amethystBase: '#E4CAEE',
  amethystDark: '#D0A3E1',
  amethystDarken: '#B46CCF',
};

const themeUiStates = {
  success: '#4FC366',
  info: '#7FB0FA',
  error: '#FF6C42',
};

const darkTheme: DefaultTheme = {
  illustrations: 'dark',
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
    large: 24,
  },
  backgroundColors: {
    primary: '#1E1E1E',
    secondary: '#4FC366',
    elevated: '#2F2F32',
  },
  borderColors: {
    none: 'none',
    transparent: 'transparent',
    primary: '#373737',
    secondary: '#A8A8A8',
    tertiary: '#4FC366',
    quaternary: '#FFFFFF',
    ...themeUiStates,
  },
  borderWidths: {
    none: 0,
    base: 1,
    large: 2,
  },
  shapeFills: {
    transparent: 'transparent',
    primary: '#FFFFFF',
    secondary: '#4FC366',
    tertiary: '#A8A8A8',
    quaternary: '#808080',
    quinary: '#404040',
    senary: '#1E1E1E',
    septenary: '#FFFFFF',
    ...themeUiStates,
    ...secondaryPalette,
  },
  colors: {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    tertiary: '#4FC366',
    quaternary: '#A8A8A8',
    quinary: '#808080',
    senary: '#1E1E1E',
    ...themeUiStates,
    ...secondaryPalette,
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

export default darkTheme;
