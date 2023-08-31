import * as c from '../primitives/color';
import * as e from '../primitives/elevation';

export const backgroundColor = {
  primary: `${c.Gray0}`,
  secondary: `${c.Gray50}`,
  tertiary: `${c.BrandSleep800}`,
  quaternary: `${c.BrandThink500}`,
  quinary: `${c.BrandGo500}`,
  senary: `${c.Gray100}`,
  accent: `${c.Purple500}`,
  error: `${c.Red50}`,
  info: `${c.Blue50}`,
  success: `${c.Green50}`,
  warning: `${c.Yellow50}`,
  neutral: `${c.Gray50}`,
  active: `${c.Purple50}`,
  infoInverted: `${c.Blue600}`,
  successInverted: `${c.Green600}`,
  warningInverted: `${c.Yellow800}`,
  neutralInverted: `${c.Gray800}`,
  errorInverted: `${c.Red700}`,
  transparent: 'transparent',
};

export const primaryBtnBackgroundColor = {
  default: `${c.Darkblue900}`,
  hover: `${c.Darkblue700}`,
  active: `${c.Darkblue600}`,
  disabled: `${c.Gray50}`,
};

export const secondaryBtnBackgroundColor = {
  default: `${c.Gray0}`,
  hover: `${c.Gray50}`,
  active: `${c.Gray50}`,
  disabled: `${c.Gray0}`,
};

export const borderColor = {
  primary: `${c.Gray150}`,
  primaryHover: `${c.Gray300}`,
  secondary: `${c.Purple500}`,
  tertiary: `${c.Gray100}`,
  tertiaryHover: `${c.Gray200}`,
  error: `${c.Red500}`,
  errorHover: `${c.Red600}`,
  transparent: 'transparent',
};

export const textColor = {
  primary: `${c.Gray1000}`,
  secondary: `${c.Gray800}`,
  tertiary: `${c.Gray500}`,
  quaternary: `${c.Gray400}`,
  quinary: `${c.Gray0}`,
  senary: `${c.BrandThink500}`,
  septenary: `${c.BrandGo500}`,
  accent: `${c.Purple500}`,
  accentHover: `${c.Purple700}`,
  error: `${c.Red600}`,
  errorHover: `${c.Red700}`,
  info: `${c.Blue600}`,
  infoHover: `${c.Blue700}`,
  success: `${c.Green600}`,
  successHover: `${c.Green700}`,
  warning: `${c.Yellow800}`,
  warningHover: `${c.Yellow900}`,
  neutral: `${c.Gray800}`,
  successInverted: `${c.Green50}`,
  warningInverted: `${c.Yellow100}`,
  errorInverted: `${c.Red50}`,
  infoInverted: `${c.Blue50}`,
  neutralInverted: `${c.Gray50}`,
};

export const surfaceColor = {
  1: `${c.Gray0}`,
  11: `${c.Gray50}`,
  2: `${c.Gray0}`,
  3: `${c.Gray0}`,
  4: `${c.Purple50}`,
  41: `${c.Purple100}`,
};

export const elevation = {
  0: `${e.onLightO}`,
  1: `${e.onLight1}`,
  2: `${e.onLight2}`,
  3: `${e.onLight3}`,
};

export const inputFocus = {
  none: 'none',
  default: '0px 0px 0px 4px rgba(74, 36, 219, 0.12);',
  error: '0px 0px 0px 4px rgba(191, 20, 10, 0.12);',
};

export const overlay = {
  default: 'rgba(0, 0, 0, 0.2)',
};
