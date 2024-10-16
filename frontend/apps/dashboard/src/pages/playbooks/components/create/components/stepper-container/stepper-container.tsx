import { media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const StepperContainer = styled.div`
  ${({ theme }) => css`
    display: none;
    
    ${media.greaterThan('lg')`
      display: block;
      position: absolute;
      top: ${theme.spacing[3]};
      left: ${theme.spacing[7]};
    `}
  `}
`;

export default StepperContainer;
