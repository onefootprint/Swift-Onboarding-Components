import type { BackgroundColor, Color } from '@onefootprint/design-tokens';
import { IcoInfo24, IcoWarning24 } from '@onefootprint/icons';
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
    return IcoWarning24;
  }
  return IcoInfo24;
};

export const createVariantStyles = (variant: InlineAlertVariant) => {
  const style = inlineAlertVariantStyles[variant];
  if (!style) {
    return '';
  }
  const { backgroundColor, color } = style;

  return css`
    ${({ theme }) => css`
      background-color: ${theme.backgroundColor[backgroundColor]};
      color: ${theme.color[color]};
    `}
  `;
};
