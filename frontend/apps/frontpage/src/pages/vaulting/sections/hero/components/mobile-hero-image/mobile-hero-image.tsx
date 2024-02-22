import { media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const DesktopHeroImage = styled.div`
  ${({ theme }) => css`
    display: block;
    position: relative;
    width: 100%;
    height: 430px;
    margin: auto;
    mask-mode: alpha;
    mask: radial-gradient(
      100% 100% at 0% 0%,
      black 0%,
      black 25%,
      transparent 100%
    );

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 200%;
      height: 400px;
      background: url('/vaulting/hero/dashboard-dark.png') no-repeat;
      background-size: cover;
      background-position: top left;
      border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      border-radius: ${theme.borderRadius.default};
    }

    ${media.greaterThan('md')`
        display: none;
    `}
  `}
`;

export default DesktopHeroImage;
