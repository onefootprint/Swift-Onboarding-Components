import type { BackgroundColor, Color } from '@onefootprint/design-tokens';
import { IcoInfo16, IcoWarning16 } from '@onefootprint/icons';
import { css } from 'styled-components';

import type { InlineAlertVariant } from './inline-alert.types';

export const inlineAlertVariantStyles: Record<
  InlineAlertVariant,
  {
    backgroundColor: BackgroundColor;
    color: Color;
  }
> = {
  error: {
    backgroundColor: 'error',
    color: 'error',
  },
  info: {
    backgroundColor: 'info',
    color: 'info',
  },
  warning: {
    backgroundColor: 'warning',
    color: 'warning',
  },
};

export const getIconForVariant = (variant: InlineAlertVariant) => {
  if (variant === 'error' || variant === 'warning') {
    return IcoWarning16;
  }
  return IcoInfo16;
};

export const createBackgroundStyles = (variant: InlineAlertVariant) => {
  const style = inlineAlertVariantStyles[variant];
  if (!style) {
    return '';
  }
  const { backgroundColor } = style;

  return css`
    ${({ theme }) => css`
      background-color: ${theme.backgroundColor[backgroundColor]};
    `}
  `;
};

export const createTextStyles = (variant: InlineAlertVariant) => {
  const style = inlineAlertVariantStyles[variant];
  if (!style) {
    return '';
  }
  const { color } = style;

  return css`
    ${({ theme }) => css`
      color: ${theme.color[color]};
    `}
  `;
};
