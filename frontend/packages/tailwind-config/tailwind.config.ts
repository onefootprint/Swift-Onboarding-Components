import type { Config } from 'tailwindcss';
import type { PluginAPI } from 'tailwindcss/types/config';

const primitiveColors = {
  gray: {
    0: '#ffffff',
    25: '#f7f7f7',
    50: '#f7f7f7',
    100: '#e2e2e2',
    150: '#d4d4d4',
    200: '#c6c6c6',
    300: '#a9a9a9',
    400: '#8d8d8d',
    500: '#707070',
    600: '#5a5a5a',
    700: '#444444',
    800: '#2d2d2d',
    825: '#242424',
    850: '#1E1E1E',
    875: '#1A1A1A',
    900: '#161616',
    950: '#0F0F0F',
    1000: '#000000',
  },
  red: {
    25: '#fffefd',
    50: '#FFF2F0',
    100: '#edd0ce',
    200: '#e5a19d',
    300: '#d9726c',
    400: '#cc433b',
    500: '#bf140a',
    600: '#991008',
    700: '#730c06',
    800: '#5e1e18',
  },
  yellow: {
    25: '#fffefd',
    50: '#fff8eb',
    100: '#fff2d9',
    200: '#fee5b5',
    300: '#ffd582',
    400: '#ffc759',
    500: '#ffa617',
    600: '#f28900',
    700: '#ba5d00',
    800: '#9b4e00',
    900: '#694a1a',
  },
  green: {
    25: '#f5fefd',
    50: '#e9f5f1',
    100: '#cee6de',
    200: '#9ecebe',
    300: '#6db59d',
    400: '#3d9d7d',
    500: '#0c845c',
    600: '#0a6a4a',
    700: '#074f37',
    800: '#053525',
  },
  blue: {
    25: '#f5f3fe',
    50: '#edf3fc',
    100: '#cee2f9',
    200: '#9ec5f3',
    300: '#6da7ee',
    400: '#3d8ae8',
    500: '#0c6de2',
    600: '#0a57b5',
    700: '#074188',
    800: '#0a305f',
  },
  purple: {
    25: '#f5f2fc',
    50: '#F5F2FC',
    100: '#ebe7fb',
    200: '#c3b6f3',
    300: '#9D8DEE',
    400: '#7A6AE1',
    450: '#6654c9',
    500: '#4a24db',
    600: '#3a1caa',
    700: '#29147a',
    800: '#190c49',
  },
  darkblue: {
    50: '#e4e6ec',
    100: '#bbc0d1',
    200: '#9098b2',
    300: '#677194',
    400: '#4a5580',
    500: '#2c3b6d',
    600: '#273466',
    700: '#1f2c5b',
    800: '#18234f',
    900: '#0e1438',
  },
  brand: {
    sleep: {
      100: '#F4F6FC',
      200: '#e9e9f2',
      300: '#b3b0d1',
      800: '#0e1438',
    },
    think: {
      500: '#cbc1f6',
      800: '#372680',
    },
    go: {
      500: '#76fb8f',
      800: '#0B857D',
    },
  },
};

const config: Omit<Config, 'content'> = {
  theme: {
    backgroundColor: {
      primary: primitiveColors.gray[0],
      secondary: primitiveColors.gray[50],
      tertiary: primitiveColors.brand.sleep[800],
      quaternary: primitiveColors.brand.think[500],
      quinary: primitiveColors.brand.go[500],
      senary: primitiveColors.gray[100],
      accent: primitiveColors.purple[500],
      error: primitiveColors.red[50],
      info: primitiveColors.blue[50],
      success: primitiveColors.green[50],
      warning: primitiveColors.yellow[50],
      neutral: primitiveColors.gray[50],
      active: primitiveColors.purple[50],
      infoInverted: primitiveColors.blue[600],
      successInverted: primitiveColors.green[600],
      warningInverted: primitiveColors.yellow[800],
      neutralInverted: primitiveColors.gray[800],
      errorInverted: primitiveColors.red[700],
      transparent: 'transparent',
    },
    textColor: {
      transparent: 'transparent',
      primary: primitiveColors.gray[1000],
      secondary: primitiveColors.gray[800],
      tertiary: primitiveColors.gray[500],
      quaternary: primitiveColors.gray[400],
      quinary: primitiveColors.gray[0],
      senary: primitiveColors.brand.think[500],
      septenary: primitiveColors.brand.go[500],
      accent: primitiveColors.purple[500],
      error: primitiveColors.red[600],
      info: primitiveColors.blue[600],
      success: primitiveColors.green[600],
      warning: primitiveColors.yellow[800],
      neutral: primitiveColors.gray[800],
      successInverted: primitiveColors.green[700],
      warningInverted: primitiveColors.yellow[700],
      errorInverted: primitiveColors.red[700],
      infoInverted: primitiveColors.blue[700],
      neutralInverted: primitiveColors.gray[700],
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-family-default)'],
        code: ['var(--font-family-code)'],
      },
    },
  },
  plugins: [
    ({ addUtilities }: PluginAPI) => {
      addUtilities({
        '.text-display-1': {
          fontWeight: '600',
          fontSize: '3.75rem',
          lineHeight: '4.75rem',
          letterSpacing: '-0.015em',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-display-2': {
          fontWeight: '600',
          fontSize: '2.5rem',
          lineHeight: '3.25rem',
          letterSpacing: '-0.015em',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-display-3': {
          fontWeight: '600',
          fontSize: '1.75rem',
          lineHeight: '2.25rem',
          letterSpacing: '-0.015em',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-display-4': {
          fontWeight: '400',
          fontSize: '1.3125rem',
          lineHeight: '2rem',
          letterSpacing: '-0.015em',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-display-5': {
          fontWeight: '400',
          fontSize: '1.1875rem',
          lineHeight: '1.875rem',
          letterSpacing: '-0.015em',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-heading-1': {
          fontWeight: '550',
          fontSize: '1.5rem',
          lineHeight: '2rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-heading-2': {
          fontWeight: '550',
          fontSize: '1.3125rem',
          lineHeight: '2rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-heading-3': {
          fontWeight: '550',
          fontSize: '1.125rem',
          lineHeight: '1.75rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-heading-4': {
          fontWeight: '550',
          fontSize: '1.0625rem',
          lineHeight: '1.75rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-heading-5': {
          fontWeight: '550',
          fontSize: '1rem',
          lineHeight: '1.5rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-body-1': {
          fontWeight: '400',
          fontSize: '1rem',
          lineHeight: '1.5rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-body-2': {
          fontWeight: '400',
          fontSize: '0.9375rem',
          lineHeight: '1.5rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-body-3': {
          fontWeight: '400',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-label-1': {
          fontWeight: '525',
          fontSize: '1rem',
          lineHeight: '1.5rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-label-2': {
          fontWeight: '525',
          fontSize: '0.9375rem',
          lineHeight: '1.5rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-label-3': {
          fontWeight: '525',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-caption-1': {
          fontWeight: '500',
          fontSize: '0.8125rem',
          lineHeight: '1rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-caption-2': {
          fontWeight: '400',
          fontSize: '0.8125rem',
          lineHeight: '1rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-caption-3': {
          fontWeight: '500',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-caption-4': {
          fontWeight: '400',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontFamily: 'var(--font-family-default)',
        },
        '.text-snippet-1': {
          fontWeight: '400',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          fontFamily: 'var(--font-family-code)',
        },
        '.text-snippet-2': {
          fontWeight: '400',
          fontSize: '0.8125rem',
          lineHeight: '1rem',
          fontFamily: 'var(--font-family-code)',
        },
        '.text-snippet-3': {
          fontWeight: '400',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontFamily: 'var(--font-family-code)',
        },
      });
    },
  ],
};

export default config;
