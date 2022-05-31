import type { BackgroundColor, BorderColor, Color, Overlay } from 'styled';

export const buttonSizes = ['default', 'small', 'compact', 'large'];

export const backgroundColors: Record<string, BackgroundColor> = {
  primary: 'tertiary',
  secondary: 'primary',
};

export const hoverBackgroundColor: Record<string, Overlay> = {
  primary: 'lighten-1',
  secondary: 'darken-1',
};

export const activeBackgroundColor: Record<string, Overlay> = {
  primary: 'lighten-2',
  secondary: 'darken-2',
};

export const colors: Record<string, Color> = {
  primary: 'quinary',
  secondary: 'primary',
};

export const borderColors: Record<string, BorderColor> = {
  primary: 'transparent',
  secondary: 'primary',
};
