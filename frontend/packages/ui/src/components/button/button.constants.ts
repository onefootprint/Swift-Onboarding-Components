import type { BackgroundsColor, BorderColor, Color, Overlay } from 'styled';

export const backgroundColors: Record<string, BackgroundsColor> = {
  primary: 'tertiary',
  secondary: 'primary',
};

export const hoverBackgroundColor: Record<string, Overlay> = {
  primary: 'lighten',
  secondary: 'darken',
};

export const activeBackgroundColor: Record<string, Overlay> = {
  primary: 'lighten',
  secondary: 'darken',
};

export const colors: Record<string, Color> = {
  primary: 'quinary',
  secondary: 'primary',
};

export const borderColors: Record<string, BorderColor> = {
  primary: 'transparent',
  secondary: 'primary',
};
