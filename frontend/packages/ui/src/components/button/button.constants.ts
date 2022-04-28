import type {
  BackgroundsColors,
  BorderColors,
  Colors,
  Overlays,
} from '../../config/themes/types';

export const backgroundColors: Record<string, BackgroundsColors> = {
  primary: 'tertiary',
  secondary: 'primary',
};

export const hoverBackgroundColor: Record<string, Overlays> = {
  primary: 'lighten',
  secondary: 'darken',
};

export const activeBackgroundColor: Record<string, Overlays> = {
  primary: 'lighten',
  secondary: 'darken',
};

export const colors: Record<string, Colors> = {
  primary: 'quaternary',
  secondary: 'primary',
};

export const borderColors: Record<string, BorderColors> = {
  primary: 'transparent',
  secondary: 'primary',
};
