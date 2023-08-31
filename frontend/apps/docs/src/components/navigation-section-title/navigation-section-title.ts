import styled, { css } from '@onefootprint/styled';
import { createFontStyles } from '@onefootprint/ui';

const NavigationSectionTitle = styled.header`
  ${({ theme }) => css`
    ${createFontStyles('label-4')}
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    text-transform: capitalize;
  `}
`;

export default NavigationSectionTitle;
