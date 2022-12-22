import { media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const FeatureStack = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    grid-area: features;
    gap: ${theme.spacing[8]};
    align-self: baseline;
    height: 100%;
    padding: 0 ${theme.spacing[4]};
    height: fit-content;
    align-self: center;

    ${media.greaterThan('sm')`
        padding: ${theme.spacing[4]} ${theme.spacing[9]};
    `}
    ${media.greaterThan('md')`
        justify-content: center; 
        padding: 0;   
    `}
  `}
`;

export default FeatureStack;
