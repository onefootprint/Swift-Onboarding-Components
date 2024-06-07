import React from 'react';
import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';
import type { BannerVariant } from './banner.types';
import { createVariantStyles } from './banner.utils';

export type BannerProps = { children: React.ReactNode; variant: BannerVariant };
type StyledProps = { children: React.ReactNode; $variant: BannerVariant };

const Banner = ({ children, variant }: BannerProps) => <StyledDiv $variant={variant}>{children}</StyledDiv>;

const StyledDiv = styled.div.attrs<StyledProps>({
  role: 'alert',
})<StyledProps>`
  ${({ theme, $variant }) => css`
    ${createFontStyles('label-3')};
    ${createVariantStyles($variant)};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    text-align: center;
    width: 100%;

    button {
      ${createFontStyles('label-3')};
      background: unset;
      border: unset;
      cursor: pointer;
      text-decoration: underline;
    }

    a,
    button {
      @media (hover: hover) {
        &:hover {
          opacity: 0.7;
        }
      }

      &:active {
        opacity: 0.85;
      }
    }
  `};
`;

export default Banner;
