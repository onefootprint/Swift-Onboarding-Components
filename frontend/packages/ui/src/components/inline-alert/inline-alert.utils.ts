import IcoInfo24 from 'icons/ico/ico-info-24';
import IcoWarning24 from 'icons/ico/ico-warning-24';
import { css } from 'styled-components';
import type { BackgroundColor, Color } from 'themes';

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
    return IcoWarning24;
  }
  return IcoInfo24;
};

export const createVariantStyles = (variant: InlineAlertVariant) => {
  const { backgroundColor, color } = inlineAlertVariantStyles[variant];

  return css`
    ${({ theme }) => css`
      background-color: ${theme.backgroundColor[backgroundColor]};
      color: ${theme.color[color]};
    `}
  `;
};
