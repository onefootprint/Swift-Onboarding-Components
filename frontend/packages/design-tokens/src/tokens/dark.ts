import * as c from '../primitives/color';
import * as e from '../primitives/elevation';

export const backgroundColor = {
  primary: `${c.Gray900}`,
  secondary: `${c.Gray800}`,
  tertiary: `${c.BrandSleep100}`,
  quaternary: `${c.BrandThink800}`,
  quinary: `${c.BrandGo800}`,
  senary: `${c.Gray700}`,
  accent: `${c.Purple300}`,
  error: `${c.Red800}`,
  info: `${c.Blue800}`,
  success: `${c.Green800}`,
  warning: `${c.Yellow900}`,
  neutral: `${c.Gray800}`,
  active: `${c.Gray700}`,
  transparent: 'transparent',
};

export const primaryBtnBackgroundColor = {
  default: `${c.BrandSleep100}`,
  hover: `${c.BrandSleep200}`,
  active: `${c.BrandSleep300}`,
  disabled: `${c.Gray800}`,
};

export const secondaryBtnBackgroundColor = {
  default: `${c.Gray900}`,
  hover: `${c.Gray800}`,
  active: `${c.Gray700}`,
  disabled: `${c.Gray900}`,
};

export const borderColor = {
  primary: `${c.Gray600}`,
  primaryHover: `${c.Gray400}`,
  secondary: `${c.Purple300}`,
  tertiary: `${c.Gray700}`,
  tertiaryHover: `${c.Gray500}`,
  error: `${c.Red300}`,
  errorHover: `${c.Red200}`,
  transparent: 'transparent',
};

export const textColor = {
  primary: `${c.Gray0}`,
  secondary: `${c.Gray100}`,
  tertiary: `${c.Gray300}`,
  quaternary: `${c.Gray400}`,
  quinary: `${c.Gray1000}`,
  senary: `${c.BrandThink800}`,
  septenary: `${c.BrandGo800}`,
  accent: `${c.Purple300}`,
  accentHover: `${c.Purple200}`,
  error: `${c.Red50}`,
  errorHover: `${c.Red100}`,
  info: `${c.Blue50}`,
  infoHover: `${c.Blue100}`,
  success: `${c.Green50}`,
  successHover: `${c.Green100}`,
  warning: `${c.Yellow100}`,
  warningHover: `${c.Yellow200}`,
  neutral: `${c.Gray50}`,
};

export const surfaceColor = {
  1: `${c.Gray875}`,
  11: `${c.Gray850}`,
  2: `${c.Gray850}`,
  3: `${c.Gray825}`,
  4: `${c.Gray875}`,
  41: `${c.Gray875}`,
};

export const elevation = {
  0: `${e.onDark0}`,
  1: `${e.onDark1}`,
  2: `${e.onDark2}`,
  3: `${e.onDark3}`,
};

export const inputFocus = {
  none: 'none',
  default: '0px 0px 0px 4px rgba(203, 192, 248, 0.12)',
  error: '0px 0px 0px 4px rgba(255, 157, 151, 0.12);',
};

export const overlay = {
  default: 'rgba(0, 0, 0, 0.7)',
};
