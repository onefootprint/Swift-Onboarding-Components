import { media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const BaseIllustration = styled.div`
  ${({ theme }) => css`
    position: relative;
    width: 100%;
    grid-area: image;
    height: 400px;
    overflow: hidden;
    border-radius: ${theme.borderRadius.default};
    margin-left: 0;
    z-index: 0;
    background-color: ${theme.backgroundColor.primary};
    box-shadow: ${theme.elevation[3]};
    border: 0.1px solid transparent;

    ${media.greaterThan('lg')`
      height: 553px;
    `};
  `}
`;

export default BaseIllustration;
