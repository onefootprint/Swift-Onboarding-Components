import { media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const HeaderContent = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing[5]} 0;
    min-height: ${theme.spacing[10]};

    ${media.greaterThan('md')`
      padding:  ${theme.spacing[4]} 0;
    `}
  `}
`;

export default HeaderContent;
