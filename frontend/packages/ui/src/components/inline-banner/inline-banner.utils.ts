import IcoClose24 from 'icons/ico/ico-close-24';
import IcoDotsHorizontal24 from 'icons/ico/ico-dots-horizontal-24';
import IcoInfo24 from 'icons/ico/ico-info-24';
import { css } from 'styled-components';
import type { BackgroundColor, BorderColor } from 'themes';

import type { InlineBannerVariant } from './inline-banner.types';

export const inlineBannerVariantStyles: Record<
  InlineBannerVariant,
  {
    backgroundColor: BackgroundColor;
    borderColor: BorderColor;
  }
> = {
  error: {
    backgroundColor: 'error',
    borderColor: 'error',
  },
  info: {
    backgroundColor: 'secondary',
    borderColor: 'tertiary',
  },
  warning: {
    backgroundColor: 'warning',
    borderColor: 'primary',
  },
};

export const getIconForVariant = (variant: InlineBannerVariant) => {
  if (variant === 'error') {
    return IcoClose24;
  }
  if (variant === 'warning') {
    // TODO: replace with the IcoWarning24 icon when we add it
    // https://linear.app/footprint/issue/FP-1070/add-icowarning24-and-other-inlinebanner-icons
    return IcoDotsHorizontal24;
  }
  return IcoInfo24;
};

export const createVariantStyles = (variant: InlineBannerVariant) => {
  const { backgroundColor, borderColor } = inlineBannerVariantStyles[variant];

  return css`
    ${({ theme }) => css`
      background-color: ${theme.backgroundColor[backgroundColor]};
      border: 1px solid ${theme.borderColor[borderColor]};
    `}
  `;
};
