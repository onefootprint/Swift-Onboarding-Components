import styled, { css } from 'styled-components';

import { createFontStyles } from '../../utils/mixins';

export type BannerProps = {
  children: React.ReactNode;
  variant: 'error' | 'warning' | 'info';
};

const Banner = styled.div.attrs<BannerProps>({
  role: 'alert',
})<BannerProps>`
  ${({ theme, variant }) => css`
    ${createFontStyles('body-3')};
    background-color: ${theme.backgroundColor[variant]};
    color: ${theme.color[variant]};
    padding: ${theme.spacing[4]}px ${theme.spacing[5]}px;
    text-align: center;
    width: 100%;

    a {
      color: ${theme.color[variant]};

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
