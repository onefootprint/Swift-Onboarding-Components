import * as p from '../../primitives';
import { elevationLight } from '../../primitives/elevation';
import type { Tokens } from '../../types/tokens';

export const backgroundColor = {
  primary: `${p.Gray0}`,
  secondary: `${p.Gray50}`,
  tertiary: `${p.BrandSleep800}`,
  quaternary: `${p.BrandThink500}`,
  quinary: `${p.BrandGo500}`,
  senary: `${p.Gray100}`,
  accent: `${p.Purple500}`,
  error: `${p.Red50}`,
  info: `${p.Blue50}`,
  success: `${p.Green50}`,
  warning: `${p.Yellow50}`,
  neutral: `${p.Gray50}`,
  active: `${p.Purple50}`,
  infoInverted: `${p.Blue600}`,
  successInverted: `${p.Green600}`,
  warningInverted: `${p.Yellow800}`,
  neutralInverted: `${p.Gray800}`,
  errorInverted: `${p.Red700}`,
  transparent: 'transparent',
};

export const primaryBtnBackgroundColor = {
  default: `${p.Purple500}`,
  hover: `${p.Purple700}`,
  active: `${p.Purple600}`,
  disabled: `${p.Purple300}`,
};

export const secondaryBtnBackgroundColor = {
  default: `${p.Gray0}`,
  hover: `${p.Gray50}`,
  active: `${p.Gray50}`,
  disabled: `${p.Gray0}`,
};

export const destructiveBtnBackgroundColor = {
  default: `${p.Red600}`,
  hover: `${p.Red700}`,
  active: `${p.Red600}`,
  disabled: `${p.Red300}`,
};

export const destructiveBtnBorderColor = {
  default: `${p.Red700}`,
  hover: `${p.Red700}`,
  active: `${p.Red700}`,
  disabled: `${p.Red400}`,
};

export const borderColor = {
  primary: `${p.Gray150}`,
  primaryHover: `${p.Gray300}`,
  secondary: `${p.Purple500}`,
  tertiary: `${p.Gray100}`,
  tertiaryHover: `${p.Gray200}`,
  error: `${p.Red500}`,
  errorHover: `${p.Red600}`,
  transparent: 'transparent',
};

export const textColor = {
  primary: `${p.Gray1000}`,
  secondary: `${p.Gray800}`,
  tertiary: `${p.Gray500}`,
  quaternary: `${p.Gray400}`,
  quinary: `${p.Gray0}`,
  senary: `${p.BrandThink500}`,
  septenary: `${p.BrandGo500}`,
  accent: `${p.Purple500}`,
  accentHover: `${p.Purple700}`,
  error: `${p.Red600}`,
  errorHover: `${p.Red700}`,
  info: `${p.Blue600}`,
  infoHover: `${p.Blue700}`,
  success: `${p.Green600}`,
  successHover: `${p.Green700}`,
  warning: `${p.Yellow800}`,
  warningHover: `${p.Yellow900}`,
  neutral: `${p.Gray800}`,
  successInverted: `${p.Green50}`,
  warningInverted: `${p.Yellow100}`,
  errorInverted: `${p.Red50}`,
  infoInverted: `${p.Blue50}`,
  neutralInverted: `${p.Gray50}`,
};

export const elevation = {
  0: `${elevationLight.flat}`,
  1: `${elevationLight.low}`,
  2: `${elevationLight.medium}`,
  3: `${elevationLight.high}`,
  4: `${elevationLight.extraHigh}`,
};

export const inputFocus = {
  none: 'none',
  default: '0px 0px 0px 4px rgba(74, 36, 219, 0.12);',
  error: '0px 0px 0px 4px rgba(191, 20, 10, 0.12);',
};

export const overlay = {
  default: 'rgba(0, 0, 0, 0.2)',
};

export const primaryBtnBoxShadow = {
  none: 'none',
  default: `0px 1px 2px 0px rgba(0, 0, 0, 0.12),
  inset 0px -1px 1px rgba(200, 200, 200, 0.2),
  inset 0px 1px 1px rgba(255, 255, 255, 0.2);`,
  hover: `0px 1px 1px 0px rgba(0, 0, 0, 0.12),
  inset 0px -1px 1px rgba(200, 200, 200, 0.12),
  inset 0px 1px 1px rgba(255, 255, 255, 0.3);`,
  active: `0px 1px 1px 0px rgba(0, 0, 0, 0.12),
  inset 0px -1px 1px rgba(200, 200, 200, 0.1),
  inset 0px 1px 1px rgba(255, 255, 255, 0.2);`,
  disabled: `0px 1px 2px 0px rgba(0, 0, 0, 0.12);`,
};

export const secondaryBtnBoxShadow = {
  none: 'none',
  default: `0px 1px 2px 0px rgba(0, 0, 0, 0.12);`,
  hover: `0px 1px 1px 0px rgba(0, 0, 0, 0.12);`,
  active: `0px 1px 1px 0px rgba(0, 0, 0, 0.12);`,
  disabled: `0px 1px 2px 0px rgba(0, 0, 0, 0.12);`,
};

const tokens: Tokens = {
  backgroundColor,
  primaryBtnBackgroundColor,
  secondaryBtnBackgroundColor,
  destructiveBtnBackgroundColor,
  borderColor,
  textColor,
  elevation,
  inputFocus,
  overlay,
  codeHighlight: {
    hljs: {
      display: 'block',
      overflowX: 'auto',
      padding: '0.5em',
      color: '#383a42',
      background: '#fafafa',
    },
    'hljs-comment': {
      color: '#a0a1a7',
      fontStyle: 'italic',
    },
    'hljs-quote': {
      color: '#a0a1a7',
      fontStyle: 'italic',
    },
    'hljs-doctag': {
      color: '#a626a4',
    },
    'hljs-keyword': {
      color: '#a626a4',
    },
    'hljs-formula': {
      color: '#a626a4',
    },
    'hljs-section': {
      color: '#e45649',
    },
    'hljs-name': {
      color: '#e45649',
    },
    'hljs-selector-tag': {
      color: '#e45649',
    },
    'hljs-deletion': {
      color: '#e45649',
    },
    'hljs-subst': {
      color: '#e45649',
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
      color: '#986801',
    },
    'hljs-variable': {
      color: '#986801',
    },
    'hljs-template-variable': {
      color: '#986801',
    },
    'hljs-type': {
      color: '#986801',
    },
    'hljs-selector-class': {
      color: '#986801',
    },
    'hljs-selector-attr': {
      color: '#986801',
    },
    'hljs-selector-pseudo': {
      color: '#986801',
    },
    'hljs-number': {
      color: '#986801',
    },
    'hljs-symbol': {
      color: '#4078f2',
    },
    'hljs-bullet': {
      color: '#4078f2',
    },
    'hljs-link': {
      color: '#4078f2',
      textDecoration: 'underline',
    },
    'hljs-meta': {
      color: '#4078f2',
    },
    'hljs-selector-id': {
      color: '#4078f2',
    },
    'hljs-title': {
      color: '#4078f2',
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
        borderRadius: p.borderRadius.sm,
        color: textColor.primary,
        padding: p.spacing[5],
      },
      container: {
        bg: backgroundColor.primary,
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
            color: textColor.quinary,
            borderColor: borderColor.secondary,
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
            boxShadow: secondaryBtnBoxShadow.hover,
          },
          active: {
            bg: secondaryBtnBackgroundColor.active,
            color: textColor.primary,
            borderColor: borderColor.primary,
            boxShadow: secondaryBtnBoxShadow.active,
          },
          loading: {
            bg: secondaryBtnBackgroundColor.default,
            color: textColor.primary,
          },
          disabled: {
            bg: secondaryBtnBackgroundColor.disabled,
            color: textColor.quaternary,
            borderColor: borderColor.tertiary,
            boxShadow: secondaryBtnBoxShadow.disabled,
          },
        },
        destructive: {
          bg: destructiveBtnBackgroundColor.default,
          color: textColor.quinary,
          borderColor: destructiveBtnBorderColor.default,
          boxShadow: primaryBtnBoxShadow.default,
          hover: {
            bg: destructiveBtnBackgroundColor.hover,
            color: textColor.quinary,
            borderColor: destructiveBtnBorderColor.hover,
            boxShadow: primaryBtnBoxShadow.hover,
          },
          active: {
            bg: destructiveBtnBackgroundColor.active,
            color: textColor.quinary,
            borderColor: destructiveBtnBorderColor.active,
            boxShadow: primaryBtnBoxShadow.active,
          },
          loading: {
            bg: destructiveBtnBackgroundColor.default,
            color: textColor.quinary,
          },
          disabled: {
            bg: destructiveBtnBackgroundColor.disabled,
            color: textColor.quaternary,
            borderColor: destructiveBtnBorderColor.disabled,
            boxShadow: primaryBtnBoxShadow.disabled,
          },
        },
      },
      size: {
        large: {
          height: p.buttonHeights.large,
          paddingHorizontal: p.spacing[7],
          typography: {
            fontSize: p.typography['label-3'].fontSize,
            fontWeight: p.typography['label-3'].fontWeight,
            lineHeight: p.typography['label-3'].lineHeight,
          },
        },
        default: {
          height: p.buttonHeights.default,
          paddingHorizontal: p.spacing[4],
          typography: p.typography['label-4'],
        },
        compact: {
          height: p.buttonHeights.compact,
          paddingHorizontal: p.spacing[3],
          typography: p.typography['label-4'],
        },
      },
    },
    dropdown: {
      bg: backgroundColor.primary,
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
          border: borderColor.tertiary,
          color: textColor.tertiary,
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
    radioSelect: {
      bg: backgroundColor.primary,
      borderRadius: p.borderRadius.default,
      borderWidth: p.borderWidth[1],
      borderColor: borderColor.tertiary,
      color: textColor.primary,
      hover: {
        initial: {
          bg: backgroundColor.primary,
          borderColor: borderColor.tertiary,
          color: textColor.primary,
        },
        selected: {
          bg: backgroundColor.primary,
          borderColor: borderColor.tertiary,
          color: textColor.accent,
        },
      },
      selected: {
        color: textColor.accent,
        bg: backgroundColor.primary,
        borderColor: borderColor.secondary,
      },
      disabled: {
        color: textColor.quaternary,
        bg: backgroundColor.primary,
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
