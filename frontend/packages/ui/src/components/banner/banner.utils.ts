import type { BackgroundColor, Color } from '@onefootprint/design-tokens';
import { css } from 'styled-components';

import type { BannerVariant } from './banner.types';

export const bannerVariantStyles: Record<
  BannerVariant,
  {
    backgroundColor: BackgroundColor;
    color: Color;
    link: {
      color: Color;
    };
  }
> = {
  error: {
    backgroundColor: 'error',
    color: 'error',
    link: {
      color: 'error',
    },
  },
  info: {
    backgroundColor: 'info',
    color: 'info',
    link: {
      color: 'info',
    },
  },
  warning: {
    backgroundColor: 'warning',
    color: 'warning',
    link: {
      color: 'warning',
    },
  },
  announcement: {
    backgroundColor: 'primary',
    color: 'primary',
    link: {
      color: 'accent',
    },
  },
};

export const createVariantStyles = (variant: BannerVariant) => {
  const { backgroundColor, color, link } = bannerVariantStyles[variant];

  return css`
    ${({ theme }) => css`
      background-color: ${theme.backgroundColor[backgroundColor]};
      color: ${theme.color[color]};

      a,
      button {
        color: ${theme.color[link.color]};
      }
    `}
  `;
};
