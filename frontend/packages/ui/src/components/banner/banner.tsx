import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BannerVariant } from './banner.types';
import { createVariantStyles } from './banner.utils';

export type BannerProps = {
  children: React.ReactNode;
  variant: BannerVariant;
};

const Banner = styled.div.attrs<BannerProps>({
  role: 'alert',
})<BannerProps>`
  ${({ theme, variant }) => css`
    ${createFontStyles('label-3')};
    ${createVariantStyles(variant)};
    padding: ${theme.spacing[4]}px ${theme.spacing[5]}px;
    text-align: center;
    width: 100%;

    a {
      &:hover {
        opacity: 0.7;
      }

      &:active {
        opacity: 0.85;
      }
    }
  `};
`;

export default Banner;
