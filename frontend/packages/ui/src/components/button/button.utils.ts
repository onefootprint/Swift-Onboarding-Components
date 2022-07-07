import { css } from 'styled-components';
import type {
  BackgroundColor,
  BorderColor,
  Color,
  FontVariant,
  Overlay,
  Spacing,
} from 'themes';

import { createFontStyles, createOverlayBackground } from '../../utils/mixins';
import type { ButtonSize, ButtonVariant } from './button.types';

export const buttonSizes = ['default', 'small', 'compact', 'large'];

export const buttonVariantStyles: Record<
  ButtonVariant,
  {
    activeBackgroundColor: Overlay;
    backgroundColor: BackgroundColor;
    borderColor: BorderColor;
    color: Color;
    hoverBackgroundColor: Overlay;
    disabled: {
      backgroundColor: BackgroundColor;
      color: Color;
    };
  }
> = {
  primary: {
    activeBackgroundColor: 'lighten-2',
    backgroundColor: 'tertiary',
    borderColor: 'transparent',
    color: 'quinary',
    hoverBackgroundColor: 'lighten-1',
    disabled: {
      backgroundColor: 'neutral',
      color: 'quaternary',
    },
  },
  secondary: {
    activeBackgroundColor: 'darken-2',
    backgroundColor: 'primary',
    borderColor: 'primary',
    color: 'primary',
    hoverBackgroundColor: 'darken-1',
    disabled: {
      backgroundColor: 'primary',
      color: 'quaternary',
    },
  },
};

export const createVariantStyles = (variant: ButtonVariant) => {
  const {
    activeBackgroundColor,
    backgroundColor,
    borderColor,
    color,
    hoverBackgroundColor,
    disabled,
  } = buttonVariantStyles[variant];

  return css`
    ${({ theme }) => css`
      background-color: ${theme.backgroundColor[backgroundColor]};
      border: ${theme.borderWidth[1]}px solid ${theme.borderColor[borderColor]};
      color: ${theme.color[color]};

      &:disabled {
        background-color: ${theme.backgroundColor[disabled.backgroundColor]};
        color: ${theme.color[disabled.color]};
      }

      &:hover:enabled {
        ${createOverlayBackground(hoverBackgroundColor, backgroundColor)}
      }

      &:active:enabled {
        ${createOverlayBackground(activeBackgroundColor, backgroundColor)}
      }
    `}
  `;
};

const buttonSizeStyles: Record<
  ButtonSize,
  {
    fontVariant: FontVariant;
    height: number;
    paddingX: Spacing;
  }
> = {
  small: {
    fontVariant: 'label-4',
    height: 28,
    paddingX: 7,
  },
  compact: {
    fontVariant: 'label-3',
    height: 40,
    paddingX: 7,
  },
  default: {
    fontVariant: 'label-2',
    height: 48,
    paddingX: 7,
  },
  large: {
    fontVariant: 'label-1',
    height: 60,
    paddingX: 4,
  },
};

export const createSizeStyles = (size: ButtonSize) => {
  const { fontVariant, height, paddingX } = buttonSizeStyles[size];

  return css`
    ${({ theme }) => css`
      ${createFontStyles(fontVariant)};
      height: ${height}px;
      padding: 0 ${theme.spacing[paddingX]}px;
    `}
  `;
};

export const createFullWidthStyles = (isFullWidth?: boolean) => {
  if (isFullWidth) {
    return css`
      width: 100%;
    `;
  }
  return css``;
};

export const createLoadingStyles = (isLoading?: boolean) => {
  if (isLoading) {
    return css`
      pointer-events: none;
    `;
  }
  return css``;
};
