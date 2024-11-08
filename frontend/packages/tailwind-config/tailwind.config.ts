import type { Config } from 'tailwindcss';
import type { PluginAPI } from 'tailwindcss/types/config';

const config: Omit<Config, 'content'> = {
  theme: {
    backgroundColor: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
      quaternary: 'var(--bg-quaternary)',
      quinary: 'var(--bg-quinary)',
      senary: 'var(--bg-senary)',
      accent: 'var(--bg-accent)',
      error: 'var(--bg-error)',
      info: 'var(--bg-info)',
      success: 'var(--bg-success)',
      warning: 'var(--bg-warning)',
      neutral: 'var(--bg-neutral)',
      active: 'var(--bg-active)',
      infoInverted: 'var(--bg-info-inverted)',
      successInverted: 'var(--bg-success-inverted)',
      warningInverted: 'var(--bg-warning-inverted)',
      neutralInverted: 'var(--bg-neutral-inverted)',
      errorInverted: 'var(--bg-error-inverted)',
      transparent: 'var(--text-transparent)',
    },
    textColor: {
      transparent: 'var(--text-transparent)',
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      tertiary: 'var(--text-tertiary)',
      quaternary: 'var(--text-quaternary)',
      quinary: 'var(--text-quinary)',
      senary: 'var(--text-senary)',
      septenary: 'var(--text-septenary)',
      accent: 'var(--text-accent)',
      error: 'var(--text-error)',
      info: 'var(--text-info)',
      success: 'var(--text-success)',
      warning: 'var(--text-warning)',
      neutral: 'var(--text-neutral)',
      successInverted: 'var(--text-success-inverted)',
      warningInverted: 'var(--text-warning-inverted)',
      errorInverted: 'var(--text-error-inverted)',
      infoInverted: 'var(--text-info-inverted)',
      neutralInverted: 'var(--text-neutral-inverted)',
    },
    borderColor: {
      transparent: 'var(--border-transparent)',
      primary: 'var(--border-primary)',
      secondary: 'var(--border-secondary)',
      tertiary: 'var(--border-tertiary)',
      error: 'var(--border-error)',
    },
    borderRadius: {
      none: '0px',
      sm: '4px',
      DEFAULT: '6px',
      lg: '20px',
      rounded: '9999px',
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
