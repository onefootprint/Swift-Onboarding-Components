import { createFontStyles } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const NavigationSectionTitle = styled.header`
  ${({ theme }) => css`
    ${createFontStyles('label-4')}
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    text-transform: capitalize;
  `}
`;

export default NavigationSectionTitle;
