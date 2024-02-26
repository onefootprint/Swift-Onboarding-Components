import * as p from '../../../primitives';
import { elevationDark } from '../../../primitives/elevation';
import type { Tokens } from '../../../types/tokens';

export const backgroundColor = {
  primary: `${p.Gray900}`,
  secondary: `${p.Gray800}`,
  tertiary: `${p.BrandSleep100}`,
  quaternary: `${p.BrandThink800}`,
  quinary: `${p.BrandGo800}`,
  senary: `${p.Gray700}`,
  accent: `${p.Purple300}`,
  error: `${p.Red800}`,
  info: `${p.Blue800}`,
  success: `${p.Green800}`,
  warning: `${p.Yellow900}`,
  neutral: `${p.Gray800}`,
  active: `${p.Gray700}`,
  infoInverted: `${p.Blue100}`,
  successInverted: `${p.Green200}`,
  warningInverted: `${p.Yellow200}`,
  neutralInverted: `${p.Gray200}`,
  errorInverted: `${p.Red200}`,
  transparent: 'transparent',
};

export const primaryBtnBackgroundColor = {
  default: `${p.Purple300}`,
  hover: `${p.Purple400}`,
  active: `${p.Purple300}`,
  disabled: `${p.Gray875}`,
};

export const secondaryBtnBackgroundColor = {
  default: `transparent`,
  hover: `${p.Gray800}`,
  active: `${p.Gray700}`,
  disabled: `${p.Gray900}`,
};

export const primaryBtnBorderColor = {
  default: `${p.Purple600}`,
  hover: `${p.Purple600}`,
  active: `${p.Purple600}`,
  disabled: `${p.Purple400}`,
};

export const destructiveBtnBackgroundColor = {
  default: `${p.Red300}`,
  hover: `${p.Red600}`,
  active: `${p.Red300}`,
  disabled: `${p.Red800}`,
};

export const destructiveBtnBorderColor = {
  default: `${p.Red600}`,
  hover: `${p.Red600}`,
  active: `${p.Red600}`,
  disabled: `${p.Red400}`,
};

export const borderColor = {
  primary: `${p.Gray600}`,
  primaryHover: `${p.Gray400}`,
  secondary: `${p.Purple300}`,
  tertiary: `${p.Gray700}`,
  tertiaryHover: `${p.Gray500}`,
  error: `${p.Red300}`,
  errorHover: `${p.Red200}`,
  transparent: 'transparent',
};

export const textColor = {
  primary: `${p.Gray0}`,
  secondary: `${p.Gray100}`,
  tertiary: `${p.Gray300}`,
  quaternary: `${p.Gray400}`,
  quinary: `${p.Gray1000}`,
  senary: `${p.BrandThink800}`,
  septenary: `${p.BrandGo800}`,
  accent: `${p.Purple300}`,
  accentHover: `${p.Purple200}`,
  error: `${p.Red50}`,
  errorHover: `${p.Red100}`,
  info: `${p.Blue50}`,
  infoHover: `${p.Blue100}`,
  success: `${p.Green50}`,
  successHover: `${p.Green100}`,
  warning: `${p.Yellow100}`,
  warningHover: `${p.Yellow200}`,
  neutral: `${p.Gray50}`,
  successInverted: `${p.Green700}`,
  warningInverted: `${p.Yellow800}`,
  errorInverted: `${p.Red700}`,
  infoInverted: `${p.Blue700}`,
  neutralInverted: `${p.Gray800}`,
};

export const surfaceColor = {
  1: `${p.Gray875}`,
  11: `${p.Gray850}`,
  2: `${p.Gray850}`,
  3: `${p.Gray825}`,
  4: `${p.Gray875}`,
  41: `${p.Gray875}`,
};

export const elevation = {
  0: `${elevationDark.flat}`,
  1: `${elevationDark.low}`,
  2: `${elevationDark.medium}`,
  3: `${elevationDark.high}`,
  4: `${elevationDark.extraHigh}`,
};

export const inputFocus = {
  none: 'none',
  default: `0px 0px 0px 4px ${p.BrandSleep100}1C`,
  error: `0px 0px 0px 4px ${p.Red300}1C`,
};

export const overlay = {
  default: 'rgba(0, 0, 0, 0.7)',
};

export const primaryBtnBoxShadow = {
  none: 'none',
  default: `0px 1px 2px 1px rgba(0, 0, 0, 0.24),
  inset 0px -1px 1px rgba(200, 200, 200, 0.2),
  inset 0px 1px 1px rgba(255, 255, 255, 0.2);`,
  hover: `0px 1px 2px 0px rgba(0, 0, 0, 0.24),
  inset 0px -1px 1px rgba(200, 200, 200, 0.1),
  inset 0px 1px 1px rgba(255, 255, 255, 0.3);`,
  active: `0px 1px 2px 0px rgba(0, 0, 0, 0.24),
  inset 0px -1px 1px rgba(200, 200, 200, 0.1),
  inset 0px 1px 1px rgba(255, 255, 255, 0.2);`,
  disabled: 'none',
};

export const secondaryBtnBoxShadow = {
  default: `0px 0.5px 2px 1px rgba(0, 0, 0, 0.12),
  inset 0px -1px 1px rgba(200, 200, 200, 0.2),
  inset 0px 1px 1px rgba(255, 255, 255, 0.2);`,
  hover: `0px 1px 2px 0px rgba(0, 0, 0, 0.2),
  inset 0px -1px 1px rgba(200, 200, 200, 0.12),
  inset 0px 1px 1px rgba(255, 255, 255, 0.3);`,
  active: `0px 1px 2px 0px rgba(0, 0, 0, 0.12),
  inset 0px -1px 1px rgba(200, 200, 200, 0.1),
  inset 0px 1px 1px rgba(255, 255, 255, 0.2);`,
  disabled: 'none',
};

const tokens: Tokens = {
  backgroundColor,
  primaryBtnBackgroundColor,
  secondaryBtnBackgroundColor,
  destructiveBtnBackgroundColor,
  borderColor,
  textColor,
  surfaceColor,
  elevation,
  inputFocus,
  overlay,
  codeHighlight: {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      color: '#ffffff',
      background: '#fafafa',
    },
    'hljs-comment': {
      color: '#8b949e',
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: '#8b949e',
      fontStyle: 'italic',
    },
    'hljs-doctag': {
      color: '#d2a8ff',
    },
    'hljs-keyword': {
      color: '#d2a8ff',
    },
    'hljs-formula': {
      color: '#d2a8ff',
    },
    'hljs-section': {
      color: '#ff7b72',
    },
    'hljs-name': {
      color: '#ff7b72',
    },
    'hljs-selector-tag': {
      color: '#ff7b72',
    },
    'hljs-deletion': {
      color: '#ff7b72',
    },
    'hljs-subst': {
      color: '#ff7b72',
    },
    'hljs-literal': {
      color: '#0184bb',
    },
    'hljs-string': {
      color: '#50a14f',
    },
    'hljs-regexp': {
      color: '#50a14f',
    },
    'hljs-addition': {
      color: '#50a14f',
    },
    'hljs-attribute': {
      color: '#50a14f',
    },
    'hljs-meta-string': {
      color: '#50a14f',
    },
    'hljs-built_in': {
      color: '#c18401',
    },
    'hljs-class .hljs-title': {
      color: '#c18401',
    },
    'hljs-attr': {
      color: '#ffa657',
    },
    'hljs-variable': {
      color: '#ffa657',
    },
    'hljs-template-variable': {
      color: '#ffa657',
    },
    'hljs-type': {
      color: '#ffa657',
    },
    'hljs-selector-class': {
      color: '#ffa657',
    },
    'hljs-selector-attr': {
      color: '#ffa657',
    },
    'hljs-selector-pseudo': {
      color: '#ffa657',
    },
    'hljs-number': {
      color: '#ffa657',
    },
    'hljs-symbol': {
      color: '#79c0ff',
    },
    'hljs-bullet': {
      color: '#79c0ff',
    },
    'hljs-link': {
      color: '#79c0ff',
      textDecoration: 'underline',
    },
    'hljs-meta': {
      color: '#79c0ff',
    },
    'hljs-selector-id': {
      color: '#79c0ff',
    },
    'hljs-title': {
      color: '#79c0ff',
    },
    'hljs-emphasis': {
      fontStyle: 'italic',
    },
    'hljs-strong': {
      fontWeight: 'bold',
    },
  },
  components: {
    bifrost: {
      fpButton: {
        height: '48px',
        borderRadius: p.borderRadius.default,
      },
      overlay: {
        bg: overlay.default,
      },
      loading: {
        bg: 'rgba(0, 0, 0, 0.6)',
        borderRadius: p.borderRadius.compact,
        color: textColor.primary,
        padding: p.spacing[5],
      },
      container: {
        bg: surfaceColor[3],
        border: `1px solid ${borderColor.tertiary}`,
        borderRadius: p.borderRadius.default,
        elevation: elevation[3],
      },
    },
    button: {
      borderRadius: p.borderRadius.default,
      borderWidth: p.borderWidth[1],
      transition: 'background-color 0.1s ease-in-out',
      variant: {
        primary: {
          bg: primaryBtnBackgroundColor.default,
          color: textColor.quinary,
          borderColor: 'transparent',
          boxShadow: primaryBtnBoxShadow.default,
          hover: {
            bg: primaryBtnBackgroundColor.hover,
            color: textColor.quinary,
            borderColor: 'transparent',
            boxShadow: primaryBtnBoxShadow.hover,
          },
          active: {
            bg: primaryBtnBackgroundColor.active,
            color: textColor.quinary,
            borderColor: 'transparent',
            boxShadow: primaryBtnBoxShadow.active,
          },
          loading: {
            bg: primaryBtnBackgroundColor.default,
            color: textColor.quinary,
          },
          disabled: {
            bg: primaryBtnBackgroundColor.disabled,
            color: textColor.quaternary,
            borderColor: 'transparent',
            boxShadow: primaryBtnBoxShadow.disabled,
          },
        },
        secondary: {
          bg: secondaryBtnBackgroundColor.default,
          color: textColor.primary,
          borderColor: borderColor.primary,
          boxShadow: secondaryBtnBoxShadow.default,
          hover: {
            bg: secondaryBtnBackgroundColor.hover,
            color: textColor.primary,
            borderColor: borderColor.primary,
          },
          active: {
            bg: secondaryBtnBackgroundColor.active,
            color: textColor.primary,
            borderColor: borderColor.primary,
          },
          loading: {
            bg: secondaryBtnBackgroundColor.default,
            color: textColor.primary,
          },
          disabled: {
            bg: secondaryBtnBackgroundColor.disabled,
            color: textColor.quaternary,
            borderColor: borderColor.tertiary,
          },
        },
        destructive: {
          bg: destructiveBtnBackgroundColor.default,
          color: textColor.quinary,
          borderColor: 'transparent',
          hover: {
            bg: destructiveBtnBackgroundColor.hover,
            color: textColor.quinary,
            borderColor: 'transparent',
          },
          active: {
            bg: destructiveBtnBackgroundColor.active,
            color: textColor.quinary,
            borderColor: 'transparent',
          },
          loading: {
            bg: destructiveBtnBackgroundColor.default,
            color: textColor.quinary,
          },
          disabled: {
            bg: destructiveBtnBackgroundColor.disabled,
            color: textColor.quaternary,
            borderColor: 'transparent',
          },
        },
      },
      size: {
        large: {
          height: p.buttonHeights.large,
          paddingHorizontal: p.spacing[7],
          typography: p.typography['label-1'],
        },
        compact: {
          height: p.buttonHeights.compact,
          paddingHorizontal: p.spacing[7],
          typography: p.typography['label-3'],
        },
        small: {
          height: p.buttonHeights.small,
          paddingHorizontal: p.spacing[4],
          typography: p.typography['label-4'],
        },
        default: {
          height: p.buttonHeights.default,
          paddingHorizontal: p.spacing[7],
          typography: p.typography['label-2'],
        },
      },
    },
    dropdown: {
      bg: surfaceColor[1],
      borderColor: borderColor.tertiary,
      borderWidth: p.borderWidth[1],
      elevation: elevation[3],
      borderRadius: p.borderRadius.default,
      colorPrimary: textColor.primary,
      colorSecondary: textColor.quaternary,
      hover: {
        bg: backgroundColor.secondary,
      },
      footer: {
        bg: backgroundColor.secondary,
      },
    },
    hint: {
      states: {
        default: {
          color: textColor.tertiary,
        },
        error: {
          color: textColor.error,
        },
      },
      size: {
        default: {
          typography: p.typography['caption-2'],
        },
        compact: {
          typography: p.typography['caption-3'],
        },
      },
    },
    input: {
      global: {
        borderRadius: p.borderRadius.default,
        borderWidth: p.borderWidth[1],
        color: textColor.primary,
        placeholderColor: textColor.quaternary,
      },
      state: {
        default: {
          initial: {
            bg: backgroundColor.primary,
            border: borderColor.primary,
            elevation: inputFocus.none,
          },
          hover: {
            bg: backgroundColor.primary,
            border: borderColor.primaryHover,
            elevation: inputFocus.none,
          },
          focus: {
            bg: backgroundColor.primary,
            border: borderColor.secondary,
            elevation: inputFocus.default,
          },
        },
        error: {
          initial: {
            bg: backgroundColor.primary,
            border: borderColor.error,
            elevation: inputFocus.error,
          },
          hover: {
            bg: backgroundColor.primary,
            border: borderColor.errorHover,
            elevation: inputFocus.none,
          },
          focus: {
            bg: backgroundColor.primary,
            border: borderColor.error,
            elevation: inputFocus.error,
          },
        },
        disabled: {
          bg: backgroundColor.secondary,
          border: borderColor.primary,
          color: textColor.quaternary,
          placeholderColor: textColor.quaternary,
        },
      },
      size: {
        default: {
          height: p.inputHeights.default,
          typography: p.typography['body-3'],
        },
        compact: {
          height: p.inputHeights.compact,
          typography: p.typography['body-4'],
        },
      },
    },
    label: {
      states: {
        default: {
          color: textColor.primary,
        },
        error: {
          color: textColor.primary,
        },
      },
      size: {
        default: {
          typography: p.typography['label-4'],
        },
        compact: {
          typography: p.typography['caption-1'],
        },
      },
    },
    link: {
      color: textColor.accent,
    },
    linkButton: {
      variant: {
        default: {
          color: {
            text: {
              initial: textColor.accent,
              active: textColor.accentHover,
              hover: textColor.accentHover,
              disabled: textColor.quaternary,
            },
            icon: {
              initial: textColor.accent,
              active: textColor.accentHover,
              hover: textColor.accentHover,
              disabled: textColor.quaternary,
            },
          },
        },
        destructive: {
          color: {
            text: {
              initial: textColor.error,
              active: textColor.errorHover,
              hover: textColor.errorHover,
              disabled: textColor.quaternary,
            },
            icon: {
              initial: textColor.error,
              active: textColor.errorHover,
              hover: textColor.errorHover,
              disabled: textColor.quaternary,
            },
          },
        },
      },
      size: {
        default: {
          height: p.linkButtonHeights.default,
          typography: p.typography['label-2'],
        },
        compact: {
          height: p.linkButtonHeights.compact,
          typography: p.typography['label-3'],
        },
        tiny: {
          height: p.linkButtonHeights.tiny,
          typography: p.typography['label-4'],
        },
        xTiny: {
          height: p.linkButtonHeights.xTiny,
          typography: p.typography['caption-1'],
        },
        xxTiny: {
          height: p.linkButtonHeights.xxTiny,
          typography: p.typography['caption-3'],
        },
      },
    },
    radioSelect: {
      bg: surfaceColor[1],
      borderRadius: p.borderRadius.default,
      borderWidth: p.borderWidth[1],
      borderColor: borderColor.tertiary,
      color: textColor.primary,
      hover: {
        default: {
          bg: surfaceColor[3],
          borderColor: borderColor.primary,
          color: textColor.primary,
        },
        selected: {
          bg: surfaceColor[2],
          borderColor: borderColor.tertiary,
          color: textColor.primary,
        },
      },
      selected: {
        color: textColor.accent,
        bg: surfaceColor[1],
        borderColor: borderColor.secondary,
      },
      disabled: {
        color: textColor.quaternary,
        bg: surfaceColor[1],
        borderColor: borderColor.tertiary,
      },
      components: {
        icon: {
          bg: backgroundColor.secondary,
          hover: {
            bg: backgroundColor.senary,
          },
          selected: {
            bg: backgroundColor.accent,
          },
          disabled: {
            bg: backgroundColor.secondary,
          },
        },
      },
    },
  },
};

export default tokens;
